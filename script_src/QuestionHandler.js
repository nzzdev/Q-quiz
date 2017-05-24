import NumberGuess from './NumberGuessHandler.js';
import MultipleChoice from './MultipleChoiceHandler.js';
import MapPointGuess from './MapPointGuessHandler.js';
import * as answerHelpers from './answerHelpers.js';
import AnswerStore from './AnswerStore.js';

const questionTypes = {
  'numberGuess': NumberGuess,
  'multipleChoice': MultipleChoice,
  'mapPointGuess': MapPointGuess
}

export default class QuestionHandler {
  constructor(multiQuizPositionHandler, data) {
    this.multiQuizPositionHandler = multiQuizPositionHandler;
    this.data = data;
    this.answerStore = new AnswerStore(this.data.origin);
  }

  renderInputElement() {
    this.questionPosition = this.multiQuizPositionHandler.getQuestionNumber() - 1;
    this.questionType = this.data.quizElementData[this.questionPosition].type;
    this.quizElement = this.multiQuizPositionHandler.getQuizElement();
    this.questionRenderer = new questionTypes[this.questionType](this.quizElement, this.data.quizElementData[this.questionPosition], this.data.itemId, this.data.origin);
    if (typeof this.questionRenderer.renderInput === 'function') {
      this.questionRenderer.renderInput();
    }
  }

  handleAnswer(event) {
    const answerValue = this.questionRenderer.getValue(event); // async??

    this.questionRenderer.renderResult(answerValue);
    this.storeAnswer(answerValue)
      .then(response => {
        let answerId;
        if (response && response.id) {
          answerId = response.id;
        }
        this.answerStore.getStats(this.data.itemId, this.data.quizElementData[this.questionPosition], answerId)
          .then(stats => {
            if (typeof this.questionRenderer.renderResultStats === 'function') {
              this.questionRenderer.renderResultStats(answerValue, stats);
            }
          })
      });

    this.renderAdditionalInformation();
    this.displayResult();
  }

  storeAnswer(answerValue) {
    let answerData = {
      itemId: this.data.itemId,
      questionId: this.data.quizElementData[this.questionPosition].id,
      type: this.questionType,
      value: answerValue
    }
    
    if (this.data.saveAnswer) {
      return this.answerStore.saveAnswer(answerData);
    } else {
      return Promise.resolve();
    }
  }

  renderAdditionalInformation() {
    answerHelpers.renderAdditionalInformation(this.quizElement, this.data.quizElementData[this.questionPosition]);
  }

  displayResult() {
    this.quizElement.querySelector('.q-quiz-input').classList.add('state-hidden');
    this.quizElement.querySelector('.q-quiz-result').classList.remove('state-hidden');
    this.quizElement.querySelector('.q-quiz-result').classList.add('state-visible');
    if (this.multiQuizPositionHandler.getQuestionNumber() === this.data.quizElementData.length) {
      this.quizElement.querySelector('.q-quiz-button__content span').textContent = 'Thema vertiefen'; 
    }
  }
}
