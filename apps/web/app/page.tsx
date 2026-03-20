import Link from 'next/link';

import { listQuestionnaires } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let items: Awaited<ReturnType<typeof listQuestionnaires>> = [];
  let error: string | null = null;
  try {
    items = await listQuestionnaires();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load questionnaires';
  }

  return (
    <>
      <h1>Questionnaires</h1>
      <p className="muted">
        Create structured forms, publish a share link with an access token, and
        review submissions with simple analytics.
      </p>
      <div className="row" style={{ marginBottom: '1.25rem' }}>
        <Link href="/questionnaires/new" className="button primary">
          New questionnaire
        </Link>
      </div>
      {error ? (
        <p className="error">
          {error}. Is the API running at{' '}
          <span className="mono">NEXT_PUBLIC_API_URL</span>?
        </p>
      ) : items.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            No questionnaires yet. Create one or import JSON from{' '}
            <span className="mono">samples/</span>.
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((q) => (
            <li key={q.id} className="card">
              <div
                className="row"
                style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}
              >
                <strong>{q.title}</strong>
                <span className="muted" style={{ fontSize: '0.8rem' }}>
                  {q.publishedAccessToken ? 'Published' : 'Draft'}
                </span>
              </div>
              {q.description ? (
                <p className="muted" style={{ margin: '0 0 0.75rem' }}>
                  {q.description}
                </p>
              ) : null}
              <div className="row">
                <Link href={`/questionnaires/${q.id}/edit`}>Edit</Link>
                <Link href={`/questionnaires/${q.id}/results`}>Results</Link>
                <span className="mono muted">{q.id}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
