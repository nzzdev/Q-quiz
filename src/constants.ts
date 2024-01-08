import { QuestionType } from './enums';
import type { Multiplicators } from './interfaces';

export const scoredQuestionTypes = [
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.NUMBER_GUESS,
  QuestionType.MAP_POINT_GUESS,
];
export const multiplicators: Multiplicators = {
  multipleChoice: 5,
  numberGuess: 10,
  mapPointGuess: 10,
  numberPoll: 10,
};
