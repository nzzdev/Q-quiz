import type { QuestionType } from './enums';
import type { QuizQuestionId } from './types';

export interface DisplayOptions {
  hideTitle?: boolean;
}

export interface ToolRuntimeConfig {
  displayOptions?: DisplayOptions;
  fileRequestBaseUrl: string;
  toolBaseUrl: string;
  id: string;
  size: ToolRuntimeConfigSize;
  isPure: boolean;
  requestId: string;
  markup?: string;
  noInteraction?: boolean;
}

export interface ToolRuntimeConfigSize {
  width: Array<{
    value: number;
    unit: string;
    comparison: '=' | '>' | '<' | '>=' | '<=';
  }>;
}

export interface QuestionData {
  answer: number;
  // TODO
  articleRecommendations: any[];
  id: QuizQuestionId;
  introduction: string;
  max: number;
  min: number;
  question: string;
  questionSubTitle: string;
  step: number;
  type: QuestionType;
}

export interface AnswerStatistic {
  value: number;
  count: number;
}

export interface DBOptions {
  auth?: DBAuthOptions;
}

export interface DBAuthOptions {
  username: string;
  password: string;
}

export interface AnswerQueryOptions {
  start_key?: number[];
  end_key?: (number | {})[];
  group?: boolean;
}

export interface AnswerNumberOption {
  key?: string;
  reduce?: boolean;
}

export interface QItem {
  _id: string;
  title: string;
  notes: string;
  type?: string;
  data?: any;
}
