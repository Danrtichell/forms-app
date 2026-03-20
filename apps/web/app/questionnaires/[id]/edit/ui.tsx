'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { QuestionnaireEditor } from '@/components/questionnaire-editor';
import {
  deleteQuestionnaire,
  publishQuestionnaire,
  unpublishQuestionnaire,
  updateQuestionnaire,
} from '@/lib/api';
import { apiBaseUrl } from '@/lib/config';
import type { Questionnaire } from '@/lib/types';

export function EditQuestionnaireClient({ initial }: { initial: Questionnaire }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(
    initial.publishedAccessToken,
  );
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <div className="stack">
      <div className="card stack">
        <h2 style={{ marginTop: 0 }}>Publish &amp; share</h2>
        <p className="muted" style={{ margin: 0 }}>
          Publishing issues a new access token. Respondents need the link with{' '}
          <span className="mono">access_token</span> (matches the assessment URL
          shape: <span className="mono">/forms/:formId?access_token=…</span>).
        </p>
        <div className="row">
          <button
            type="button"
            className="primary"
            disabled={!!busy}
            onClick={async () => {
              setBusy('publish');
              setShareHint(null);
              try {
                const r = await publishQuestionnaire(initial.id);
                setToken(r.accessToken);
                const url = `${window.location.origin}/forms/${initial.id}?access_token=${encodeURIComponent(r.accessToken)}`;
                setShareHint(url);
              } finally {
                setBusy(null);
              }
            }}
          >
            {busy === 'publish' ? 'Publishing…' : 'Publish (new token)'}
          </button>
          <button
            type="button"
            disabled={!!busy || !token}
            onClick={async () => {
              setBusy('unpublish');
              try {
                await unpublishQuestionnaire(initial.id);
                setToken(null);
                setShareHint(null);
              } finally {
                setBusy(null);
              }
            }}
          >
            Unpublish
          </button>
        </div>
        {shareHint ? (
          <p className="success" style={{ margin: 0 }}>
            Share link (copy): <span className="mono">{shareHint}</span>
          </p>
        ) : null}
        {token && !shareHint ? (
          <p className="muted" style={{ margin: 0 }}>
            Active token (use in URL): <span className="mono">{token}</span>
          </p>
        ) : null}
        {token ? (
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            API base: <span className="mono">{apiBaseUrl}</span>
          </p>
        ) : null}
      </div>

      <QuestionnaireEditor
        initial={initial}
        submitLabel="Save changes"
        onSubmit={async (data) => {
          await updateQuestionnaire(initial.id, data);
          router.refresh();
        }}
      />

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Danger zone</h2>
        <button
          type="button"
          className="danger"
          disabled={!!busy}
          onClick={async () => {
            if (!confirm('Delete this questionnaire and all responses?')) return;
            setBusy('delete');
            try {
              await deleteQuestionnaire(initial.id);
              router.push('/');
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === 'delete' ? 'Deleting…' : 'Delete questionnaire'}
        </button>
      </div>
    </div>
  );
}
