import MultipleChoiceHandler from './MultipleChoiceHandler.js';
import NumberGuessHandler from './NumberGuessHandler.js';
import MapPointGuessHandler from './MapPointGuessHandler.js';
import * as answerHelpers from './answerHelpers.js';

export default class AnswerHandler {
  constructor (quizContainerElement, quizElementData) {
    this.quizContainerElement = quizContainerElement;
    this.questionElement = quizContainerElement.querySelector('.q-quiz-element-container--is-active');
    this.quizElementData = quizElementData;
  }

  handleAnswer(event) {
    if (this.quizElementData.type === 'multipleChoice') {
      let multipleChoiceHandler = new MultipleChoiceHandler(this.questionElement, this.quizElementData);
      multipleChoiceHandler.handleUserInput(event.target.textContent);
      this.renderVisualResult();
    }
    if (this.quizElementData.type === 'numberGuess') {
      const inputElement = this.questionElement.querySelector('.q-quiz-input input');
      let numberGuessHandler = new NumberGuessHandler(inputElement, this.quizElementData);
      if (numberGuessHandler.isAnswerValid()) {
        let resultVisualElement = this.quizContainerElement.querySelector('.q-quiz-result__number-guess-visual');
        numberGuessHandler.renderResult(inputElement.value, resultVisualElement);
        this.renderVisualResult();
      } else {
        numberGuessHandler.handleInvalidAnswer();
      }
    }
    if (this.quizElementData.type === 'mapPointGuess') {
      let resultContainer = this.questionElement.querySelector('.q-quiz-result');
      let mapPointGuessHandler = new MapPointGuessHandler(resultContainer.querySelector('.q-quiz-map-container'), this.quizElementData);
      mapPointGuessHandler.renderResult(..., resultContainer);
      this.renderVisualResult();
    }
    
  }

  renderVisualResult() {
    answerHelpers.renderAdditionalInformation(this.questionElement, this.quizElementData);
    this.disableInput();
    this.enableResult();
  }

  disableInput() {
  }

  enableResult() {
    
  }
}
