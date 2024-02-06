import type { QuizElementType } from './enums';

export type QuizQuestionId = string;
export type StatisticViewKey = [string, string | number];
export type MapPointGuessStatisticViewKey = [string, number, number, number];
export type AnswerStatistic = string | number;
export type QuestionScoreTypes =
  | QuizElementType.MultipleChoice
  | QuizElementType.NumberGuess
  | QuizElementType.MapPointGuess;
