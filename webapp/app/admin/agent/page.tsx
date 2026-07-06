'use client';

import { useState } from 'react';
import * as s from '@/lib/styles';

type Mode = 'simple' | 'pipeline';

type PipelineResult = {
  faits: string;
  redaction: string;
  resultatFinal: string;
};

export default function AgentAdminPage() {
  const [mode, setMode] = useState<Mode>('simple');
  const [secret, setSecret] = useState('');
  const [input, setInput] = useState('');
  const [simpleResult, setSimpleResult] = useState('');
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSimpleResult('');
    setPipelineResult(null);

    const endpoint = mode === 'simple' ? '/api/agent' : '/api/pipeline';
    const bodyKey = mode === 'simple' ? 'message' : 'sujet';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ [bodyKey]: input }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erreur inconnue');
      } else if (mode === 'simple') {
        setSimpleResult(data.result);
      } else {
        setPipelineResult(data);
      }
    } catch {
      setError('Erreur reseau');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Agent IA</h1>
      <p style={s.pageSubtitle}>Agent simple (Claude + recherche web) ou pipeline multi-modele (Groq &rarr; Claude &rarr; Gemini).</p>

      <div style={s.card}>
        <label style={s.label}>
          Mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            style={{ ...s.select, marginTop: '0.3rem' }}
          >
            <option value="simple">Agent simple (Claude + recherche web)</option>
            <option value="pipeline">Pipeline multi-agent (Groq &rarr; Claude &rarr; Gemini)</option>
          </select>
        </label>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
          <input
            style={s.input}
            type="password"
            placeholder="Mot de passe admin"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
          />
          <textarea
            style={{ ...s.input, fontFamily: 'inherit' }}
            placeholder={mode === 'simple' ? 'Ta demande...' : 'Sujet a traiter...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            required
          />
          <button style={s.button} type="submit" disabled={loading}>
            {loading ? (mode === 'pipeline' ? 'En cours (10-20s)...' : 'En cours...') : 'Envoyer'}
          </button>
        </form>
      </div>

      {error && <p style={s.errorText}>{error}</p>}

      {mode === 'simple' && simpleResult && (
        <div style={s.card}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{simpleResult}</pre>
        </div>
      )}

      {mode === 'pipeline' && pipelineResult && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>Resultat final</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{pipelineResult.resultatFinal}</pre>
          <details>
            <summary>Voir les etapes intermediaires</summary>
            <h3>Faits (Groq)</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{pipelineResult.faits}</pre>
            <h3>Redaction (Claude)</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{pipelineResult.redaction}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
