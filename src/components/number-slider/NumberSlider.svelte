<script lang="ts">
  import type { SliderQuestion } from '@src/interfaces';

  import BaseElement from '../quiz-base-elelement/BaseElement.svelte';
  import Statistic from './Statistic.svelte';
  import { quizStore } from '@src/store/quiz.store';

  export let element: SliderQuestion;
  export let toolBaseUrl: string;

  let userAnswer = (element.max - element.min) / 2 + element.min;
  let isAnswered = false;
  $: labelPosition = !userAnswer
    ? 50
    : ((userAnswer - element.min) / (element.max - element.min)) * 100;

  function getResult() {
    quizStore
      .answerdQuestion($quizStore.qItemId, element, userAnswer)
      .then(() => {
        isAnswered = quizStore.isAnswered();
      });
  }
</script>

<BaseElement {element} {isAnswered}>
  <div class="q-quiz-input">
    {#if isAnswered}
      <Statistic {element} {userAnswer} {toolBaseUrl} />
    {:else}
      <div class="q-quiz-input-range-container">
        <div class="q-quiz-input-range-position-label-container">
          <div
            class="q-quiz-input-range-position-label s-color-primary-5"
            style="left: {labelPosition}%"
          >
            <span
              class="s-font-note s-font-note--tabularnums s-font-note--strong"
            >
              <span
                class="q-quiz-input-range-position-label__label s-color-gray-1"
              >
                {userAnswer}
              </span>
            </span>
          </div>
        </div>
        <input
          type="range"
          class="s-input-range s-input-range--large"
          min={element.min}
          max={element.max}
          step={element.step}
          bind:value={userAnswer}
        />
        <div
          class="
        q-quiz-input-range-min
        s-font-note-s s-font-note-s--light
        s-font-note--tabularnums
      "
        >
          {element.min}
          {#if element.unit}
            {element.min === 1 && element.unit_sinpular
              ? element.unit_sinpular
              : element.unit}
          {/if}
        </div>
        <div
          class="
        q-quiz-input-range-max
        s-font-note-s s-font-note-s--light
        s-font-note--tabularnums
      "
        >
          {element.max}
          {#if element.unit}
            {element.max === 1 && element.unit_sinpular
              ? element.unit_sinpular
              : element.unit}
          {/if}
        </div>
      </div>

      <button
        class="s-button s-button--small q-quiz-answer-button"
        on:click={getResult}
      >
        <span>Antworten</span>
      </button>
    {/if}
  </div>
</BaseElement>

<style lang="scss">
  $basis-margin: 4px;
  .q-quiz-input-range-container {
    position: relative;
    padding-top: 1em;
  }

  .q-quiz-input-range-container::after {
    content: '';
    display: table;
    clear: left;
  }

  .q-quiz-input-range-min {
    float: left;
    padding-top: 8px;
  }

  .q-quiz-input-range-max {
    float: right;
    padding-top: 8px;
  }

  .q-quiz-input-range-position-label-container {
    position: relative;
    margin: 0 14px 9px 14px;
    height: 1em;
  }

  .q-quiz-input-range-position-label-container {
    margin: 0 14px (9px + ($basis-margin * 3));
  }

  .q-quiz-input-range-position-label {
    position: absolute;
    width: 200px;
    text-align: center;
    transform: translateX(-50%);
  }

  .q-quiz-input-range-position-label-container {
    margin: 0 14px (9px + ($basis-margin * 3));
  }

  .q-quiz-input-range-position-label {
    background-color: currentColor;
    width: max-content;
    max-width: 200px;
    border-radius: 4px;
    text-align: center;
  }

  .q-quiz-input-range-position-label__label {
    padding: 0 $basis-margin;
  }
</style>
