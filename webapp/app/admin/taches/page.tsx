'use client';

import { useState } from 'react';

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
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '1rem' }}>
      <h1>Taches / Projets</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="password"
          placeholder="Mot de passe admin"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        <button onClick={charger}>Charger</button>
      </div>

      <form onSubmit={ajouter} style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', flexWrap: 'wrap' }}>
        <input
          placeholder="Titre"
          value={form.titre}
          onChange={(e) => setForm({ ...form, titre: e.target.value })}
          required
        />
        <input
          placeholder="Projet"
          value={form.projet}
          onChange={(e) => setForm({ ...form, projet: e.target.value })}
        />
        <input type="date" value={form.echeance} onChange={(e) => setForm({ ...form, echeance: e.target.value })} />
        <button type="submit">Ajouter</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {taches.map((t) => (
        <div key={t.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem' }}>
          <strong>{t.titre}</strong> {t.projet && `(${t.projet})`}
          {t.echeance && ` — echeance: ${t.echeance}`}
          <div style={{ margin: '0.5rem 0' }}>
            <select value={t.statut} onChange={(e) => changerStatut(t.id, e.target.value)}>
              <option value="a_faire">A faire</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Termine</option>
            </select>
            <button
              onClick={() => enrichir(t.id)}
              disabled={enrichissementEnCours === t.id}
              style={{ marginLeft: '0.5rem' }}
            >
              {enrichissementEnCours === t.id ? 'Recherche...' : 'Enrichir (recherche web)'}
            </button>
            <button onClick={() => supprimer(t.id)} style={{ marginLeft: '0.5rem' }}>
              Suppr.
            </button>
          </div>
          {t.notes_ia && (
            <details>
              <summary>Notes IA</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{t.notes_ia}</pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
