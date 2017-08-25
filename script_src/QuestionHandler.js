import NumberGuess from './NumberGuessHandler.js';
import MultipleChoice from './MultipleChoiceHandler.js';
import MapPointGuess from './MapPointGuessHandler.js';
import * as answerHelpers from './answerHelpers.js';
import MultiQuizPositionHandler from './MultiQuizPositionHandler.js';
import AnswerStore from './AnswerStore.js';

const questionTypes = {
  'numberGuess': NumberGuess,
  'multipleChoice': MultipleChoice,
  'mapPointGuess': MapPointGuess
}

export default class QuestionHandler {
  constructor(quizRootElement, data) {
    this.quizRootElement = quizRootElement;
    this.data = data;
    this.isSingleQuestionQuiz = data.numberElements === 1;
    if (!this.isSingleQuestionQuiz) {
      this.multiQuizPositionHandler = new MultiQuizPositionHandler(quizRootElement, data);
    }
    this.answerStore = new AnswerStore(this.data.toolBaseUrl);

    this.finalScore = {
      multipleChoice: {
        numberQuestions: 0,
        sumCorrect: 0
      },
      numberGuess: {
        numberQuestions: 0,
        numberAnswers: 0, 
        sumDiffPercentage: 0
      },
      mapPointGuess: {
        numberQuestions: 0,
        numberAnswers: 0,
        sumDistance: 0
      }
    }
  }

  renderInputElement(position) {
    if (this.isSingleQuestionQuiz) {
      this.questionPosition = 0;
      this.quizElement = this.quizRootElement.querySelector('.q-quiz-element-container--is-active');
    } else {
      this.multiQuizPositionHandler.setPosition(position);
      this.questionPosition = this.multiQuizPositionHandler.getQuestionNumber() - 1;
      this.quizElement = this.multiQuizPositionHandler.getQuizElement();
    }

    if (this.questionPosition < this.data.questionElementData.length) {
      this.questionType = this.data.questionElementData[this.questionPosition].type;
      this.finalScore[this.questionType].numberQuestions++;
      this.questionRenderer = new questionTypes[this.questionType](this.quizElement, this.data.questionElementData[this.questionPosition], this.data.itemId, this.data.toolBaseUrl);
      if (typeof this.questionRenderer.renderInput === 'function') {
        this.questionRenderer.renderInput();
      }
    } else if (this.data.hasLastCard && this.data.lastCardData && (this.data.lastCardData.articleRecommendations || this.data.isFinalScoreShown)) {
      this.finalScore.isFinalScoreShown = this.data.isFinalScoreShown;
      answerHelpers.renderAdditionalInformationForLastCard(this.quizElement, this.finalScore, this.data.lastCardData.articleRecommendations);
    } 
  }

  async handleAnswer(event) {
    const answerValue = this.questionRenderer.getValue(event); 
    const correctAnswer = this.data.questionElementData[this.questionPosition].correctAnswer;

    if (typeof this.questionRenderer.isAnswerValid === 'function') {
      if (!this.questionRenderer.isAnswerValid()) {
        this.questionRenderer.handleInvalidAnswer();
        return;
      }
    }

    this.questionRenderer.renderResult(answerValue);
    const responseStoreAnswer = await this.storeAnswer(answerValue);
    let answerId;
    if (responseStoreAnswer && responseStoreAnswer.id) {
      answerId = responseStoreAnswer.id;
    }
    let stats = await this.answerStore.getStats(this.data.itemId, this.data.questionElementData[this.questionPosition], answerId);  
    if (typeof this.questionRenderer.renderResultStats === 'function') {
      if (this.questionType === 'multipleChoice' && answerValue === correctAnswer) {
        this.finalScore.multipleChoice.sumCorrect++;
      } else if (this.questionType === 'numberGuess') {
        this.finalScore.numberGuess.numberAnswers++;
        if (stats.diffPercentage) {
          this.finalScore.numberGuess.sumDiffPercentage += stats.diffPercentage;
        } else {
          const diffPercentage = Math.abs(Math.round(Math.abs(correctAnswer - answerValue) / correctAnswer * 100));
          this.finalScore.numberGuess.sumDiffPercentage += diffPercentage;
        }
      } else if (this.questionType === 'mapPointGuess') {
        this.finalScore.mapPointGuess.numberAnswers++;
        this.finalScore.mapPointGuess.sumDistance += answerValue.distance;
      }
      this.questionRenderer.renderResultStats(answerValue, stats);
    }
  
      
    // dispatch a custom event for tracking system to track the answer
    // and others if they are interested
    let answerEvent = new CustomEvent('q-quiz-answer', {
      bubbles: true,
      detail: {
        id: this.data.questionElementData[this.questionPosition].id
      }
    });
    this.quizRootElement.dispatchEvent(answerEvent);

    this.renderAdditionalInformation();
    this.displayResult();
    
  }

  storeAnswer(answerValue) {
    let answerData = {
      itemId: this.data.itemId,
      questionId: this.data.questionElementData[this.questionPosition].id,
      type: this.questionType,
      value: answerValue
    }
    
    if (!this.data.isPure) {
      return this.answerStore.saveAnswer(answerData);
    } else {
      return Promise.resolve();
    }
  }

  renderAdditionalInformation() {
    answerHelpers.renderAdditionalInformationForQuestion(this.quizElement, this.data.questionElementData[this.questionPosition]);
  }

  displayResult() {
    this.quizElement.querySelector('.q-quiz-input').classList.add('state-hidden');
    this.quizElement.querySelector('.q-quiz-result').classList.remove('state-hidden');
    this.quizElement.querySelector('.q-quiz-result').classList.add('state-visible');
    if (this.hasNoFurtherQuizElements()) {
      this.quizElement.querySelector('.q-quiz-button').classList.add('state-hidden');
    } else if (this.isNextQuizElementLastCard()) {
      if (this.data.isFinalScoreShown) {
        this.quizElement.querySelector('.q-quiz-button__content span').textContent = 'zur Auswertung'; 
      } else {
        this.quizElement.querySelector('.q-quiz-button__content span').textContent = 'Thema vertiefen'; 
      }
    }
  }

  hasNoFurtherQuizElements() {
    return this.isSingleQuestionQuiz || this.multiQuizPositionHandler.getPosition() === this.data.numberElements - 1;
  }

  isNextQuizElementLastCard() {
    return this.multiQuizPositionHandler.getQuestionNumber() === this.data.questionElementData.length && this.data.hasLastCard
  }
}
