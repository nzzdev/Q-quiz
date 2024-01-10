<script lang="ts">
  import type { NumberPoll, SliderQuestion } from '@src/interfaces';

  export let question: SliderQuestion;

  let initialValue = (question.max - question.min) / 2 + question.min;
  $: labelPosition = !initialValue
    ? 50
    : ((initialValue - question.min) / (question.max - question.min)) * 100;
</script>

<div class="q-quiz-input">
  <div class="q-quiz-input-range-container">
    <div class="q-quiz-input-range-position-label-container">
      <div
        class="q-quiz-input-range-position-label s-color-primary-5"
        style="left: {labelPosition}%"
      >
        <span class="s-font-note s-font-note--tabularnums s-font-note--strong">
          <span class="q-quiz-input-range-position-label__label s-color-gray-1">
            {initialValue}
          </span>
        </span>
      </div>
    </div>
    <input
      type="range"
      class="s-input-range s-input-range--large"
      min={question.min}
      max={question.max}
      step={question.step}
      bind:value={initialValue}
    />
    <div
      class="
        q-quiz-input-range-min
        s-font-note-s s-font-note-s--light
        s-font-note--tabularnums
      "
    >
      {question.min}
      {#if question.unit}
        {question.min === 1 && question.unit_sinpular
          ? question.unit_sinpular
          : question.unit}
      {/if}
    </div>
    <div
      class="
        q-quiz-input-range-max
        s-font-note-s s-font-note-s--light
        s-font-note--tabularnums
      "
    >
      {question.max}
      {#if question.unit}
        {question.max === 1 && question.unit_sinpular
          ? question.unit_sinpular
          : question.unit}
      {/if}
    </div>
  </div>
  <button class="s-button s-button--small q-quiz-answer-button">
    <span>Antworten</span>
  </button>
</div>

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
