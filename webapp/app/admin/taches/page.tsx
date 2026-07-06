'use client';

import { useState } from 'react';
import * as s from '@/lib/styles';

type Tache = {
  id: number;
  titre: string;
  projet: string | null;
  statut: 'a_faire' | 'en_cours' | 'termine';
  echeance: string | null;
  notes_ia: string | null;
};

export default function TachesPage() {
  const [secret, setSecret] = useState('');
  const [taches, setTaches] = useState<Tache[]>([]);
  const [form, setForm] = useState({ titre: '', projet: '', echeance: '' });
  const [error, setError] = useState('');
  const [enrichissementEnCours, setEnrichissementEnCours] = useState<number | null>(null);

  async function charger() {
    setError('');
    const res = await fetch('/api/taches', { headers: { 'x-admin-secret': secret } });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else setTaches(data.taches);
  }

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/taches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else {
      setForm({ titre: '', projet: '', echeance: '' });
      charger();
    }
  }

  async function changerStatut(id: number, statut: string) {
    await fetch('/api/taches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id, statut }),
    });
    charger();
  }

  async function supprimer(id: number) {
    await fetch('/api/taches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id }),
    });
    charger();
  }

  async function enrichir(id: number) {
    setEnrichissementEnCours(id);
    await fetch('/api/taches/enrichir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id }),
    });
    setEnrichissementEnCours(null);
    charger();
  }

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Taches / Projets</h1>
      <p style={s.pageSubtitle}>Suivi de taches avec enrichissement par recherche web IA.</p>

      <div style={s.toolbar}>
        <input
          style={{ ...s.input, width: 200 }}
          type="password"
          placeholder="Mot de passe admin"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        <button style={s.button} onClick={charger}>Charger</button>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Nouvelle tache</h2>
        <form onSubmit={ajouter} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            style={{ ...s.input, width: 220 }}
            placeholder="Titre"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            required
          />
          <input
            style={{ ...s.input, width: 180 }}
            placeholder="Projet"
            value={form.projet}
            onChange={(e) => setForm({ ...form, projet: e.target.value })}
          />
          <input style={{ ...s.input, width: 150 }} type="date" value={form.echeance} onChange={(e) => setForm({ ...form, echeance: e.target.value })} />
          <button style={s.button} type="submit">Ajouter</button>
        </form>
      </div>

      {error && <p style={s.errorText}>{error}</p>}

      {taches.map((t) => (
        <div key={t.id} style={s.card}>
          <strong>{t.titre}</strong> {t.projet && `(${t.projet})`}
          {t.echeance && ` — echeance: ${t.echeance}`}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0.6rem 0' }}>
            <select style={{ ...s.select, width: 150 }} value={t.statut} onChange={(e) => changerStatut(t.id, e.target.value)}>
              <option value="a_faire">A faire</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Termine</option>
            </select>
            <button
              style={s.buttonSecondary}
              onClick={() => enrichir(t.id)}
              disabled={enrichissementEnCours === t.id}
            >
              {enrichissementEnCours === t.id ? 'Recherche...' : 'Enrichir (recherche web)'}
            </button>
            <button style={s.buttonDanger} onClick={() => supprimer(t.id)}>
              Suppr.
            </button>
          </div>
          {t.notes_ia && (
            <details>
              <summary>Notes IA</summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{t.notes_ia}</pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
