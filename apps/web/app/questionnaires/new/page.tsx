'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { QuestionnaireEditor } from '@/components/questionnaire-editor';
import { createQuestionnaire, importQuestionnaire } from '@/lib/api';

export default function NewQuestionnairePage() {
  const router = useRouter();
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);

  async function handleImport() {
    setImportError(null);
    setImportBusy(true);
    try {
      const data = JSON.parse(importJson) as Record<string, unknown>;
      const q = await importQuestionnaire(data);
      router.push(`/questionnaires/${q.id}/edit`);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setImportBusy(false);
    }
  }

  return (
    <>
      <div className="row" style={{ marginBottom: '1rem' }}>
        <Link href="/">← Back</Link>
      </div>
      <h1>New questionnaire</h1>

      <div className="card stack" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginTop: 0 }}>Import JSON</h2>
        <p className="muted" style={{ margin: 0 }}>
          Paste a questionnaire export (see <span className="mono">samples/questionnaire.sample.json</span>
          ).
        </p>
        <textarea
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder='{ "title": "...", "questions": [...] }'
          style={{ minHeight: 140 }}
        />
        {importError ? <p className="error">{importError}</p> : null}
        <button
          type="button"
          className="primary"
          disabled={importBusy || !importJson.trim()}
          onClick={() => void handleImport()}
        >
          {importBusy ? 'Importing…' : 'Import'}
        </button>
      </div>

      <h2>Or build in the UI</h2>
      <QuestionnaireEditor
        submitLabel="Create questionnaire"
        onSubmit={async (data) => {
          const q = await createQuestionnaire(data);
          router.push(`/questionnaires/${q.id}/edit`);
        }}
      />
    </>
  );
}
