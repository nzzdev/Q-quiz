import { QuizElementType } from '@src/enums';
import type {
  Cover,
  LastCard,
  LastCardDoc,
  MapPointGuess,
  MapPointGuessDoc,
  MultipleChoice,
  MultipleChoiceDoc,
  NumberGuess,
  NumberGuessDoc,
  NumberPoll,
  NumberPollDoc,
  QuizDoc,
  QuizElements,
} from '@src/interfaces';

export function transform(item: QuizDoc): QuizElements {
  // extract only one of the possibly existing cover elements, undefined otherwise
  const coverElement = item.elements.find(
    (element) => element.type === QuizElementType.Cover
  ) as Cover | undefined;
  const hasCover = coverElement !== undefined;

  // extract only one of the possibly existing last card elements, undefined otherwise
  let lastCardElement: LastCard | undefined;
  const lastCardElementDoc = item.elements.find(
    (element) => element.type === QuizElementType.LastCard
  ) as LastCardDoc | undefined;
  const hasLastCard = lastCardElementDoc !== undefined;

  if (hasLastCard) {
    lastCardElement = lastCardElementDoc as LastCard;

    if (lastCardElementDoc?.articleRecommendations) {
      lastCardElement.urlRecommendations = {
        links: lastCardElementDoc.articleRecommendations.map((article) => {
          return {
            url: article.articleId,
            text: article.text,
          };
        }),
      };

      if (lastCardElementDoc.articleRecommendationThema) {
        lastCardElement.urlRecommendations.themaAddText =
          lastCardElementDoc.articleRecommendationThema;
      }
    }
  }

  // extract question elements
  let questionElements: (
    | MultipleChoice
    | MapPointGuess
    | NumberPoll
    | NumberGuess
  )[] = [];
  const questionElementsDoc = item.elements.filter(
    (element) =>
      element.type !== QuizElementType.Cover &&
      element.type !== QuizElementType.LastCard
  ) as (
    | MultipleChoiceDoc
    | MapPointGuessDoc
    | NumberPollDoc
    | NumberGuessDoc
  )[];

  const numberElements = questionElementsDoc.length;

  questionElements = questionElementsDoc.map((doc) => {
    let element = doc as
      | MultipleChoice
      | MapPointGuess
      | NumberPoll
      | NumberGuess;
    if (doc?.articleRecommendations) {
      element.urlRecommendations = {
        links: doc.articleRecommendations.map((article) => {
          return {
            url: article.articleId,
            text: article.text,
          };
        }),
      };

      if (doc.articleRecommendationThema) {
        element.urlRecommendations.themaAddText =
          doc.articleRecommendationThema;
      }
    }

    return element;
  });

  console.log('questionElements', questionElements, questionElementsDoc);
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
