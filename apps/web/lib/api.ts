import { apiBaseUrl } from './config';
import type {
  AnalyticsPayload,
  FormResponse,
  Questionnaire,
} from './types';

async function parseError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(j.message)) return j.message.join(', ');
    if (j.message) return j.message;
  } catch {
    /* ignore */
  }
  return text || res.statusText;
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export function listQuestionnaires(): Promise<Questionnaire[]> {
  return apiJson('/questionnaires');
}

export function getQuestionnaire(id: string): Promise<Questionnaire> {
  return apiJson(`/questionnaires/${id}`);
}

export function createQuestionnaire(
  body: Pick<Questionnaire, 'title' | 'description' | 'questions'>,
): Promise<Questionnaire> {
  return apiJson('/questionnaires', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateQuestionnaire(
  id: string,
  body: Partial<Pick<Questionnaire, 'title' | 'description' | 'questions'>>,
): Promise<Questionnaire> {
  return apiJson(`/questionnaires/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteQuestionnaire(id: string): Promise<void> {
  return apiJson(`/questionnaires/${id}`, { method: 'DELETE' });
}

export function publishQuestionnaire(
  id: string,
): Promise<{ accessToken: string; questionnaire: Questionnaire }> {
  return apiJson(`/questionnaires/${id}/publish`, { method: 'POST' });
}

export function unpublishQuestionnaire(id: string): Promise<Questionnaire> {
  return apiJson(`/questionnaires/${id}/unpublish`, { method: 'POST' });
}

export function listResponses(id: string): Promise<FormResponse[]> {
  return apiJson(`/questionnaires/${id}/responses`);
}

export function getAnalytics(id: string): Promise<AnalyticsPayload> {
  return apiJson(`/questionnaires/${id}/analytics`);
}

export function importQuestionnaire(
  body: Record<string, unknown>,
): Promise<Questionnaire> {
  return apiJson('/questionnaires/import', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function importResponses(
  questionnaireId: string,
  body: { responses: unknown[] },
): Promise<{ imported: number }> {
  return apiJson(`/questionnaires/${questionnaireId}/responses/import`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getPublicQuestionnaire(
  id: string,
  accessToken: string,
): Promise<Questionnaire> {
  const q = new URLSearchParams({ access_token: accessToken });
  return apiJson(`/public/questionnaires/${id}?${q.toString()}`);
}

export function submitPublicResponse(
  id: string,
  accessToken: string,
  answers: Record<string, unknown>,
): Promise<{ response: FormResponse }> {
  return apiJson(`/public/questionnaires/${id}/responses`, {
    method: 'POST',
    body: JSON.stringify({ access_token: accessToken, answers }),
  });
}
