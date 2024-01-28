<script lang="ts">
  import type { DBAnswerData, MultipleChoice } from '@src/interfaces';

  import Answer from './Answer.svelte';
  import BaseElement from '../quiz-base-elelement/BaseElement.svelte';
  import { quizStore } from '@src/store/quiz.store';

  export let element: MultipleChoice;
  export let toolBaseUrl: string;

  let userAnswer: string;

  $: shuffledAnswers = shuffleArray(element.choices.concat([element.answer]));

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

<BaseElement {element}>
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
      {#each shuffledAnswers as answer}
        <button
          class="s-button s-button--secondary s-button--small q-quiz-answer-button"
          value={answer}
          on:click={() =>
            quizStore.answerdQuestion($quizStore.qItemId, element, answer)}
        >
          <span style="pointer-events: none;">{answer}</span>
        </button>
      {/each}
    </div>
  {/if}
</BaseElement>
