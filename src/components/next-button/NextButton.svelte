<script lang="ts">
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';

  import type { QuizStoreContext } from '@src/interfaces';
  import key from '../../services/key-service';

  import Button from '../atomic/Button.svelte';
  import Text from './Text.svelte';

  export let defaultVisibility = true;
  export let isButtonWithIcon = false;

  const { quizStore, questionContainerStore } = getContext(
    key
  ) as QuizStoreContext;

  const nextQuestion = (): void => {
    if ($quizStore.step <= $quizStore.numberQuestions) {
      quizStore.stepForward();
    }

    if (!defaultVisibility) {
      togglenNextButton();
    }

    if ($questionContainerStore) {
      $questionContainerStore.scrollIntoView();
    }
  };

  const togglenNextButton = (): void => {
    isVisible = !isVisible;
  };

  let isVisible = true;

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
    <Button showArrowRight={true} on:action={() => nextQuestion()}
      ><Text
        actualStep={$quizStore.step}
        totalSteps={$quizStore.numberQuestions}
        hasScore={$quizStore.hasScore}
      /></Button
    >
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
