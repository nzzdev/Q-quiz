import NumberGuess from './NumberGuessHandler.js';
import MultipleChoice from './MultipleChoiceHandler.js';
import MapPointGuess from './MapPointGuessHandler.js';
import * as answerHelpers from './answerHelpers.js';

const questionTypes = {
  'numberGuess': NumberGuess,
  'multipleChoice': MultipleChoice,
  'mapPointGuess': MapPointGuess
}

export default class QuestionHandler {
  constructor(multiQuizPositionHandler, data) {
    this.multiQuizPositionHandler = multiQuizPositionHandler;
    this.data = data;
  }

  renderInputElement() {
    this.questionPosition = this.multiQuizPositionHandler.getQuestionNumber() - 1;
    this.questionType = this.data.quizElementData[this.questionPosition].type;
    this.quizElement = this.multiQuizPositionHandler.getQuizElement();
    console.log(this.quizElement);
    this.questionRenderer = new questionTypes[this.questionType](this.quizElement, this.data.quizElementData[this.questionPosition]);
    this.questionRenderer.renderInput();
  }

  renderResult(event) {
    this.questionRenderer.renderResult(event);
    this.renderAdditionalInformation();
    this.displayResult();
  }

  renderAdditionalInformation() {
    answerHelpers.renderAdditionalInformation(this.quizElement, this.data.quizElementData[this.questionPosition]);
  }

  displayResult() {
    this.quizElement.querySelector('.q-quiz-input').classList.add('state-hidden');
    this.quizElement.querySelector('.q-quiz-result').classList.remove('state-hidden');
    this.quizElement.querySelector('.q-quiz-result').classList.add('state-visible');
  }
}
