import { QuizElementType } from './enums';
import type { Multiplicators } from './interfaces';

export const scoredQuestionTypes = [
  QuizElementType.MultipleChoice,
  QuizElementType.NumberGuess,
  QuizElementType.MapPointGuess,
];
export const multiplicators: Multiplicators = {
  multipleChoice: 5,
  numberGuess: 10,
  mapPointGuess: 10,
  numberPoll: 10,
};
