<script lang="ts">
  import { onMount } from 'svelte';

  import { quizStores, storeUuid } from '@src/store/quiz.store';

  import Text from './Text.svelte';
  import Button from '../atomic/Button.svelte';

  export let defaultVisibility = true;
  export let isButtonWithIcon = false;

  let isVisible = true;
  const quizStore = quizStores[storeUuid];

  const nextQuestion = (): void => {
    if ($quizStore.step <= $quizStore.numberQuestions) {
      quizStore.stepForward();
    }

    if (!defaultVisibility) {
      togglenNextButton();
    }

    const mainContainer = document.querySelector('#q-quiz-elements');

    if (mainContainer) {
      mainContainer.scrollIntoView();
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
    <Button showArrowRight={true} on:action={() => nextQuestion()}
      >Nächste Frage anzeigen</Button
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
