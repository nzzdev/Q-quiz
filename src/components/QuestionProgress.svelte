<script lang="ts">
  import { getContext } from 'svelte';

  import key from '../services/key-service';

  import type { QuizStoreContext } from '@src/interfaces';
  import NextButton from './next-button/NextButton.svelte';

  const { quizStore } = getContext(key) as QuizStoreContext;

  export let isShowNextButton = true;
</script>

<nav
  class:q-quiz-header--is-empty={$quizStore.hasCover && $quizStore.step === 0}
  class="q-quiz-container q-quiz-header {$quizStore.isMultiQuiz
    ? 'q-quiz-multi-header'
    : 'q-quiz-single-header'}"
>
  {#if $quizStore.isMultiQuiz}
    <div class="question-state s-font-note-s">
      {#if $quizStore.step > $quizStore.numberQuestions}
        Fertig!
      {:else if $quizStore.step === $quizStore.numberQuestions}
        letzte Frage
      {:else}
        Frage {$quizStore.step} / {$quizStore.numberQuestions}
      {/if}
    </div>
    {#if isShowNextButton}
      <div class="next-button">
        <NextButton />
      </div>
    {/if}
  {/if}
</nav>

<style lang="scss">
  @import '../styles/variables.scss';
  .question-state {
    color: $darkerGray;
  }
  .q-quiz-header {
    opacity: 1;
    transition: opacity 0.2s ease-in;
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

    justify-content: space-between;
    align-items: center;
  }
</style>
