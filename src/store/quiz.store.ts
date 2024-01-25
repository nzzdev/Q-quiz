import type {
  ElementItemStore,
  QQuizSvelteProperties,
  QuizStore,
} from '@src/interfaces';
import { get, writable } from 'svelte/store';

const store = () => {
  const state: QuizStore = {
    items: [],
    isMultiQuiz: false,
    numberQuestions: 0,
    hasCover: false,
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
        items: storeItems,
        isMultiQuiz: componentItem.questionCount > 1,
        numberQuestions: componentItem.questionCount,
        hasCover: componentItem.hasCover,
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
    answerdQuestion: () => {
      update((state) => {
        const step = state.step;
        const foundedItem = state.items.find(
          (item) => item.progressIndex === step
        );
        console.log('answer', step, foundedItem, state.items);
        if (foundedItem) {
          foundedItem.isAnswered = true;
        }
        return state;
      });
    },
    isAnswered: () => {
      const storeItems = get({ subscribe });
      const step = storeItems.step;
      const foundedItem = storeItems.items.find(
        (item) => item.progressIndex === step
      );
      console.log('isAnswered', step, foundedItem);
      return foundedItem?.isAnswered || false;
    },
  };
  return { subscribe, set, update, ...methods };
};
export const quizStore = store();
