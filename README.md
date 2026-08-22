# ai-agent-

## Test d'un AI Agent sur Google Colab

Ce dépôt contient un notebook de démonstration pour tester un agent IA (avec tool use) directement dans Google Colab.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ahmedkaffi99-spec/ai-agent-/blob/claude/ai-agent-colab-test-k3sro4/ai_agent_colab_test.ipynb)

### Utilisation

1. Clique sur le badge ci-dessus pour ouvrir le notebook dans Google Colab.
2. Exécute les cellules dans l'ordre.
3. Renseigne ta clé API Anthropic quand elle est demandée (obtenue sur https://console.anthropic.com/).
4. Observe l'agent utiliser un outil de calcul pour répondre aux questions posées.

## Script terminal : pipeline multi-agent CrewAI

`crewai_multi_agent.py` est l'équivalent en script Python (sans notebook) de
`crewai_multi_agent.ipynb` : un pipeline séquentiel Chercheur (Groq) →
Rédacteur (Claude) → Relecteur (Gemini).

```bash
pip install "crewai[anthropic,google-genai]" litellm requests
python crewai_multi_agent.py "mon sujet"
python crewai_multi_agent.py "mon sujet" --telegram   # envoie aussi le resultat sur Telegram
```

Clés API attendues en variables d'environnement (sinon saisie interactive) :
`ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, et si `--telegram` :
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
