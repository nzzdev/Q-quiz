<script lang="ts">
  import { quizStore } from '@src/store/quiz.store';
  import { ColorDefaults } from '@src/constants';

  import NextButton from './next-button/NextButton.svelte';

  export let isShowNextButton = true;
</script>

<nav
  class:q-quiz-header--is-empty={$quizStore.hasCover && $quizStore.step === 0}
  class="q-quiz-container q-quiz-header s-color-gray-4 {$quizStore.isMultiQuiz
    ? 'q-quiz-multi-header'
    : 'q-quiz-single-header'}"
>
  {#if $quizStore.isMultiQuiz}
    <div
      class="q-quiz-header__title s-font-note-s"
      style:color={ColorDefaults.QuizProgress.Color.Text}
    >
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
  .q-quiz-header {
    // TODO: 25px to variable as global gap
    padding-bottom: 25px;
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
