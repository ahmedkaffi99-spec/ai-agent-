'use client';

import Link from 'next/link';
import { useState } from 'react';
import * as s from '@/lib/styles';
import { useAdminSecret } from '@/lib/useAdminSecret';

const sections = [
  {
    href: '/admin/commissions',
    titre: 'Commissions',
    description: 'Bulletin de commissions par agent, retenues, repartition du profit et solde restant.',
  },
  {
    href: '/admin/mouvements',
    titre: 'Mouvements de fonds',
    description: 'Entrant / sortant / balance, par mois, avec totaux automatiques.',
  },
  {
    href: '/admin/rapport',
    titre: 'Rapport IA',
    description: 'Compte-rendu de fin de journee genere automatiquement par Claude.',
  },
];

export default function HomePage() {
  const [secret, setSecret] = useAdminSecret();
  const [saisie, setSaisie] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/verifier', { headers: { 'x-admin-secret': saisie } });
    if (res.ok) {
      setSecret(saisie);
    } else {
      setError('Mot de passe incorrect.');
    }
    setLoading(false);
  }

  function seDeconnecter() {
    setSecret('');
    setSaisie('');
  }

  if (!secret) {
    return (
      <div style={{ ...s.page, maxWidth: 420 }}>
        <h1 style={s.pageTitle}>Back-office IA</h1>
        <p style={s.pageSubtitle}>Outil personnel — pas destine aux visiteurs publics.</p>
        <div style={s.card}>
          <form onSubmit={seConnecter} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={s.label}>Mot de passe admin</label>
            <input
              style={s.input}
              type="password"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              autoFocus
              required
            />
            <button style={s.button} type="submit" disabled={loading}>
              {loading ? 'Verification...' : 'Se connecter'}
            </button>
          </form>
          {error && <p style={{ ...s.errorText, marginTop: '0.75rem', marginBottom: 0 }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={s.pageTitle}>Back-office IA</h1>
          <p style={s.pageSubtitle}>Outil personnel — pas destine aux visiteurs publics.</p>
        </div>
        <button style={s.buttonSecondary} onClick={seDeconnecter}>Se deconnecter</button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {sections.map((sec) => (
          <Link key={sec.href} href={sec.href} style={{ textDecoration: 'none' }}>
            <div style={{ ...s.card, marginBottom: 0, height: '100%', cursor: 'pointer' }}>
              <h2 style={s.cardTitle}>{sec.titre}</h2>
              <p style={{ color: s.colors.muted, fontSize: '0.88rem', margin: 0 }}>{sec.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
