import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import {
  AnswerValue,
  FormResponse,
  Question,
  Questionnaire,
} from '../domain/questionnaire.types';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import {
  ImportQuestionnaireDto,
  ImportResponsesDto,
} from './dto/import.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';

function nowIso(): string {
  return new Date().toISOString();
}

function isEmptyAnswer(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

@Injectable()
export class QuestionnairesService {
  private readonly questionnaires = new Map<string, Questionnaire>();
  private readonly responses = new Map<string, FormResponse[]>();

  list(): Questionnaire[] {
    return [...this.questionnaires.values()].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }

  get(id: string): Questionnaire {
    const q = this.questionnaires.get(id);
    if (!q) throw new NotFoundException(`Questionnaire ${id} not found`);
    return q;
  }

  create(dto: CreateQuestionnaireDto): Questionnaire {
    this.assertQuestionsValid(dto.questions as Question[]);
    const id = uuidv4();
    const ts = nowIso();
    const entity: Questionnaire = {
      id,
      title: dto.title,
      description: dto.description,
      questions: dto.questions as Question[],
      createdAt: ts,
      updatedAt: ts,
      publishedAccessToken: null,
    };
    this.questionnaires.set(id, entity);
    this.responses.set(id, []);
    return entity;
  }

  update(id: string, dto: UpdateQuestionnaireDto): Questionnaire {
    const existing = this.get(id);
    if (dto.questions) this.assertQuestionsValid(dto.questions as Question[]);
    const next: Questionnaire = {
      ...existing,
      title: dto.title ?? existing.title,
      description:
        dto.description !== undefined ? dto.description : existing.description,
      questions: (dto.questions as Question[] | undefined) ?? existing.questions,
      updatedAt: nowIso(),
    };
    this.questionnaires.set(id, next);
    return next;
  }

  remove(id: string): void {
    if (!this.questionnaires.has(id))
      throw new NotFoundException(`Questionnaire ${id} not found`);
    this.questionnaires.delete(id);
    this.responses.delete(id);
  }

  publish(id: string): { accessToken: string; questionnaire: Questionnaire } {
    const q = this.get(id);
    const accessToken = randomBytes(24).toString('base64url');
    const updated: Questionnaire = {
      ...q,
      publishedAccessToken: accessToken,
      updatedAt: nowIso(),
    };
    this.questionnaires.set(id, updated);
    return { accessToken, questionnaire: updated };
  }

  unpublish(id: string): Questionnaire {
    const q = this.get(id);
    const updated: Questionnaire = {
      ...q,
      publishedAccessToken: null,
      updatedAt: nowIso(),
    };
    this.questionnaires.set(id, updated);
    return updated;
  }

  getPublicDefinition(id: string, accessToken: string): Questionnaire {
    const q = this.get(id);
    this.assertPublishedToken(q, accessToken);
    return q;
  }

  submitResponse(
    id: string,
    dto: SubmitResponseDto,
  ): { response: FormResponse; questionnaire: Questionnaire } {
    const q = this.get(id);
    this.assertPublishedToken(q, dto.access_token);
    const answers = this.normalizeAndValidateAnswers(q.questions, dto.answers);
    const response: FormResponse = {
      id: uuidv4(),
      questionnaireId: id,
      answers,
      submittedAt: nowIso(),
    };
    const list = this.responses.get(id) ?? [];
    list.push(response);
    this.responses.set(id, list);
    return { response, questionnaire: q };
  }

  listResponses(questionnaireId: string): FormResponse[] {
    this.get(questionnaireId);
    return [...(this.responses.get(questionnaireId) ?? [])].sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt),
    );
  }

  analytics(questionnaireId: string) {
    const q = this.get(questionnaireId);
    const submissions = this.listResponses(questionnaireId);
    const byQuestion: Record<
      string,
      {
        type: string;
        responseCount: number;
        choiceCounts?: Record<string, number>;
        numeric?: { min: number; max: number; avg: number };
        textSamples?: string[];
      }
    > = {};

    for (const question of q.questions) {
      byQuestion[question.id] = this.summarizeQuestion(question, submissions);
    }

    return {
      questionnaireId,
      title: q.title,
      submissionCount: submissions.length,
      byQuestion,
    };
  }

  exportQuestionnaire(id: string): Questionnaire {
    return this.get(id);
  }

  importQuestionnaire(dto: ImportQuestionnaireDto): Questionnaire {
    this.assertQuestionsValid(dto.questions as Question[]);
    let id: string;
    if (dto.id) {
      if (this.questionnaires.has(dto.id)) {
        throw new BadRequestException(
          `Questionnaire id ${dto.id} already exists; omit id to generate one.`,
        );
      }
      id = dto.id;
    } else {
      id = uuidv4();
    }
    const ts = nowIso();
    const entity: Questionnaire = {
      id,
      title: dto.title,
      description: dto.description,
      questions: dto.questions as Question[],
      createdAt: ts,
      updatedAt: ts,
      publishedAccessToken: null,
    };
    this.questionnaires.set(id, entity);
    if (!this.responses.has(id)) this.responses.set(id, []);
    return entity;
  }

  exportResponses(questionnaireId: string): FormResponse[] {
    return this.listResponses(questionnaireId);
  }

  importResponses(
    questionnaireId: string,
    dto: ImportResponsesDto,
  ): { imported: number } {
    this.get(questionnaireId);
    const list = this.responses.get(questionnaireId) ?? [];
    const q = this.get(questionnaireId);
    for (const row of dto.responses) {
      const answers = this.normalizeAndValidateAnswers(q.questions, row.answers);
      const id =
        row.id && !list.some((r) => r.id === row.id) ? row.id : uuidv4();
      list.push({
        id,
        questionnaireId,
        answers,
        submittedAt: row.submittedAt ?? nowIso(),
      });
    }
    this.responses.set(questionnaireId, list);
    return { imported: dto.responses.length };
  }

  private assertPublishedToken(q: Questionnaire, token: string): void {
    if (!q.publishedAccessToken) {
      throw new BadRequestException('This questionnaire is not published.');
    }
    if (q.publishedAccessToken !== token) {
      throw new UnauthorizedException('Invalid access token.');
    }
  }

  private assertQuestionsValid(questions: Question[]): void {
    const ids = new Set<string>();
    for (const qu of questions) {
      if (!qu.id?.trim()) throw new BadRequestException('Each question needs an id.');
      if (ids.has(qu.id)) throw new BadRequestException(`Duplicate question id: ${qu.id}`);
      ids.add(qu.id);
      if (['single_choice', 'multiple_choice'].includes(qu.type)) {
        if (!qu.options?.length) {
          throw new BadRequestException(
            `Question ${qu.id} of type ${qu.type} requires options.`,
          );
        }
      }
    }
  }

  private normalizeAndValidateAnswers(
    questions: Question[],
    raw: Record<string, unknown>,
  ): Record<string, AnswerValue> {
    const out: Record<string, AnswerValue> = {};
    for (const qu of questions) {
      const v = raw[qu.id];
      const empty = isEmptyAnswer(v);
      if (qu.required && empty) {
        throw new BadRequestException(`Missing required answer for: ${qu.label}`);
      }
      if (empty) {
        out[qu.id] = null;
        continue;
      }
      out[qu.id] = this.coerceAnswer(qu, v);
    }
    for (const key of Object.keys(raw)) {
      if (!questions.some((q) => q.id === key)) {
        throw new BadRequestException(`Unknown question id in answers: ${key}`);
      }
    }
    return out;
  }

  private coerceAnswer(qu: Question, v: unknown): AnswerValue {
    switch (qu.type) {
      case 'short_text':
      case 'long_text':
      case 'date':
        if (typeof v !== 'string') {
          throw new BadRequestException(`Answer for ${qu.id} must be a string.`);
        }
        return v;
      case 'number': {
        const n = typeof v === 'number' ? v : Number(v);
        if (Number.isNaN(n)) {
          throw new BadRequestException(`Answer for ${qu.id} must be a number.`);
        }
        return n;
      }
      case 'single_choice': {
        if (typeof v !== 'string') {
          throw new BadRequestException(`Answer for ${qu.id} must be a string option.`);
        }
        if (!qu.options?.includes(v)) {
          throw new BadRequestException(`Invalid option for ${qu.id}.`);
        }
        return v;
      }
      case 'multiple_choice': {
        if (!Array.isArray(v) || !v.every((x) => typeof x === 'string')) {
          throw new BadRequestException(
            `Answer for ${qu.id} must be an array of strings.`,
          );
        }
        for (const opt of v) {
          if (!qu.options?.includes(opt)) {
            throw new BadRequestException(`Invalid option for ${qu.id}: ${opt}`);
          }
        }
        return v;
      }
      default:
        return String(v);
    }
  }

  private summarizeQuestion(question: Question, submissions: FormResponse[]) {
    const values = submissions
      .map((s) => s.answers[question.id])
      .filter((a) => !isEmptyAnswer(a));

    const base = {
      type: question.type,
      responseCount: values.length,
    };

    if (question.type === 'single_choice' || question.type === 'multiple_choice') {
      const choiceCounts: Record<string, number> = {};
      for (const opt of question.options ?? []) choiceCounts[opt] = 0;
      for (const val of values) {
        if (question.type === 'single_choice' && typeof val === 'string') {
          choiceCounts[val] = (choiceCounts[val] ?? 0) + 1;
        } else if (question.type === 'multiple_choice' && Array.isArray(val)) {
          for (const opt of val) {
            choiceCounts[opt] = (choiceCounts[opt] ?? 0) + 1;
          }
        }
      }
      return { ...base, choiceCounts };
    }

    if (question.type === 'number') {
      const nums = values.filter((v): v is number => typeof v === 'number');
      if (!nums.length) return { ...base, numeric: { min: 0, max: 0, avg: 0 } };
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      return { ...base, numeric: { min, max, avg } };
    }

    const textSamples = values
      .map((v) => (typeof v === 'string' ? v : JSON.stringify(v)))
      .slice(0, 5);
    return { ...base, textSamples };
  }
}
