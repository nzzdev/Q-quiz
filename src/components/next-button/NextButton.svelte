<script lang="ts">
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';

  import type { QuizStoreContext } from '@src/interfaces';
  import key from '../../services/key-service';

  import Button from '../atomic/Button.svelte';
  import Text from './Text.svelte';
  import { EventTrackingService } from '@src/services/event-tracking';

  export let defaultVisibility = true;
  export let isButtonWithIcon = false;

  const { quizStore, questionContainerStore, containerWidthStore } = getContext(
    key
  ) as QuizStoreContext;

  const nextQuestion = (event: Event): void => {
    alert('nextQuestion');
    if ($quizStore.step <= $quizStore.numberQuestions) {
      const detail = EventTrackingService.getDetails(
        $quizStore.items,
        $quizStore.qItemId,
        event
      );

      quizStore.stepForward();

      EventTrackingService.trackNextScreen(detail.element);
    }

    if (!defaultVisibility) {
      togglenNextButton();
    }

    if ($questionContainerStore) {
      const appActive: boolean =
        !!(window as any).NZZ && (window as any).NZZ.metadata;
      const nzzHeader = appActive ? 100 : 56;
      var offsetPosition =
        $questionContainerStore.getBoundingClientRect().top +
        window.scrollY -
        nzzHeader;
      window.scrollTo({
        top: offsetPosition,
      });
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
    <Button
      showArrowRight={true}
      on:action={(event) => nextQuestion(event.detail.event)}
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
            isJumpAnswer={true}
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
