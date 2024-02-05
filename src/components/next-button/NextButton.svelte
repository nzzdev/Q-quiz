<script lang="ts">
  import { onMount } from 'svelte';

  import { quizStore } from '@src/store/quiz.store';
  import ChevronRight from '../../resources/chevron-right.svg';
  import Text from './Text.svelte';

  export let defaultVisibility = true;
  export let isButtonWithIcon = false;

  let isVisible = true;

  const nextQuestion = (): void => {
    if ($quizStore.step <= $quizStore.numberQuestions) {
      quizStore.stepForward();
    }

    if (!defaultVisibility) {
      togglenNextButton();
    }
  };

  const togglenNextButton = (): void => {
    isVisible = !isVisible;
  };

  onMount(() => {
    isVisible = defaultVisibility;
  });
</script>

<div
  class:button-container--hidden={!isVisible ||
    $quizStore.step > $quizStore.numberQuestions ||
    ($quizStore.step === $quizStore.numberQuestions && !$quizStore.hasLastCard)}
  class="button-container"
>
  {#if isButtonWithIcon}
    <button
      class="q-quiz-button q-quiz-button--horizontal q-quiz-button--right s-font-note-s"
      on:click={nextQuestion}
    >
      <div class="q-quiz-button__content">
        <span>
          <Text
            actualStep={$quizStore.step}
            totalSteps={$quizStore.numberQuestions}
            hasScore={$quizStore.hasScore}
          />
        </span>
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
        <span class="s-color-primary-7"
          ><Text
            actualStep={$quizStore.step}
            totalSteps={$quizStore.numberQuestions}
            hasScore={$quizStore.hasScore}
          /></span
        >
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
