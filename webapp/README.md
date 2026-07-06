# Webapp — Back-office IA personnel

Application Next.js (App Router) privée : agent IA (Claude), pipeline multi-modele (Groq -> Claude -> Gemini), suivi de finances et de taches avec assistance IA. Usage personnel uniquement — pas destinee a des visiteurs publics.

## Pages

- `/admin/agent` — agent simple (Claude + recherche web) ou pipeline multi-agent (Groq -> Claude -> Gemini), au choix via un selecteur
- `/admin/finances` — suivi de transactions + analyse IA
- `/admin/taches` — suivi de taches/projets + enrichissement par recherche web IA
- `/admin/commissions` — suivi des commissions par agent + repartition du profil, pour une date donnee
- `/admin/mouvements` — mouvements de fonds mensuels (entrant / sortant / balance)
- `/admin/rapport` — rapport IA de fin de journee, genere a partir des finances/commissions/mouvements du jour

Chaque page/route demande un mot de passe (`ADMIN_SECRET`), envoye via le header `x-admin-secret`.

## Variables d'environnement requises

A definir dans `.env.local` (developpement) et dans Vercel → Settings → Environment Variables (production) :

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
GROQ_API_KEY=
GEMINI_API_KEY=
ADMIN_SECRET=
```

`SUPABASE_SERVICE_ROLE_KEY` est une cle secrete a privileges eleves : ne jamais l'exposer cote client, ne jamais la committer.

## Base de donnees (Supabase)

Tables necessaires : `transactions` et `taches` (`supabase/migrations/001...` si present, sinon voir historique), puis `commission_lignes`, `commission_profil_lignes`, `commission_manuel`, `mouvements_lignes` et `rapports_ia` — a creer en executant `supabase/migrations/002_commissions_mouvements_rapports.sql` dans Supabase → SQL Editor.

```sql
create table transactions (
  id bigint generated always as identity primary key,
  date date not null default current_date,
  categorie text not null,
  description text,
  montant numeric not null,
  type text not null check (type in ('revenu', 'depense')),
  created_at timestamptz not null default now()
);

create table taches (
  id bigint generated always as identity primary key,
  titre text not null,
  projet text,
  statut text not null default 'a_faire' check (statut in ('a_faire', 'en_cours', 'termine')),
  echeance date,
  notes_ia text,
  created_at timestamptz not null default now()
);
```

Voir `supabase/migrations/002_commissions_mouvements_rapports.sql` pour le schema des commissions, mouvements de fonds et rapports IA.

## Developpement local

```bash
npm install
npm run dev
```

## Build de production

```bash
npm run build
npm start
```
