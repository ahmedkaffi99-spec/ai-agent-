-- Commissions par agent, pour une date donnee (ex: "commission du 3 juillet")
create table commission_lignes (
  id bigint generated always as identity primary key,
  date date not null,
  agent text not null,
  commission numeric not null default 0,
  paye numeric not null default 0,
  non_paye numeric not null default 0,
  retrait numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Repartition du profil (part de la maison) pour une date donnee
create table commission_profil_lignes (
  id bigint generated always as identity primary key,
  date date not null,
  libelle text not null,
  montant numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Champs saisis manuellement par date : commission cumulee, charges, balance
create table commission_manuel (
  date date primary key,
  commission_global numeric not null default 0,
  charges numeric not null default 0,
  balance numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- Mouvements de fonds mensuels : une ligne par entree/sortie/poste de balance
create table mouvements_lignes (
  id bigint generated always as identity primary key,
  mois text not null, -- format 'YYYY-MM'
  section text not null check (section in ('entrant', 'sortant', 'balance')),
  libelle text not null,
  montant numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Rapports IA de fin de journee (un par date)
create table rapports_ia (
  date date primary key,
  contenu text not null,
  created_at timestamptz not null default now()
);

create index commission_lignes_date_idx on commission_lignes (date);
create index commission_profil_lignes_date_idx on commission_profil_lignes (date);
create index mouvements_lignes_mois_idx on mouvements_lignes (mois, section);
