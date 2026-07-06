'use client';

import { useState } from 'react';
import * as s from '@/lib/styles';

function aujourdHui() {
  return new Date().toISOString().slice(0, 10);
}

export default function RapportPage() {
  const [secret, setSecret] = useState('');
  const [date, setDate] = useState(aujourdHui());
  const [historique, setHistorique] = useState<{ date: string }[]>([]);
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function charger(d: string) {
    setError('');
    const res = await fetch(`/api/rapport?date=${d}`, { headers: { 'x-admin-secret': secret } });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setHistorique(data.historique);
    setContenu(data.rapport?.contenu ?? '');
  }

  async function generer() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/rapport', {
      method: 'POST',
      headers: { 'x-admin-secret': secret, 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else {
      setContenu(data.rapport.contenu);
      charger(date);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
      <h1>Rapport IA de fin de journee</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input type="password" placeholder="Mot de passe admin" value={secret} onChange={(e) => setSecret(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button style={s.buttonSecondary} onClick={() => charger(date)}>Charger</button>
        <button style={s.button} onClick={generer} disabled={loading}>
          {loading ? 'Generation...' : 'Generer le rapport'}
        </button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {contenu && (
        <div style={s.card}>
          <h2 style={{ marginTop: 0 }}>Rapport du {date}</h2>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{contenu}</div>
        </div>
      )}

      {historique.length > 0 && (
        <div style={s.card}>
          <h2 style={{ marginTop: 0 }}>Historique</h2>
          <ul>
            {historique.map((h) => (
              <li key={h.date}>
                <button
                  style={{ ...s.buttonSecondary, padding: '0.1rem 0.5rem', marginRight: '0.5rem' }}
                  onClick={() => {
                    setDate(h.date);
                    charger(h.date);
                  }}
                >
                  {h.date}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
