# Webapp — Back-office IA personnel

Application Next.js (App Router) privée pour le suivi d'une activite de commissions (agents/wakiil) : bulletin de commissions, mouvements de fonds, et rapport IA quotidien. Usage personnel uniquement — pas destinee a des visiteurs publics.

## Pages

- `/admin/commissions` — bulletin de commissions par agent (commission, retenue, net, paye, solde du) + repartition du profit, pour une date donnee
- `/admin/mouvements` — mouvements de fonds mensuels (entrant / sortant / balance)
- `/admin/rapport` — rapport IA de fin de journee, genere par Claude a partir des commissions/mouvements du jour

Chaque page/route demande un mot de passe (`ADMIN_SECRET`), envoye via le header `x-admin-secret`.

## Variables d'environnement requises

A definir dans `.env.local` (developpement) et dans Vercel → Settings → Environment Variables (production) :

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
ADMIN_SECRET=
```

`SUPABASE_SERVICE_ROLE_KEY` est une cle secrete a privileges eleves : ne jamais l'exposer cote client, ne jamais la committer.

## Base de donnees (Supabase)

Tables necessaires : `commission_lignes`, `commission_profil_lignes`, `commission_manuel`, `mouvements_lignes` et `rapports_ia` — creees en executant `supabase/migrations/002_commissions_mouvements_rapports.sql` dans Supabase → SQL Editor.

Voir ce fichier pour le schema complet.

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
