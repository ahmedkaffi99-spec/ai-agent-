'use client';

import { useState } from 'react';
import * as s from '@/lib/styles';

type Ligne = {
  id: number;
  agent: string;
  commission: number;
  paye: number;
  non_paye: number;
  retrait: number;
};

type ProfilLigne = { id: number; libelle: string; montant: number };
type Manuel = { commission_global: number };

function aujourdHui() {
  return new Date().toISOString().slice(0, 10);
}

export default function CommissionsPage() {
  const [secret, setSecret] = useState('');
  const [date, setDate] = useState(aujourdHui());
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [profil, setProfil] = useState<ProfilLigne[]>([]);
  const [manuel, setManuel] = useState<Manuel>({ commission_global: 0 });
  const [commissionSaisie, setCommissionSaisie] = useState('0');
  const [balanceRestant, setBalanceRestant] = useState(0);
  const [balancePrecedente, setBalancePrecedente] = useState(0);
  const [error, setError] = useState('');
  const [nouvelleLigne, setNouvelleLigne] = useState({ agent: '', commission: '', paye: '', non_paye: '', retrait: '' });
  const [nouveauProfil, setNouveauProfil] = useState({ libelle: '', montant: '' });

  const headers = { 'x-admin-secret': secret, 'Content-Type': 'application/json' };

  async function charger() {
    setError('');
    const res = await fetch(`/api/commissions?date=${date}`, { headers: { 'x-admin-secret': secret } });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setLignes(data.lignes);
    setProfil(data.profil);
    setManuel(data.manuel);
    setCommissionSaisie(String(data.manuel.commission_global ?? 0));
    setBalanceRestant(data.balanceRestant);
    setBalancePrecedente(data.balancePrecedente);
  }

  async function ajouterLigne(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/commissions/lignes', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        date,
        agent: nouvelleLigne.agent,
        commission: parseFloat(nouvelleLigne.commission) || 0,
        paye: parseFloat(nouvelleLigne.paye) || 0,
        non_paye: parseFloat(nouvelleLigne.non_paye) || 0,
        retrait: parseFloat(nouvelleLigne.retrait) || 0,
      }),
    });
    setNouvelleLigne({ agent: '', commission: '', paye: '', non_paye: '', retrait: '' });
    charger();
  }

  async function supprimerLigne(id: number) {
    await fetch('/api/commissions/lignes', { method: 'DELETE', headers, body: JSON.stringify({ id }) });
    charger();
  }

  async function ajouterProfil(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/commissions/profil', {
      method: 'POST',
      headers,
      body: JSON.stringify({ date, libelle: nouveauProfil.libelle, montant: parseFloat(nouveauProfil.montant) || 0 }),
    });
    setNouveauProfil({ libelle: '', montant: '' });
    charger();
  }

  async function supprimerProfil(id: number) {
    await fetch('/api/commissions/profil', { method: 'DELETE', headers, body: JSON.stringify({ id }) });
    charger();
  }

  async function sauvegarderManuel() {
    await fetch('/api/commissions/manuel', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ date, commission_global: parseFloat(commissionSaisie) || 0, balance_total: balanceTotal }),
    });
    charger();
  }

  const totalCommission = lignes.reduce((a, l) => a + Number(l.commission), 0);
  const totalPaye = lignes.reduce((a, l) => a + Number(l.paye), 0);
  const totalNonPaye = lignes.reduce((a, l) => a + Number(l.non_paye), 0);
  const totalRetrait = lignes.reduce((a, l) => a + Number(l.retrait), 0);
  const totalProfil = profil.reduce((a, p) => a + Number(p.montant), 0);
  const profilNet = totalProfil;
  const balanceTotal = balancePrecedente + balanceRestant;

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Bulletin de commissions</h1>
      <p style={s.pageSubtitle}>Detail par agent (commission, retenue, net, solde du) et repartition du profit, pour une date donnee.</p>

      <div style={s.toolbar}>
        <input style={{ ...s.input, width: 200 }} type="password" placeholder="Mot de passe admin" value={secret} onChange={(e) => setSecret(e.target.value)} />
        <input style={{ ...s.input, width: 170 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button style={s.button} onClick={charger}>Charger</button>
      </div>

      {error && <p style={s.errorText}>{error}</p>}

      <div style={s.card}>
        <h2 style={s.cardTitle}>Resume du {date}</h2>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Commission</th>
              <th style={s.th}>Profil</th>
              <th style={s.th}>Profil net</th>
              <th style={s.th}>Balance</th>
              <th style={s.th}>Balance restante</th>
              <th style={s.th}>Balance totale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>
                <input
                  style={s.input}
                  type="number"
                  value={commissionSaisie}
                  onChange={(e) => setCommissionSaisie(e.target.value)}
                />
              </td>
              <td style={{ ...s.td, fontWeight: 700 }}>{totalProfil.toLocaleString('fr-FR')}</td>
              <td style={{ ...s.td, fontWeight: 700 }}>{profilNet.toLocaleString('fr-FR')}</td>
              <td style={{ ...s.td, fontWeight: 700 }}>{balancePrecedente.toLocaleString('fr-FR')}</td>
              <td style={{ ...s.td, fontWeight: 700 }}>{balanceRestant.toLocaleString('fr-FR')}</td>
              <td style={{ ...s.td, fontWeight: 700 }}>{balanceTotal.toLocaleString('fr-FR')}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ color: s.colors.muted, fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Seule la commission se saisit manuellement. Profil, profil net, balance, balance restante et balance totale
          sont calcules automatiquement (balance = balance totale du jour precedent).
        </p>
        <button style={{ ...s.buttonSecondary, marginTop: '0.5rem' }} onClick={sauvegarderManuel}>Enregistrer</button>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Detail par agent</h2>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Agent</th>
              <th style={s.th}>Commission brute</th>
              <th style={s.th}>Retenue (retrait)</th>
              <th style={s.th}>Net</th>
              <th style={s.th}>Paye</th>
              <th style={s.th}>Solde du</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.id}>
                <td style={s.td}>{l.agent}</td>
                <td style={s.td}>{Number(l.commission).toLocaleString('fr-FR')}</td>
                <td style={s.td}>{Number(l.retrait).toLocaleString('fr-FR')}</td>
                <td style={{ ...s.td, fontWeight: 600 }}>{(Number(l.commission) - Number(l.retrait)).toLocaleString('fr-FR')}</td>
                <td style={s.td}>{Number(l.paye).toLocaleString('fr-FR')}</td>
                <td style={{ ...s.td, color: Number(l.non_paye) > 0 ? s.colors.danger : s.colors.text }}>{Number(l.non_paye).toLocaleString('fr-FR')}</td>
                <td style={s.td}><button style={s.buttonSecondary} onClick={() => supprimerLigne(l.id)}>Suppr.</button></td>
              </tr>
            ))}
            <tr style={s.totalRow}>
              <td style={s.td}>Total</td>
              <td style={s.td}>{totalCommission.toLocaleString('fr-FR')}</td>
              <td style={s.td}>{totalRetrait.toLocaleString('fr-FR')}</td>
              <td style={s.td}>{(totalCommission - totalRetrait).toLocaleString('fr-FR')}</td>
              <td style={s.td}>{totalPaye.toLocaleString('fr-FR')}</td>
              <td style={s.td}>{totalNonPaye.toLocaleString('fr-FR')}</td>
              <td style={s.td}></td>
            </tr>
          </tbody>
        </table>
        <form onSubmit={ajouterLigne} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <input style={{ ...s.input, width: 160 }} placeholder="Agent" value={nouvelleLigne.agent} onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, agent: e.target.value })} required />
          <input style={{ ...s.input, width: 110 }} type="number" placeholder="Commission" value={nouvelleLigne.commission} onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, commission: e.target.value })} />
          <input style={{ ...s.input, width: 110 }} type="number" placeholder="Paye" value={nouvelleLigne.paye} onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, paye: e.target.value })} />
          <input style={{ ...s.input, width: 110 }} type="number" placeholder="Non paye" value={nouvelleLigne.non_paye} onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, non_paye: e.target.value })} />
          <input style={{ ...s.input, width: 110 }} type="number" placeholder="Retrait" value={nouvelleLigne.retrait} onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, retrait: e.target.value })} />
          <button style={s.button} type="submit">Ajouter</button>
        </form>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Repartition du profil</h2>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Libelle</th>
              <th style={s.th}>Montant</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {profil.map((p) => (
              <tr key={p.id}>
                <td style={s.td}>{p.libelle}</td>
                <td style={s.td}>{Number(p.montant).toLocaleString('fr-FR')}</td>
                <td style={s.td}><button style={s.buttonSecondary} onClick={() => supprimerProfil(p.id)}>Suppr.</button></td>
              </tr>
            ))}
            <tr style={s.totalRow}>
              <td style={s.td}>Total profil</td>
              <td style={s.td}>{totalProfil.toLocaleString('fr-FR')}</td>
              <td style={s.td}></td>
            </tr>
          </tbody>
        </table>
        <form onSubmit={ajouterProfil} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <input style={{ ...s.input, width: 200 }} placeholder="Libelle (ex: retrait 2%)" value={nouveauProfil.libelle} onChange={(e) => setNouveauProfil({ ...nouveauProfil, libelle: e.target.value })} required />
          <input style={{ ...s.input, width: 120 }} type="number" placeholder="Montant" value={nouveauProfil.montant} onChange={(e) => setNouveauProfil({ ...nouveauProfil, montant: e.target.value })} />
          <button style={s.button} type="submit">Ajouter</button>
        </form>
      </div>
    </div>
  );
}
