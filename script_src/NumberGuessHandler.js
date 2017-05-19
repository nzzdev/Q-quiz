import Scale from './Scale.js';

function getUnit(value, data) {
  let unit = data.unit;
  if (parseFloat(value) === 1 && data.unitSingular && data.unitSingular !== '') {
    unit = data.unit_singular;
  }
  return unit;
}

export default class NumberGuessHandler {

  constructor(questionElement, data) {
    this.questionElement = questionElement;
    this.inputElement = this.questionElement.querySelector('.q-quiz-input input');
    this.min = parseFloat(this.inputElement.getAttribute('min'));
    this.max = parseFloat(this.inputElement.getAttribute('max'));
    this.step = parseFloat(this.inputElement.getAttribute('step'));
    this.defaultInputValue = ((parseFloat(this.max) - parseFloat(this.min)) / 2) + parseFloat(this.min);
    this.correctAnswer = data.correctAnswer;
  }

  renderInput() {}

  renderResult(event) {
    if (this.isAnswerValid()) {
      this.resultElement = this.questionElement.querySelector('.q-quiz-result__number-guess-visual');
      this.renderValidResult();
    } else {
      this.handleInvalidAnswer();
    }
  }

  renderValidResult() {
    const answer = this.inputElement.value;
    const unitData = {
      unit: this.resultElement.getAttribute('unit'),
      unitSingular: this.resultElement.getAttribute('unit-singular')
    };

    let steppedValues = [];
    for (let i = this.min; i <= this.max; i = i + this.step) {
      steppedValues.push((100/(this.max - this.min + 1)) * i);
    }
    let range = []
    for (let i = 0; i < steppedValues.length; i++) {
      range.push(steppedValues[i] - ((100/steppedValues.length)/2));
    }
    let xScale = new Scale([this.min, this.max], range);

    let stepWidth = this.resultElement.getBoundingClientRect().width/steppedValues.length;

    let additionalMarkerClass = '';
    let additionalMarkerAttributes = '';
    if (steppedValues.length <= 100) {
      additionalMarkerClass = 'q-quiz-result__number-guess-visual__text__marker--few-answers';
      additionalMarkerAttributes = `style="width: ${stepWidth}px;"`;
    }

    // show the correct answer
    let correctAnswerHtml = `
      <div class="q-quiz-result__number-guess-visual__text__label s-font-note s-color-gray-8">
        Korrekte Antwort
        <div class="s-font-note--strong">${this.correctAnswer} ${getUnit(this.correctAnswer, unitData)}</div>
      </div>
      <div class="q-quiz-result__number-guess-visual__text__marker ${additionalMarkerClass}" ${additionalMarkerAttributes}></div>
    `;

    let correctAnswerElement = document.createElement('div');
    correctAnswerElement.classList.add('q-quiz-result__number-guess-visual__text');
    correctAnswerElement.classList.add('q-quiz-result__number-guess-visual__text--bottom');
    correctAnswerElement.classList.add('s-color-gray-8');
    correctAnswerElement.innerHTML = correctAnswerHtml;

    if ((this.correctAnswer - this.min) > (this.max - this.min)/2) {
      let rightPos = (((xScale.range.length - xScale.getIndexOnScale(this.correctAnswer) - 1) * stepWidth) + stepWidth / 2 + 1).toFixed(1);
      correctAnswerElement.style.right = `${rightPos}px`;
      correctAnswerElement.classList.add('q-quiz-result__number-guess-visual__text--right');
    } else {
      let leftPos = (((xScale.getIndexOnScale(this.correctAnswer) + 1) * stepWidth) - stepWidth / 2 + 1).toFixed(1);
      correctAnswerElement.style.left = `${leftPos}px`;
    }
    this.resultElement.appendChild(correctAnswerElement);


    // show the users answer
    let answerHtml = `
      <div class="q-quiz-result__number-guess-visual__text__label s-font-note s-color-primary-5">
        Ihre Schätzung
        <div class="s-font-note--strong">${answer} ${getUnit(answer, unitData)}</div>
      </div>
      <div class="q-quiz-result__number-guess-visual__text__marker ${additionalMarkerClass}" ${additionalMarkerAttributes}></div>
    `;

    let answerElement = document.createElement('div');
    answerElement.classList.add('q-quiz-result__number-guess-visual__text');
    answerElement.classList.add('q-quiz-result__number-guess-visual__text--top');
    answerElement.classList.add('s-color-primary-5');
    answerElement.innerHTML = answerHtml;

    answerElement.style.position = 'absolute';

    if ((answer - this.min) > (this.max - this.min)/2) {
      let rightPos = (((xScale.range.length - xScale.getIndexOnScale(answer) - 1) * stepWidth) + stepWidth / 2 + 1).toFixed(1);
      answerElement.style.right = `${rightPos}px`;
      answerElement.classList.add('q-quiz-result__number-guess-visual__text--right');
    } else {
      let leftPos = (((xScale.getIndexOnScale(answer) + 1) * stepWidth) - stepWidth / 2 + 1).toFixed(1);
      answerElement.style.left = `${leftPos}px`;
    }
    this.resultElement.appendChild(answerElement);
  }

  isAnswerValid() {
    let element = this.inputElement.parentNode.nextElementSibling;
    return element.classList.contains('q-quiz-invalid-input-message') 
      || (parseFloat(this.defaultInputValue) !== parseFloat(this.inputElement.value));
  }

  handleInvalidAnswer() {
    let answerButton = this.inputElement.parentNode.nextSibling;
    let defaultInputValueMessageElement = document.createElement('div')
    defaultInputValueMessageElement.classList.add('q-quiz-invalid-input-message')
    defaultInputValueMessageElement.classList.add('s-font-text-s')
    defaultInputValueMessageElement.classList.add('s-font-text-s--strong')
    defaultInputValueMessageElement.innerHTML = 'Sie haben den Schieberegeler nicht bewegt, trotzdem die Position speichern?'
    answerButton.parentNode.insertBefore(defaultInputValueMessageElement, answerButton)
  }

}
