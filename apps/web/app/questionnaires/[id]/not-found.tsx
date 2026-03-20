import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <h1>Not found</h1>
      <p className="muted">This questionnaire does not exist (or the API is unreachable).</p>
      <Link href="/">← Home</Link>
    </>
  );
}
