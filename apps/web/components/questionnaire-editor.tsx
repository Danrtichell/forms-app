'use client';

import { useMemo, useState } from 'react';

import type { Question, Questionnaire, QuestionType } from '@/lib/types';

const QUESTION_TYPES: QuestionType[] = [
  'short_text',
  'long_text',
  'single_choice',
  'multiple_choice',
  'number',
  'date',
];

function newQuestion(partial?: Partial<Question>): Question {
  return {
    id:
      partial?.id ??
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `q_${Math.random().toString(36).slice(2, 10)}`),
    type: partial?.type ?? 'short_text',
    label: partial?.label ?? '',
    required: partial?.required ?? false,
    options: partial?.options,
    placeholder: partial?.placeholder,
  };
}

export function QuestionnaireEditor({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Questionnaire;
  submitLabel: string;
  onSubmit: (data: {
    title: string;
    description?: string;
    questions: Question[];
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [questions, setQuestions] = useState<Question[]>(() =>
    initial?.questions?.length ? initial.questions : [newQuestion()],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => title.trim() && questions.every((q) => q.id.trim() && q.label.trim()),
    [title, questions],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        questions: questions.map((q) => ({
          ...q,
          options:
            q.type === 'single_choice' || q.type === 'multiple_choice'
              ? (q.options ?? []).filter(Boolean)
              : undefined,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  function updateQuestion(index: number, patch: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    );
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <h2 style={{ marginTop: '0.5rem' }}>Questions</h2>
      {questions.map((q, i) => (
        <div key={i} className="card stack" style={{ marginBottom: 0 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>Question {i + 1}</strong>
            <button
              type="button"
              className="danger"
              onClick={() =>
                setQuestions((prev) => prev.filter((_, j) => j !== i))
              }
            >
              Remove
            </button>
          </div>
          <div className="row" style={{ gap: '1rem' }}>
            <div style={{ flex: '1 1 140px' }}>
              <label>Id</label>
              <input
                value={q.id}
                onChange={(e) => updateQuestion(i, { id: e.target.value })}
                required
              />
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label>Type</label>
              <select
                value={q.type}
                onChange={(e) =>
                  updateQuestion(i, {
                    type: e.target.value as QuestionType,
                    options:
                      e.target.value === 'single_choice' ||
                      e.target.value === 'multiple_choice'
                        ? q.options?.length
                          ? q.options
                          : ['Option A', 'Option B']
                        : undefined,
                  })
                }
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label>Label</label>
            <input
              value={q.label}
              onChange={(e) => updateQuestion(i, { label: e.target.value })}
              required
            />
          </div>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={!!q.required}
              onChange={(e) => updateQuestion(i, { required: e.target.checked })}
            />
            Required
          </label>
          {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
            <div>
              <label>Options (one per line)</label>
              <textarea
                value={(q.options ?? []).join('\n')}
                onChange={(e) =>
                  updateQuestion(i, {
                    options: e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          )}
        </div>
      ))}

      <div className="row">
        <button type="button" onClick={() => setQuestions((p) => [...p, newQuestion()])}>
          Add question
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="row">
        <button type="submit" className="primary" disabled={!canSubmit || busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
