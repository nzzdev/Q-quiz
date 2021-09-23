import Scale from "./Scale.js";
import { alignInputRangeLabelPosition, formatNumber } from "./helpers.js";

function getUnit(value, data) {
  let unit = data.unit;
  if (
    parseFloat(value) === 1 &&
    data.unitSingular &&
    data.unitSingular !== ""
  ) {
    unit = data.unitSingular;
  }
  return unit;
}

export default class NumberPollHandler {
  constructor(questionElement, data, quizId, toolBaseUrl) {
    this.questionElement = questionElement;
    this.inputElement = this.questionElement.querySelector(
      '.q-quiz-input input[type="range"]'
    );
    this.min = parseFloat(this.inputElement.getAttribute("min"));
    this.max = parseFloat(this.inputElement.getAttribute("max"));
    this.step = parseFloat(this.inputElement.getAttribute("step"));
    this.defaultInputValue =
      (parseFloat(this.max) - parseFloat(this.min)) / 2 + parseFloat(this.min);
    this.data = data;
    this.quizId = quizId;
    this.toolBaseUrl = toolBaseUrl;
  }

  renderInput() {
    const labelContainer = this.inputElement.parentNode.firstElementChild;
    const positionInPercent =
      ((this.inputElement.value - this.min) / (this.max - this.min)) * 100;
    let label = labelContainer.querySelector(
      ".q-quiz-input-range-position-label"
    );
    this.inputElement.setAttribute("value", this.defaultInputValue);
    this.defaultInputValue = this.inputElement.value;

    this.inputElement.addEventListener("input", () => {
      const positionInPercent =
        ((this.inputElement.value - this.min) / (this.max - this.min)) * 100;
      label.textContent = formatNumber(this.inputElement.value);
      label.setAttribute("style", `left: calc(${positionInPercent}% - 1px);`);

      alignInputRangeLabelPosition(positionInPercent, label, labelContainer);
    });

    this.inputElement.addEventListener("change", () => {
      const positionInPercent =
        ((this.inputElement.value - this.min) / (this.max - this.min)) * 100;
      label.textContent = formatNumber(this.inputElement.value);
      label.setAttribute("style", `left: calc(${positionInPercent}% - 1px);`);

      alignInputRangeLabelPosition(positionInPercent, label, labelContainer);
    });

    label.innerHTML = formatNumber(this.defaultInputValue);
    label.setAttribute("style", `left: calc(${positionInPercent}% - 1px);`);
  }

  getValue(event) {
    return parseFloat(this.inputElement.value);
  }

  isAnswerValid() {
    let element = this.inputElement.parentNode.nextElementSibling;
    return (
      element.classList.contains("q-quiz-invalid-input-message") ||
      parseFloat(this.defaultInputValue) !== parseFloat(this.inputElement.value)
    );
  }

  handleInvalidAnswer() {
    let answerButton = this.inputElement.parentNode.nextSibling;
    let defaultInputValueMessageElement = document.createElement("div");
    defaultInputValueMessageElement.classList.add(
      "q-quiz-invalid-input-message"
    );
    defaultInputValueMessageElement.classList.add("s-font-note");
    defaultInputValueMessageElement.classList.add("s-font-note--strong");
    defaultInputValueMessageElement.innerHTML =
      "Sie haben den Schieberegeler nicht bewegt, trotzdem die Position speichern?";
    answerButton.parentNode.insertBefore(
      defaultInputValueMessageElement,
      answerButton
    );
  }

  renderResult(answer) {
    this.resultElement = this.questionElement.querySelector(
      ".q-quiz-result__number-guess-visual"
    );
    const unitData = {
      unit: this.resultElement.getAttribute("unit"),
      unitSingular: this.resultElement.getAttribute("unit-singular"),
    };

    let steppedValues = [];
    for (let i = this.min; i <= this.max; i = i + this.step) {
      steppedValues.push((100 / (this.max - this.min + 1)) * i);
    }
    let range = [];
    for (let i = 0; i < steppedValues.length; i++) {
      range.push(steppedValues[i] - 100 / steppedValues.length / 2);
    }
    let xScale = new Scale([this.min, this.max], range);

    let stepWidth =
      this.resultElement.getBoundingClientRect().width / steppedValues.length;

    let additionalMarkerClass = "";
    let additionalMarkerAttributes = "";
    if (steppedValues.length <= 100) {
      additionalMarkerClass =
        "q-quiz-result__number-guess-visual__text__marker--few-answers";
      additionalMarkerAttributes = `style="width: ${stepWidth}px;"`;
    }

    // show the users answer
    let answerHtml = `
      <div class="q-quiz-result__number-guess-visual__text__label s-font-note s-color-primary-7">
        Ihre Meinung
        <div class="s-font-note--strong s-font-note--tabularnums">${formatNumber(
          answer
        )} ${getUnit(answer, unitData)}</div>
      </div>
      <div class="q-quiz-result__number-guess-visual__text__marker ${additionalMarkerClass}" ${additionalMarkerAttributes}></div>
    `;

    let answerElement = document.createElement("div");
    answerElement.classList.add("q-quiz-result__number-guess-visual__text");
    answerElement.classList.add(
      "q-quiz-result__number-guess-visual__text--top"
    );
    answerElement.classList.add("s-color-primary-7");
    answerElement.innerHTML = answerHtml;

    answerElement.style.position = "absolute";

    if (answer - this.min > (this.max - this.min) / 2) {
      let rightPos = (
        (xScale.range.length - xScale.getIndexOnScale(answer) - 1) * stepWidth +
        stepWidth / 2 +
        1
      ).toFixed(1);
      answerElement.style.right = `${rightPos}px`;
      answerElement.classList.add(
        "q-quiz-result__number-guess-visual__text--right"
      );
    } else {
      let leftPos = (
        (xScale.getIndexOnScale(answer) + 1) * stepWidth -
        stepWidth / 2 +
        1
      ).toFixed(1);
      answerElement.style.left = `${leftPos}px`;
    }
    this.resultElement.appendChild(answerElement);
  }

  renderResultStats(answer, answersStats) {
    let resultVisualElement = this.questionElement.querySelector(
      ".q-quiz-result .q-quiz-result__number-guess-visual"
    );
    // Normally here comes an evaluation, how correct is the answer
    // In this case this is not needed, but
    // To maintain consistency we keep this
    this.renderStatsVisual(resultVisualElement);
  }

  getStatsPlot(width) {
    return fetch(
      `${this.toolBaseUrl}/number-poll/${this.quizId}/${this.data.id}/plot/${width}`
    ).then((response) => {
      if (response.ok) {
        return response.text();
      }
      return "";
    });
  }

  renderStatsVisual(element) {
    this.getStatsPlot(element.getBoundingClientRect().width).then(
      (svgString) => {
        let statsVisualContainerElement = document.createElement("div");
        statsVisualContainerElement.classList.add(
          "q-quiz-result__number-guess-visual__stats-graphic-container"
        );
        statsVisualContainerElement.innerHTML = svgString;
        element.appendChild(statsVisualContainerElement);
      }
    );
  }
}
