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
  /** When set, public link requires matching `access_token`. */
  publishedAccessToken: string | null;
}

export type AnswerValue = string | number | string[] | null;

export interface FormResponse {
  id: string;
  questionnaireId: string;
  answers: Record<string, AnswerValue>;
  submittedAt: string;
}
