import Link from 'next/link';

import { ImportResponses } from './import-responses';

import { getAnalytics, listResponses } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function ResultsPage({ params }: Props) {
  const { id } = await params;
  let responses: Awaited<ReturnType<typeof listResponses>> = [];
  let analytics: Awaited<ReturnType<typeof getAnalytics>> | null = null;
  let loadError: string | null = null;
  try {
    [responses, analytics] = await Promise.all([
      listResponses(id),
      getAnalytics(id),
    ]);
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Failed to load results';
  }

  if (loadError || !analytics) {
    return (
      <>
        <div className="row" style={{ marginBottom: '1rem' }}>
          <Link href="/">← Home</Link>
          <Link href={`/questionnaires/${id}/edit`}>Edit</Link>
        </div>
        <h1>Results</h1>
        <p className="error">{loadError ?? 'Unknown error'}</p>
      </>
    );
  }

  return (
    <>
      <div className="row" style={{ marginBottom: '1rem' }}>
        <Link href="/">← Home</Link>
        <Link href={`/questionnaires/${id}/edit`}>Edit</Link>
      </div>
      <h1>Results</h1>
      <p className="muted">
        {analytics.title} —{' '}
        <span className="mono">{analytics.submissionCount}</span> submission(s)
      </p>

      <ImportResponses questionnaireId={id} />

      <h2>Analytics</h2>
      <div className="stack">
        {Object.entries(analytics.byQuestion).map(([qid, summary]) => (
          <div key={qid} className="card stack" style={{ marginBottom: 0 }}>
            <strong className="mono">{qid}</strong>
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              {summary.type} · {summary.responseCount} answer(s)
            </span>
            {summary.choiceCounts ? (
              <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {Object.entries(summary.choiceCounts).map(([opt, n]) => (
                  <li key={opt}>
                    {opt}: <strong>{n}</strong>
                  </li>
                ))}
              </ul>
            ) : null}
            {summary.numeric ? (
              <p style={{ margin: 0 }} className="muted">
                min {summary.numeric.min.toFixed(2)} · max{' '}
                {summary.numeric.max.toFixed(2)} · avg{' '}
                {summary.numeric.avg.toFixed(2)}
              </p>
            ) : null}
            {summary.textSamples?.length ? (
              <div>
                <span className="muted" style={{ fontSize: '0.85rem' }}>
                  Recent text samples
                </span>
                <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.1rem' }}>
                  {summary.textSamples.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <h2>Submissions</h2>
      {responses.length === 0 ? (
        <p className="muted">No responses yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Id</th>
                <th>Answers (JSON)</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr key={r.id}>
                  <td className="mono" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(r.submittedAt).toLocaleString()}
                  </td>
                  <td className="mono">{r.id}</td>
                  <td className="mono">
                    {JSON.stringify(r.answers, null, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
