<script lang="ts">
  import { getContext } from 'svelte';
  import { formatNumber } from '@nzz/et-utils-number';

  import { EventTrackingService } from '@src/services/event-tracking';
  import key from '@src/services/key-service';
  import type {
    SliderQuestion,
    QuizStoreContext,
    ButtonColorStyle,
  } from '@src/interfaces';

  // import Button from '../atomic/Button.svelte';
  import BaseElement from '../quiz-base-elelement/BaseElement.svelte';
  import Statistic from './Statistic.svelte';
  import { ColorDefaults } from '@src/constants';

  export let element: SliderQuestion;
  export let toolBaseUrl: string;
  export let colorStyle: ButtonColorStyle = ColorDefaults.Button.Color;

  const { quizStore } = getContext(key) as QuizStoreContext;

  let userAnswer = getDefaultAnswer();
  let isAnswered = false;
  $: isArticle = document.querySelector('.ld-1741686');
  $: labelPosition = !userAnswer
    ? 50
    : ((userAnswer - element.min) / (element.max - element.min)) * 100;

  function getDefaultAnswer() {
    const middleValue = (element.max - element.min) / 2;
    const exponent = Math.round(middleValue / element.step);
    return round(
      element.step * exponent + element.min,
      countDecimalPlaces(element.step)
    );
  }

  function getResult(event: any) {
    console.log(event);
    quizStore
      .answerdQuestion($quizStore.qItemId, element, userAnswer)
      .then(() => {
        isAnswered = quizStore.isAnswered();
        const step = $quizStore.step;
        const countStep = $quizStore.numberQuestions;
        const detail = EventTrackingService.getDetails(
          $quizStore.items,
          $quizStore.qItemId,
          event
        );
        EventTrackingService.trackAnswer(
          detail.title,
          step,
          countStep,
          detail.element
        );
      });
  }

  function round(value: number, exponent: number) {
    let roundCount = 1;
    if (exponent > 0) {
      roundCount = Math.pow(10, exponent);
    }
    return Math.floor(value * roundCount) / roundCount;
  }

  function countDecimalPlaces(num: number): number {
    const str = num.toString();
    const index = str.indexOf('.');
    return index !== -1 ? str.length - index - 1 : 0;
  }
</script>

{#if !isArticle}
  <div class="s-font-note-s">Bewegen Sie den Slider</div>
{/if}
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
                {formatNumber(userAnswer)}
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
        s-font-note-s--tabularnums
      "
        >
          {formatNumber(element.min)}
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
        s-font-note-s--tabularnums
      "
        >
          {formatNumber(element.max)}
          {#if element.unit}
            {element.max === 1 && element.unit_sinpular
              ? element.unit_sinpular
              : element.unit}
          {/if}
        </div>
      </div>
      <div class="button-container">
        <button
          class="button s-button"
          style="--q-quiz-button-bg-color: {colorStyle.Background}; --q-quiz-button-hover-color: {colorStyle.Hover}; --q-quiz-button-disabled-color: {colorStyle.Disabled};"
          on:click={getResult}
        >
          <div class="s-font-note-s button-text" style:color={colorStyle.Text}>
            Antworten
          </div>
        </button>
      </div>
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
    input[type='range']::-webkit-slider-thumb {
      background-color: $primaryColor;
      border: 2px solid $questionBackground;
      border-radius: 50%;
    }

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

  .button-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .button {
    display: flex;
    align-items: safe;
    width: 100%;
    padding: 12px;
    cursor: pointer;
    background-color: var(--q-quiz-button-bg-color);

    &:hover {
      opacity: 1;
      background-color: var(--q-quiz-button-hover-color);
    }

    &:disabled,
    &:disabled:hover {
      background-color: var(--q-quiz-button-disabled-color);
      border-color: #848484;
      cursor: not-allowed;
    }

    &-icon {
      margin-top: 7px;
    }

    &-text {
      font-weight: 400;
    }
  }
</style>
