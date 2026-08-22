"""Multi-agent avec CrewAI — version terminal (equivalent de crewai_multi_agent.ipynb).

Pipeline sequentiel a 3 agents, chacun sur un modele different :
- Chercheur (Groq, tres rapide) : rassemble des faits bruts sur un sujet.
- Redacteur (Claude) : reprend ces faits et redige une reponse structuree.
- Relecteur (Gemini) : relit, corrige et peaufine la sortie finale.

Installation :
    pip install "crewai[anthropic,google-genai]" litellm requests

Cles API (variables d'environnement ou saisie interactive si absentes) :
    ANTHROPIC_API_KEY, GROQ_API_KEY, GEMINI_API_KEY
    TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (optionnelles, pour l'envoi Telegram)

Usage :
    python crewai_multi_agent.py "mon sujet"
    python crewai_multi_agent.py "mon sujet" --telegram
"""

import argparse
import os
import sys
import time
from getpass import getpass
from typing import Optional

try:
    import requests
except ImportError:
    sys.exit(
        "Le package 'requests' est requis. Installe-le avec :\n"
        "    pip install requests"
    )

try:
    from crewai import LLM, Agent, Crew, Process, Task
except ImportError:
    sys.exit(
        "Le package 'crewai' (avec extras) est requis. Installe-le avec :\n"
        '    pip install "crewai[anthropic,google-genai]" litellm'
    )

SUJET_PAR_DEFAUT = (
    "les avantages et inconvenients de l'energie solaire pour une maison "
    "individuelle en France"
)

TELEGRAM_MAX_LEN = 4000  # Telegram limite chaque message a 4096 caracteres
TELEGRAM_TIMEOUT = 15  # secondes
TELEGRAM_MAX_RETRIES = 3


class ConfigError(Exception):
    """Cle API manquante ou saisie invalide."""


def get_key(env_name: str, prompt: str) -> str:
    """Recupere une cle API depuis l'environnement, ou la demande a l'utilisateur.

    Leve ConfigError si la cle reste vide (saisie vide, ou entree non-interactive
    sans variable d'environnement definie).
    """
    key = os.environ.get(env_name, '').strip()
    if key:
        return key

    try:
        key = getpass(prompt).strip()
    except (EOFError, KeyboardInterrupt) as exc:
        raise ConfigError(
            f"{env_name} n'est pas defini et aucune entree interactive n'est disponible. "
            f"Definis la variable d'environnement {env_name}."
        ) from exc

    if not key:
        raise ConfigError(f"{env_name} ne peut pas etre vide.")

    os.environ[env_name] = key
    return key


def patch_cache_breakpoint_bug() -> None:
    """Neutralise l'injection du champ 'cache_breakpoint' dans les messages,
    qui fait planter les fournisseurs autres qu'Anthropic (ex: Groq).
    Bug connu de CrewAI, non corrige : https://github.com/crewAIInc/crewAI/issues/5886
    """
    try:
        import crewai.llms.cache as _crewai_cache
    except ImportError:
        return  # structure interne differente selon la version, on ignore silencieusement

    _crewai_cache.mark_cache_breakpoint = lambda msg: msg


def construire_crew(sujet: str, groq_key: str, anthropic_key: str, gemini_key: str) -> Crew:
    groq_llm = LLM(model='groq/llama-3.1-8b-instant', api_key=groq_key)
    claude_llm = LLM(model='anthropic/claude-haiku-4-5', api_key=anthropic_key)
    gemini_llm = LLM(model='gemini/gemini-2.5-flash', api_key=gemini_key)

    chercheur = Agent(
        role='Chercheur',
        goal="Rassembler rapidement des faits precis et pertinents sur le sujet demande",
        backstory="Tu es un chercheur efficace qui produit des listes de faits bruts, sans fioritures.",
        llm=groq_llm,
        verbose=True,
    )

    redacteur = Agent(
        role='Redacteur',
        goal="Transformer des faits bruts en une reponse claire, structuree et bien ecrite",
        backstory="Tu es un redacteur rigoureux qui organise l'information de facon pedagogique.",
        llm=claude_llm,
        verbose=True,
    )

    relecteur = Agent(
        role='Relecteur',
        goal="Relire un texte, corriger les erreurs et l'ameliorer sans en changer le sens",
        backstory="Tu es un relecteur exigeant qui verifie la clarte, la coherence et l'orthographe.",
        llm=gemini_llm,
        verbose=True,
    )

    tache_recherche = Task(
        description=f"Liste 5 a 8 faits factuels et verifiables sur : {sujet}. Format : liste a puces, une phrase par fait.",
        expected_output="Une liste a puces de faits bruts.",
        agent=chercheur,
    )

    tache_redaction = Task(
        description=(
            "A partir des faits fournis par le chercheur, redige une reponse structuree en 3 parties : "
            "avantages, inconvenients, et une recommandation finale en une phrase."
        ),
        expected_output="Une reponse structuree en 3 parties (avantages / inconvenients / recommandation).",
        agent=redacteur,
        context=[tache_recherche],
    )

    tache_relecture = Task(
        description=(
            "Relis le texte redige. Corrige toute erreur factuelle, de grammaire ou de clarte, "
            "sans changer la structure en 3 parties. Produis la version finale, prete a etre publiee."
        ),
        expected_output="La version finale corrigee et peaufinee du texte, en 3 parties.",
        agent=relecteur,
        context=[tache_redaction],
    )

    return Crew(
        agents=[chercheur, redacteur, relecteur],
        tasks=[tache_recherche, tache_redaction, tache_relecture],
        process=Process.sequential,
        verbose=True,
    )


def send_telegram_message(token: str, chat_id: str, text: str) -> None:
    """Envoie le texte sur Telegram, en le decoupant si besoin.

    Leve requests.exceptions.RequestException si l'envoi echoue apres retries
    (reseau instable), ou immediatement pour une erreur non transitoire
    (ex: token/chat_id invalide -> 400/401/403).
    """
    url = f'https://api.telegram.org/bot{token}/sendMessage'

    for i in range(0, len(text), TELEGRAM_MAX_LEN):
        chunk = text[i:i + TELEGRAM_MAX_LEN]
        derniere_erreur: Optional[Exception] = None

        for tentative in range(1, TELEGRAM_MAX_RETRIES + 1):
            try:
                response = requests.post(
                    url,
                    data={'chat_id': chat_id, 'text': chunk},
                    timeout=TELEGRAM_TIMEOUT,
                )
            except requests.exceptions.RequestException as exc:
                derniere_erreur = exc
            else:
                if response.status_code in (400, 401, 403):
                    raise requests.exceptions.RequestException(
                        f"Telegram a refuse l'envoi (HTTP {response.status_code}) : "
                        f"verifie TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID. Reponse : {response.text}"
                    )
                if response.ok:
                    derniere_erreur = None
                    break
                derniere_erreur = requests.exceptions.RequestException(
                    f"Telegram a repondu HTTP {response.status_code} : {response.text}"
                )

            if tentative < TELEGRAM_MAX_RETRIES:
                time.sleep(2 ** (tentative - 1))  # backoff : 1s, 2s

        if derniere_erreur is not None:
            raise derniere_erreur


def main() -> int:
    parser = argparse.ArgumentParser(description="Pipeline multi-agent CrewAI (Groq -> Claude -> Gemini).")
    parser.add_argument('sujet', nargs='?', default=SUJET_PAR_DEFAUT, help="Sujet a traiter par la crew.")
    parser.add_argument('--telegram', action='store_true', help="Envoyer le resultat final sur Telegram.")
    args = parser.parse_args()

    try:
        anthropic_key = get_key('ANTHROPIC_API_KEY', 'Entre ta cle API Anthropic: ')
        groq_key = get_key('GROQ_API_KEY', 'Entre ta cle API Groq: ')
        gemini_key = get_key('GEMINI_API_KEY', 'Entre ta cle API Gemini: ')
        if args.telegram:
            telegram_token = get_key('TELEGRAM_BOT_TOKEN', 'Entre le token de ton bot Telegram: ')
            telegram_chat_id = get_key('TELEGRAM_CHAT_ID', 'Entre ton chat_id Telegram: ')
    except ConfigError as exc:
        print(f"Erreur de configuration : {exc}", file=sys.stderr)
        return 1

    patch_cache_breakpoint_bug()

    crew = construire_crew(args.sujet, groq_key, anthropic_key, gemini_key)

    try:
        resultat = crew.kickoff()
    except KeyboardInterrupt:
        print('\nInterrompu par l\'utilisateur.', file=sys.stderr)
        return 130
    except Exception as exc:
        print(f"Echec du pipeline CrewAI : {exc}", file=sys.stderr)
        return 1

    print('\n=== Reponse finale ===')
    print(resultat)

    if args.telegram:
        resultat_text = getattr(resultat, 'raw', None) or str(resultat)
        try:
            send_telegram_message(telegram_token, telegram_chat_id, resultat_text)
        except requests.exceptions.RequestException as exc:
            print(f"Echec de l'envoi Telegram : {exc}", file=sys.stderr)
            return 1
        print('Resultat envoye sur Telegram !')

    return 0


if __name__ == '__main__':
    sys.exit(main())
