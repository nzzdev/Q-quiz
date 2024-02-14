<script lang="ts">
  import { getContext } from 'svelte';

  import type { MultipleChoice, QuizStoreFn } from '@src/interfaces';
  import key from '../../services/key-service';

  import Button from '../atomic/Button.svelte';
  import BaseElement from '../quiz-base-elelement/BaseElement.svelte';
  import Answer from './Answer.svelte';

  export let element: MultipleChoice;
  export let toolBaseUrl: string;

  const quizStore = getContext(key) as QuizStoreFn;

  let userAnswer: string;
  let shuffledAnswers = shuffleArray(element.choices.concat([element.answer]));

  function getResult(answer: string) {
    quizStore.answerdQuestion($quizStore.qItemId, element, answer).then(() => {
      userAnswer = answer;
    });
  }

  function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length;
    let temporaryValue: T;
    let randomIndex: number;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
</script>

<BaseElement {element} isAnswered={!!userAnswer}>
  {#if userAnswer}
    <Answer
      id={element.id}
      answers={shuffledAnswers}
      {userAnswer}
      correctAnswer={element.answer}
      {toolBaseUrl}
    />
  {:else}
    <div class="q-quiz-input">
      {#each shuffledAnswers as answer, idx}
        <div class:answer-button={idx < shuffledAnswers.length - 1}>
          <Button on:action={() => getResult(answer)}>{answer}</Button>
        </div>
      {/each}
    </div>
  {/if}
</BaseElement>

<style lang="scss">
  @import '../../styles/variables';
  .answer-button {
    margin-bottom: $atomicGap;
  }
</style>
