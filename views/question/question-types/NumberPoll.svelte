<script>
  import * as helpers from "./../../../script_src/helpers.js";

  export let question;

  $: initialValue = getInitialValue(question);
  $: labelPosition = getLabelPosition(initialValue, question);
  $: labelMin = getLabelMin(question);
  $: labelMax = getLabelMax(question);

  function getInitialValue(question) {
    if (!question.max || !question.min) {
      return "";
    }
    return (
      (parseFloat(question.max) - parseFloat(question.min)) / 2 +
      parseFloat(question.min)
    );
  }

  function getLabelPosition(initialValue, question) {
    if (!initialValue) {
      return 50;
    }
    return (
      ((initialValue - question.min) / (question.max - question.min)) * 100
    );
  }

  function getLabelMin(question) {
    let min = question.min !== undefined ? question.min : "";
    let unit = question.unit || "";
    if (parseFloat(min) === 1 && question.unit_singular) {
      unit = question.unit_singular;
    }
    return helpers.formatNumber(min) + " " + unit;
  }

  function getLabelMax(question) {
    let max = question.max !== undefined ? question.max : "";
    let unit = question.unit || "";
    if (parseFloat(max) === 1 && question.unit_singular) {
      unit = question.unit_singular;
    }
    return helpers.formatNumber(max) + " " + unit;
  }
</script>

<div class="q-quiz-input">
  <div class="q-quiz-input-range-container">
    <div class="q-quiz-input-range-position-label-container">
      <div
        class="q-quiz-input-range-position-label s-color-primary-5"
        style="left: {labelPosition}%; transform: translateX({transformValue}%);"
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
      value={initialValue}
    />
    <div
      class="
        q-quiz-input-range-min
        s-font-note-s s-font-note-s--light
        s-font-note--tabularnums
      "
    >
      {labelMin}
    </div>
    <div
      class="
        q-quiz-input-range-max
        s-font-note-s s-font-note-s--light
        s-font-note--tabularnums
      "
    >
      {labelMax}
    </div>
  </div>
  <button class="s-button s-button--small q-quiz-answer-button">
    <span>Antworten</span>
  </button>
</div>
<div class="q-quiz-result state-hidden">
  <div
    class="q-quiz-result__number-guess-visual"
    unit={question.unit || ""}
    unit-singular={question.unit_singular || ""}
  />
  <p class="q-quiz-result-answer-text s-font-text-s" />
</div>
