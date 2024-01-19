<script lang="ts">
  import NextButton from './NextButton.svelte';

  export let hasCover = false;
  export let isMultiQuiz = false;
  export let numberQuestions = 0;
  export let questionStep: number;
</script>

<header
  class:q-quiz-header--is-empty={hasCover}
  class="q-quiz-header s-color-gray-4 {isMultiQuiz
    ? 'q-quiz-multi-header'
    : 'q-quiz-single-header'}"
>
  {#if isMultiQuiz}
    <div class="q-quiz-header__title s-font-note-s">
      {#if !hasCover}
        Frage {questionStep + 1} / {numberQuestions}
      {/if}
    </div>
    <div class="next-button">
      <NextButton {hasCover} {numberQuestions} bind:questionStep />
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

  .q-quiz-button--hidden {
    visibility: hidden;
    pointer-events: none;
  }
</style>
