'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { importResponses } from '@/lib/api';

export function ImportResponses({
  questionnaireId,
}: {
  questionnaireId: string;
}) {
  const router = useRouter();
  const [json, setJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleImport() {
    setError(null);
    setBusy(true);
    try {
      const body = JSON.parse(json) as { responses: unknown[] };
      await importResponses(questionnaireId, body);
      setJson('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card stack" style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ marginTop: 0 }}>Import responses JSON</h2>
      <p className="muted" style={{ margin: 0 }}>
        Body shape:{' '}
        <span className="mono">{`{ "responses": [ { "answers": { ... } } ] }`}</span>
        . See <span className="mono">samples/responses.sample.json</span>.
      </p>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        style={{ minHeight: 120 }}
        placeholder='{ "responses": [] }'
      />
      {error ? <p className="error">{error}</p> : null}
      <button
        type="button"
        className="primary"
        disabled={busy || !json.trim()}
        onClick={() => void handleImport()}
      >
        {busy ? 'Importing…' : 'Append responses'}
      </button>
    </div>
  );
}
