<script lang="ts">
  import { onMount } from 'svelte';

  import type { QuizStoreFn } from '@src/interfaces';
  import Text from './Text.svelte';
  import Button from '../atomic/Button.svelte';
  import key from '../../services/key-service';
  import { getContext } from 'svelte';
  import { svelteStore } from '../store.svelte';
  const quizStore = getContext(key) as QuizStoreFn;

  export let defaultVisibility = true;
  export let isButtonWithIcon = false;

  let isVisible = true;

  const nextQuestion = (): void => {
    if ($svelteStore.step <= $svelteStore.numberQuestions) {
      svelteStore.stepForward();
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
    $svelteStore.step > $svelteStore.numberQuestions ||
    ($svelteStore.step === $svelteStore.numberQuestions &&
      !$svelteStore.hasLastCard)}
  class="button-container"
>
  {#if isButtonWithIcon}
    <Button showArrowRight={true} on:action={() => nextQuestion()}
      ><Text
        actualStep={$svelteStore.step}
        totalSteps={$svelteStore.numberQuestions}
        hasScore={$svelteStore.hasScore}
      /></Button
    >
  {:else}
    <button
      class:q-quiz-button--hidden={$svelteStore.hasCover}
      class="q-quiz-button q-quiz-button--horizontal s-font-note-s"
      on:click={nextQuestion}
    >
      <div class="q-quiz-button__content">
        <span class="s-color-primary-7"
          ><Text
            actualStep={$svelteStore.step}
            totalSteps={$svelteStore.numberQuestions}
            hasScore={$svelteStore.hasScore}
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
