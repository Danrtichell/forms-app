import { PublicForm } from '@/components/public-form';

type Props = {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ access_token?: string }>;
};

export default async function PublicFormPage({ params, searchParams }: Props) {
  const { formId } = await params;
  const { access_token: accessToken } = await searchParams;

  return <PublicForm formId={formId} accessToken={accessToken ?? ''} />;
}
