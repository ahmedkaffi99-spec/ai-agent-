'use client';

import { useState } from 'react';

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
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: '1rem' }}>
      <h1>Agent IA</h1>

      <label style={{ display: 'block', marginBottom: '1rem' }}>
        Mode
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          style={{ display: 'block', marginTop: '0.25rem' }}
        >
          <option value="simple">Agent simple (Claude + recherche web)</option>
          <option value="pipeline">Pipeline multi-agent (Groq &rarr; Claude &rarr; Gemini)</option>
        </select>
      </label>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          type="password"
          placeholder="Mot de passe admin"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
        />
        <textarea
          placeholder={mode === 'simple' ? 'Ta demande...' : 'Sujet a traiter...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? (mode === 'pipeline' ? 'En cours (10-20s)...' : 'En cours...') : 'Envoyer'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {mode === 'simple' && simpleResult && (
        <pre style={{ whiteSpace: 'pre-wrap' }}>{simpleResult}</pre>
      )}

      {mode === 'pipeline' && pipelineResult && (
        <div>
          <h2>Resultat final</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{pipelineResult.resultatFinal}</pre>
          <details>
            <summary>Voir les etapes intermediaires</summary>
            <h3>Faits (Groq)</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{pipelineResult.faits}</pre>
            <h3>Redaction (Claude)</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{pipelineResult.redaction}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
