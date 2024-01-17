import { QuizElementType } from '@src/enums';
import type {
  CoverElement,
  LastCard,
  MapPointGuess,
  MultipleChoice,
  NumberGuess,
  NumberPoll,
  QuizDoc,
  QuizElements,
} from '@src/interfaces';

export function transform(item: QuizDoc): QuizElements {
  // extract only one of the possibly existing cover elements, undefined otherwise
  const coverElement = item.elements.find(
    (element) => element.type === QuizElementType.Cover
  ) as CoverElement | undefined;
  const hasCover = coverElement !== undefined;

  // extract only one of the possibly existing last card elements, undefined otherwise
  const lastCardElement = item.elements.find(
    (element) => element.type === QuizElementType.LastCard
  ) as LastCard | undefined;
  const hasLastCard = lastCardElement !== undefined;

  // extract question elements
  const questionElements = item.elements.filter(
    (element) =>
      element.type !== QuizElementType.Cover &&
      element.type !== QuizElementType.LastCard
  ) as (MultipleChoice | MapPointGuess | NumberPoll | NumberGuess)[];
  let numberElements = questionElements.length;

  // prepare data for server side rendering
  return {
    questions: questionElements,
    cover: coverElement,
    lastCard: lastCardElement,
    hasCover,
    hasLastCard,
    questionCount: numberElements,
  };
}
