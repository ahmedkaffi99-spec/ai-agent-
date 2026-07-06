'use client';

import { useState } from 'react';

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
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '1rem' }}>
      <h1>Finances</h1>

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
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="depense">Depense</option>
          <option value="revenu">Revenu</option>
        </select>
        <input
          placeholder="Categorie"
          value={form.categorie}
          onChange={(e) => setForm({ ...form, categorie: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Montant"
          value={form.montant}
          onChange={(e) => setForm({ ...form, montant: e.target.value })}
          required
        />
        <button type="submit">Ajouter</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Categorie</th>
            <th>Description</th>
            <th>Montant</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.type}</td>
              <td>{t.categorie}</td>
              <td>{t.description}</td>
              <td style={{ color: t.type === 'depense' ? 'crimson' : 'seagreen' }}>{t.montant}e</td>
              <td>
                <button onClick={() => supprimer(t.id)}>Suppr.</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={analyser} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Analyse en cours...' : "Analyser avec l'IA"}
      </button>
      {analyse && <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>{analyse}</pre>}
    </div>
  );
}
