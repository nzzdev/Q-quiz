<script lang="ts">
  import { quizStore } from '@src/store/quiz.store';
  import NextButton from './next-button/NextButton.svelte';
  import { number } from 'joi';
</script>

<header
  class:q-quiz-header--is-empty={$quizStore.hasCover && $quizStore.step === 0}
  class="q-quiz-header s-color-gray-4 {$quizStore.isMultiQuiz
    ? 'q-quiz-multi-header'
    : 'q-quiz-single-header'}"
>
  {#if $quizStore.isMultiQuiz}
    <div class="q-quiz-header__title s-font-note-s">
      {#if $quizStore.step > $quizStore.numberQuestions}
        Fertig!
      {:else if $quizStore.step === $quizStore.numberQuestions}
        letzte Frage
      {:else}
        Frage {$quizStore.step} / {$quizStore.numberQuestions}
      {/if}
    </div>
    <div class="next-button">
      <NextButton />
    </div>
  {/if}
</header>

<style lang="scss">
  .q-quiz-header {
    border-bottom: 1px solid currentColor;
    margin-bottom: 16px;
    opacity: 1;
    transition: opacity 0.2s ease-in;

    .next-button {
      display: flex;
      justify-content: flex-end;
    }
  }
  .q-quiz-header--is-empty {
    border-bottom-color: transparent;
    height: 0;
    margin: 0;
    padding: 0;
    opacity: 0;
  }
  .q-quiz-multi-header {
    display: flex;

    justify-content: flex-end;
    align-items: center;

    > * {
      width: 33.3333%;
      flex-grow: 0;
    }

    padding-bottom: 8px;
  }

  .q-quiz-header__title {
    text-align: center;
  }
</style>
