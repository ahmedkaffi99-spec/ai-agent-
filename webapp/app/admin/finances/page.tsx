'use client';

import { useState } from 'react';
import * as s from '@/lib/styles';

type Transaction = {
  id: number;
  date: string;
  categorie: string;
  description: string | null;
  montant: number;
  type: 'revenu' | 'depense';
};

export default function FinancesPage() {
  const [secret, setSecret] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState({ date: '', categorie: '', description: '', montant: '', type: 'depense' });
  const [analyse, setAnalyse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function charger() {
    setError('');
    const res = await fetch('/api/finances', { headers: { 'x-admin-secret': secret } });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else setTransactions(data.transactions);
  }

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/finances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ ...form, montant: parseFloat(form.montant) }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else {
      setForm({ date: '', categorie: '', description: '', montant: '', type: 'depense' });
      charger();
    }
  }

  async function supprimer(id: number) {
    await fetch('/api/finances', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id }),
    });
    charger();
  }

  async function analyser() {
    setLoading(true);
    setAnalyse('');
    const res = await fetch('/api/finances/analyse', {
      method: 'POST',
      headers: { 'x-admin-secret': secret },
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else setAnalyse(data.analyse);
    setLoading(false);
  }

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Finances</h1>
      <p style={s.pageSubtitle}>Suivi de transactions personnelles avec analyse IA.</p>

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
        <h2 style={s.cardTitle}>Nouvelle transaction</h2>
        <form onSubmit={ajouter} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input style={{ ...s.input, width: 150 }} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <select style={{ ...s.select, width: 130 }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="depense">Depense</option>
            <option value="revenu">Revenu</option>
          </select>
          <input
            style={{ ...s.input, width: 150 }}
            placeholder="Categorie"
            value={form.categorie}
            onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            required
          />
          <input
            style={{ ...s.input, width: 200 }}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            style={{ ...s.input, width: 120 }}
            type="number"
            step="0.01"
            placeholder="Montant"
            value={form.montant}
            onChange={(e) => setForm({ ...form, montant: e.target.value })}
            required
          />
          <button style={s.button} type="submit">Ajouter</button>
        </form>
      </div>

      {error && <p style={s.errorText}>{error}</p>}

      <div style={s.card}>
        <h2 style={s.cardTitle}>Transactions</h2>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Date</th>
              <th style={s.th}>Type</th>
              <th style={s.th}>Categorie</th>
              <th style={s.th}>Description</th>
              <th style={s.th}>Montant</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td style={s.td}>{t.date}</td>
                <td style={s.td}>{t.type}</td>
                <td style={s.td}>{t.categorie}</td>
                <td style={s.td}>{t.description}</td>
                <td style={{ ...s.td, color: t.type === 'depense' ? s.colors.danger : s.colors.success, fontWeight: 600 }}>{t.montant}€</td>
                <td style={s.td}>
                  <button style={s.buttonSecondary} onClick={() => supprimer(t.id)}>Suppr.</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={s.card}>
        <button style={s.button} onClick={analyser} disabled={loading}>
          {loading ? 'Analyse en cours...' : "Analyser avec l'IA"}
        </button>
        {analyse && <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', fontFamily: 'inherit' }}>{analyse}</pre>}
      </div>
    </div>
  );
}
