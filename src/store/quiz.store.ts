import type {
  DBAnswerData,
  DBAnswerMapPointGuessValue,
  ElementItemStore,
  MapPointGuess,
  MultipleChoice,
  QQuizSvelteProperties,
  QuizBaseQuestion,
  QuizStore,
  SliderQuestion,
} from '@src/interfaces';
import { get, writable } from 'svelte/store';

const store = () => {
  const state: QuizStore = {
    qItemId: '',
    items: [],
    isMultiQuiz: false,
    numberQuestions: 0,
    hasCover: false,
    hasLastCard: false,
    hasScore: false,
    step: 0,
    configuration: {
      imageServiceUrl: '',
      enrico: { products: [], url: '' },
      mapConfiguration: { attribution: '', styleUrl: '' },
      toolBaseUrl: '',
    },
  };
  const { subscribe, set, update } = writable(state);

  const methods = {
    initialize: (componentConfiguration: QQuizSvelteProperties) => {
      const componentItem = componentConfiguration.item;
      const storeItems: ElementItemStore[] = [];

      if (componentItem.cover) {
        storeItems.push({
          item: componentItem.cover,
          isAnswered: false,
          isLastQuizElement: false,
          progressIndex: -1,
        });
      }

      storeItems.push(
        ...componentItem.questions.map((question, index) => ({
          item: question,
          isAnswered: false,
          isLastQuizElement: componentItem.questionCount === index + 1,
          progressIndex: index + 1,
        }))
      );

      if (componentItem.lastCard) {
        storeItems.push({
          item: componentItem.lastCard,
          isAnswered: false,
          isLastQuizElement: false,
          progressIndex: componentItem.questionCount + 1,
        });
      }
      const quizStore: QuizStore = {
        qItemId: componentConfiguration.id,
        items: storeItems,
        isMultiQuiz: componentItem.questionCount > 1,
        numberQuestions: componentItem.questionCount,
        hasCover: componentItem.hasCover,
        hasLastCard: componentItem.hasLastCard,
        hasScore:
          componentConfiguration.item.lastCard?.isFinalScoreShown || false,
        step: componentItem.hasCover ? 0 : 1,
        configuration: {
          imageServiceUrl: componentConfiguration.imageServiceUrl,
          enrico: componentConfiguration.enrico,
          mapConfiguration: componentConfiguration.mapConfiguration,
          toolBaseUrl: componentConfiguration.toolBaseUrl,
        },
      };

      update(() => quizStore);
    },
    stepForward: () => {
      update((state) => {
        state.step += 1;
        return state;
      });
    },
    answerdQuestion: async (
      qItemId: string,
      element: MultipleChoice | SliderQuestion | MapPointGuess,
      answer: DBAnswerMapPointGuessValue | string | number
    ) => {
      const storeItems = get({ subscribe });
      const data: DBAnswerData = {
        itemId: qItemId,
        questionId: element.id,
        type: element.type,
        value: answer,
      };

      return fetch(`${storeItems.configuration.toolBaseUrl}/answer`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ data }),
      })
        .then((response) => {
          if (response.ok) {
            update((state) => {
              const step = state.step;
              const foundedItem = state.items.find(
                (item) => item.progressIndex === step
              );
              if (foundedItem) {
                const question = foundedItem.item as QuizBaseQuestion;
                foundedItem.isAnswered = true;
                question.userAnswer = {
                  answer: answer,
                  isCorrect: true,
                };
              }
              return state;
            });
          } else {
            // TODO:
            console.error('repsonse not ok', response.statusText);
          }
        })
        .catch((error) => {
          console.error('error', error);
        });
    },
    isAnswered: () => {
      const storeItems = get({ subscribe });
      const step = storeItems.step;
      const foundedItem = storeItems.items.find(
        (item) => item.progressIndex === step
      );
      return foundedItem?.isAnswered || false;
    },
  };
  return { subscribe, set, update, ...methods };
};

export const quizStoreClass = store;
