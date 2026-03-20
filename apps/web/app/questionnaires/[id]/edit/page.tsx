import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EditQuestionnaireClient } from './ui';

import { getQuestionnaire } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditQuestionnairePage({ params }: Props) {
  const { id } = await params;
  let initial;
  try {
    initial = await getQuestionnaire(id);
  } catch {
    notFound();
  }

  return (
    <>
      <div className="row" style={{ marginBottom: '1rem' }}>
        <Link href="/">← Home</Link>
        <Link href={`/questionnaires/${id}/results`}>Results</Link>
      </div>
      <h1>Edit questionnaire</h1>
      <p className="muted mono" style={{ fontSize: '0.85rem' }}>
        {initial.id}
      </p>
      <EditQuestionnaireClient initial={initial} />
    </>
  );
}
