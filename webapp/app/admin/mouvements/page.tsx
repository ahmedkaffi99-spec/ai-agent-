'use client';

import { useState } from 'react';
import * as s from '@/lib/styles';

type Ligne = { id: number; libelle: string; montant: number };
type Section = 'entrant' | 'sortant' | 'balance';

function moisCourant() {
  return new Date().toISOString().slice(0, 7);
}

const titres: Record<Section, string> = {
  entrant: 'Entrant',
  sortant: 'Sortant',
  balance: 'Balance',
};

export default function MouvementsPage() {
  const [secret, setSecret] = useState('');
  const [mois, setMois] = useState(moisCourant());
  const [lignes, setLignes] = useState<Record<Section, Ligne[]>>({ entrant: [], sortant: [], balance: [] });
  const [error, setError] = useState('');
  const [nouveaux, setNouveaux] = useState<Record<Section, { libelle: string; montant: string }>>({
    entrant: { libelle: '', montant: '' },
    sortant: { libelle: '', montant: '' },
    balance: { libelle: '', montant: '' },
  });

  const headers = { 'x-admin-secret': secret, 'Content-Type': 'application/json' };

  async function charger() {
    setError('');
    const res = await fetch(`/api/mouvements?mois=${mois}`, { headers: { 'x-admin-secret': secret } });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setLignes({ entrant: data.entrant, sortant: data.sortant, balance: data.balance });
  }

  async function ajouter(section: Section, e: React.FormEvent) {
    e.preventDefault();
    const n = nouveaux[section];
    await fetch('/api/mouvements', {
      method: 'POST',
      headers,
      body: JSON.stringify({ mois, section, libelle: n.libelle, montant: parseFloat(n.montant) || 0 }),
    });
    setNouveaux({ ...nouveaux, [section]: { libelle: '', montant: '' } });
    charger();
  }

  async function supprimer(id: number) {
    await fetch('/api/mouvements', { method: 'DELETE', headers, body: JSON.stringify({ id }) });
    charger();
  }

  function total(section: Section) {
    return lignes[section].reduce((a, l) => a + Number(l.montant), 0);
  }

  function renderSection(section: Section) {
    const n = nouveaux[section];
    return (
      <div style={s.card} key={section}>
        <h2 style={{ marginTop: 0 }}>{titres[section]}</h2>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Libelle</th>
              <th style={s.th}>Montant</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {lignes[section].map((l) => (
              <tr key={l.id}>
                <td style={s.td}>{l.libelle}</td>
                <td style={s.td}>{Number(l.montant).toLocaleString('fr-FR')}</td>
                <td style={s.td}><button style={s.buttonSecondary} onClick={() => supprimer(l.id)}>Suppr.</button></td>
              </tr>
            ))}
            <tr style={s.totalRow}>
              <td style={s.td}>Total</td>
              <td style={s.td}>{total(section).toLocaleString('fr-FR')}</td>
              <td style={s.td}></td>
            </tr>
          </tbody>
        </table>
        <form onSubmit={(e) => ajouter(section, e)} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <input
            style={{ ...s.input, width: 180 }}
            placeholder="Libelle"
            value={n.libelle}
            onChange={(e) => setNouveaux({ ...nouveaux, [section]: { ...n, libelle: e.target.value } })}
            required
          />
          <input
            style={{ ...s.input, width: 120 }}
            type="number"
            placeholder="Montant"
            value={n.montant}
            onChange={(e) => setNouveaux({ ...nouveaux, [section]: { ...n, montant: e.target.value } })}
          />
          <button style={s.button} type="submit">Ajouter</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '2rem auto', padding: '1rem' }}>
      <h1>Mouvements de fonds</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input type="password" placeholder="Mot de passe admin" value={secret} onChange={(e) => setSecret(e.target.value)} />
        <input type="month" value={mois} onChange={(e) => setMois(e.target.value)} />
        <button style={s.button} onClick={charger}>Charger</button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {renderSection('entrant')}
      {renderSection('sortant')}
      {renderSection('balance')}
    </div>
  );
}
