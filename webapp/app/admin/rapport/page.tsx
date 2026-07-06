'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import * as s from '@/lib/styles';
import { useAdminSecret } from '@/lib/useAdminSecret';

function aujourdHui() {
  return new Date().toISOString().slice(0, 10);
}

export default function RapportPage() {
  const [secret] = useAdminSecret();
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

  useEffect(() => {
    if (secret) charger(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

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

  if (!secret) {
    return (
      <div style={s.page}>
        <h1 style={s.pageTitle}>Rapport IA de fin de journee</h1>
        <p style={s.pageSubtitle}>
          Non connecte. <Link href="/">Va sur l'accueil</Link> pour entrer le mot de passe.
        </p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Rapport IA de fin de journee</h1>
      <p style={s.pageSubtitle}>Compte-rendu genere par Claude a partir des finances, commissions et mouvements du jour.</p>

      <div style={s.toolbar}>
        <input style={{ ...s.input, width: 170 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button style={s.buttonSecondary} onClick={() => charger(date)}>Charger</button>
        <button style={s.button} onClick={generer} disabled={loading}>
          {loading ? 'Generation...' : 'Generer le rapport'}
        </button>
      </div>

      {error && <p style={s.errorText}>{error}</p>}

      {contenu && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>Rapport du {date}</h2>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{contenu}</div>
        </div>
      )}

      {historique.length > 0 && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>Historique</h2>
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
