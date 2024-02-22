<script lang="ts">
  import { getContext } from 'svelte';

  import { EventTrackingService } from '@src/services/event-tracking';
  import key from '@src/services/key-service';
  import type { MultipleChoice, QuizStoreContext } from '@src/interfaces';

  import BaseElement from '../quiz-base-elelement/BaseElement.svelte';
  import Button from '../atomic/Button.svelte';
  import Answer from './Answer.svelte';

  export let element: MultipleChoice;
  export let toolBaseUrl: string;

  $: log = '2. ';
  $: isArticle = document.querySelector('.ld-1741686');

  const { quizStore } = getContext(key) as QuizStoreContext;

  let userAnswer: string;
  let shuffledAnswers = shuffleArray(element.choices.concat([element.answer]));

  function getResult(answer: string, event: CustomEvent) {
    log += `qItemId: ${$quizStore.qItemId}`;
    log += `userAnswer: ${JSON.stringify(answer)}`;
    log += `element: ${JSON.stringify(element)}`;
    quizStore.answerdQuestion($quizStore.qItemId, element, answer).then(() => {
      userAnswer = answer;
      const detail = EventTrackingService.getDetails(
        $quizStore.items,
        $quizStore.qItemId,
        event
      );
      const step = $quizStore.step;
      const countStep = $quizStore.numberQuestions;
      EventTrackingService.trackAnswer(
        detail.title,
        step,
        countStep,
        detail.element
      );
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

{#if isArticle}
  <div class="s-font-note-s">Sie können nur ein Antwort geben</div>
  <div class="s-font-note-s">{log}</div>
{/if}

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
          <Button on:action={(event) => getResult(answer, event.detail.event)}
            >{answer}</Button
          >
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
