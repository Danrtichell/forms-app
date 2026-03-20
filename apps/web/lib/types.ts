export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'number'
  | 'date';

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  publishedAccessToken: string | null;
}

export type AnswerValue = string | number | string[] | null;

export interface FormResponse {
  id: string;
  questionnaireId: string;
  answers: Record<string, AnswerValue>;
  submittedAt: string;
}

export interface AnalyticsPayload {
  questionnaireId: string;
  title: string;
  submissionCount: number;
  byQuestion: Record<
    string,
    {
      type: string;
      responseCount: number;
      choiceCounts?: Record<string, number>;
      numeric?: { min: number; max: number; avg: number };
      textSamples?: string[];
    }
  >;
}
