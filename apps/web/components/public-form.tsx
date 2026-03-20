'use client';

import { useEffect, useState } from 'react';

import { getPublicQuestionnaire, submitPublicResponse } from '@/lib/api';
import type { Question, Questionnaire } from '@/lib/types';

function Field({
  q,
  value,
  onChange,
}: {
  q: Question;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `f_${q.id}`;
  if (q.type === 'long_text') {
    return (
      <textarea
        id={id}
        required={q.required}
        placeholder={q.placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (q.type === 'short_text') {
    return (
      <input
        id={id}
        type="text"
        required={q.required}
        placeholder={q.placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (q.type === 'number') {
    return (
      <input
        id={id}
        type="number"
        required={q.required}
        value={value === '' || value === undefined ? '' : String(value)}
        onChange={(e) =>
          onChange(e.target.value === '' ? '' : Number(e.target.value))
        }
      />
    );
  }
  if (q.type === 'date') {
    return (
      <input
        id={id}
        type="date"
        required={q.required}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (q.type === 'single_choice') {
    return (
      <div className="stack" style={{ gap: '0.35rem' }}>
        {(q.options ?? []).map((opt) => (
          <label key={opt} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="radio"
              name={id}
              value={opt}
              required={q.required}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }
  if (q.type === 'multiple_choice') {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="stack" style={{ gap: '0.35rem' }}>
        {(q.options ?? []).map((opt) => (
          <label key={opt} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={(e) => {
                if (e.target.checked) onChange([...selected, opt]);
                else onChange(selected.filter((x) => x !== opt));
              }}
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }
  return null;
}

export function PublicForm({
  formId,
  accessToken,
}: {
  formId: string;
  accessToken: string;
}) {
  const [q, setQ] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicQuestionnaire(formId, accessToken);
        if (cancelled) return;
        setQ(data);
        const init: Record<string, unknown> = {};
        for (const qu of data.questions) {
          if (qu.type === 'multiple_choice') init[qu.id] = [];
          else init[qu.id] = '';
        }
        setAnswers(init);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Failed to load form');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formId, accessToken]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q) return;
    setError(null);
    try {
      await submitPublicResponse(formId, accessToken, answers);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    }
  }

  if (!accessToken) {
    return (
      <p className="error">
        Missing <span className="mono">access_token</span> query parameter.
      </p>
    );
  }

  if (loading) return <p className="muted">Loading form…</p>;
  if (error)
    return (
      <p className="error">
        {error}
      </p>
    );
  if (!q) return null;

  if (done) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Thank you</h2>
        <p className="muted" style={{ margin: 0 }}>
          Your response was recorded.
        </p>
      </div>
    );
  }

  return (
    <form className="stack" onSubmit={(e) => void onSubmit(e)}>
      <h1 style={{ marginBottom: '0.25rem' }}>{q.title}</h1>
      {q.description ? <p className="muted">{q.description}</p> : null}
      {q.questions.map((qu) => (
        <div key={qu.id} className="card stack" style={{ marginBottom: 0 }}>
          <label htmlFor={`f_${qu.id}`}>
            {qu.label}
            {qu.required ? <span style={{ color: 'var(--danger)' }}> *</span> : null}
          </label>
          <Field
            q={qu}
            value={answers[qu.id]}
            onChange={(v) => setAnswers((a) => ({ ...a, [qu.id]: v }))}
          />
        </div>
      ))}
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" className="primary">
        Submit
      </button>
    </form>
  );
}
