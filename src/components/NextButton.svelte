<script lang="ts">
  import { onMount } from 'svelte';

  import { quizStore } from '@src/store/quiz.store';
  import ChevronRight from '../resources/chevron-right.svg';

  export let defaultVisibility = true;
  export let isButtonWithIcon = false;
  // TODO: decision to header (parent component)
  export const togglenNextButton = (): void => {
    isVisible = !isVisible;
  };

  const nextQuestion = (): void => {
    if ($quizStore.step <= $quizStore.numberQuestions) {
      quizStore.stepForward();
    }

    if (!defaultVisibility) {
      togglenNextButton();
    }
  };
  let isVisible = true;

  onMount(() => {
    isVisible = defaultVisibility;
  });
</script>

<div class:button-container--hidden={!isVisible} class="button-container">
  {#if isButtonWithIcon}
    <button
      class="q-quiz-button q-quiz-button--horizontal q-quiz-button--right s-font-note-s"
      on:click={nextQuestion}
    >
      <div class="q-quiz-button__content">
        <span>nächste Frage</span>
        <div
          class="q-quiz-button__icon q-quiz-button__icon s-button s-button--small s-button--circular"
        >
          {@html ChevronRight}
        </div>
      </div>
    </button>
  {:else}
    <button
      class:q-quiz-button--hidden={$quizStore.hasCover}
      class="q-quiz-button q-quiz-button--horizontal s-font-note-s"
      on:click={nextQuestion}
    >
      <div class="q-quiz-button__content">
        <span class="s-color-primary-7">nächste Frage</span>
      </div>
    </button>
  {/if}
</div>

<style lang="scss">
  .button-container {
    height: fit-content;
    overflow: hidden;

    &--hidden {
      height: 0;
    }
  }
</style>
