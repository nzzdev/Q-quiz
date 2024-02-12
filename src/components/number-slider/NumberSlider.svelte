<script lang="ts">
  import type { SliderQuestion } from '@src/interfaces';

  import BaseElement from '../quiz-base-elelement/BaseElement.svelte';
  import Statistic from './Statistic.svelte';
  import { quizStore } from '@src/store/quiz.store';
  import Button from '../atomic/Button.svelte';

  export let element: SliderQuestion;
  export let toolBaseUrl: string;

  let userAnswer = round(
    (element.max - element.min) / 2 + element.min,
    countDecimalPlaces(element.step)
  );
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

  function round(value: number, exponent: number) {
    let roundCount = 1;
    if (exponent > 0) {
      roundCount = Math.pow(10, exponent);
    }
    return Math.floor((value * roundCount) / roundCount);
  }

  function countDecimalPlaces(num: number): number {
    const str = num.toString();
    const index = str.indexOf('.');
    return index !== -1 ? str.length - index - 1 : 0;
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
        s-font-note-s s-font-note-s--strong
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
        s-font-note-s s-font-note-s--strong
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

      <Button on:action={getResult}>Antworten</Button>
    {/if}
  </div>
</BaseElement>

<style lang="scss">
  @import '../../styles/variables.scss';
  $basis-margin: 4px;

  .q-quiz-input-range-container {
    position: relative;
    padding-top: 1em;

    input[type='range'] {
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
    }

    /***** Track Styles *****/
    input[type='range']::-webkit-slider-runnable-track,
    input[type='range']::-moz-range-track {
      background-color: $darkerGray;
    }

    /***** Thumb Styles *****/
    input[type='range']::-webkit-slider-thumb,
    input[type='range']::-moz-range-thumb {
      background-color: $primaryColor;
      border: 2px solid $questionBackground;
      border-radius: 50%;
    }
  }
  .q-quiz-input-range-container::after {
    content: '';
    display: table;
    clear: left;
  }

  .q-quiz-input-range-min,
  .q-quiz-input-range-max {
    color: $darkerGray;
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
    height: 1em;
    margin: 0 14px (9px + ($basis-margin * 3));
  }

  .q-quiz-input-range-position-label {
    position: absolute;
    max-width: 200px;
    width: max-content;
    text-align: center;
    transform: translateX(-50%);
    border-radius: 4px;
    text-align: center;
    background-color: $primaryColor;
  }

  .q-quiz-input-range-position-label__label {
    padding: 0 $basis-margin;
  }
</style>
