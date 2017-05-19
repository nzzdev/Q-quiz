import MapPointGuessHandler from './MapPointGuessHandler.js';

export default class MultiQuizPositionHandler {

  constructor(quizHeaderElement, quizContainerElement, data) {
    this.quizContainerElement = quizContainerElement;
    this.quizElements = this.quizContainerElement.querySelectorAll('.q-quiz-element-container');
    this.headerElement = quizHeaderElement;

    this.quizElementData = data.quizElementData;
    this.numberElements = data.numberElements;
    this.numberQuestions = data.quizElementData.length;
    this.hasCover = data.hasCover;
  }

  getQuizElement() {
    return this.quizElements.item(this.position);
  }

  getPosition() {
    return this.position;
  }

  setPosition(position) {
    this.position = position;
    this.setHeader();
    this.setQuizElement();
  }

  setQuizElement() {
    this.quizContainerElement.style.transform = `translateX(${this.position * -100 / this.numberElements}%)`;
    this.quizContainerElement.style.webkitTransform = `translateX(${this.position * -100 / this.numberElements}%)`;

    for (let i = 0; i < this.quizElements.length; i++) {
      if (i === this.position) {
        this.quizElements.item(i).classList.remove('q-quiz-element-container--is-inactive');
        this.quizElements.item(i).classList.add('q-quiz-element-container--is-active');
      } else {
        this.quizElements.item(i).classList.remove('q-quiz-element-container--is-active');
        this.quizElements.item(i).classList.add('q-quiz-element-container--is-inactive');
      }
    }
  }

  setHeader() {
    const questionNumber = this.getQuestionNumber();
    this.setTitle(questionNumber);
    this.changeButtonText(questionNumber);
    this.setButtonVisibility();

    if (this.headerElement.querySelector('.q-quiz-header__title').textContent === '' && isHeaderButtonHidden()) {
      this.headerElement.classList.add('q-quiz-header--is-empty');
    } else {
      this.headerElement.classList.remove('q-quiz-header--is-empty');
    }

  }

  getQuestionNumber() {
    let questionPosition = this.position;
    if (!this.hasCover) {
      questionPosition++;
    }
    return questionPosition;
  }

  setTitle(questionNumber) {
    let title = '';
    if (!this.quizElements.item(this.position).classList.contains('q-quiz__cover') && !this.quizElements.item(this.position).classList.contains('q-quiz__last-card')) {
      if (questionNumber === this.numberQuestions) {
        title = 'letzte Frage';
      } else {
        title = `Frage ${questionNumber}/${this.numberQuestions}`;
      }
    } else if (this.position === this.numberElements - 1) {
      title = 'Fertig!';
    }
    this.headerElement.querySelector('.q-quiz-header__title').textContent = title;

  }

  changeButtonText(questionNumber) {
    if (questionNumber === this.numberQuestions) {
      this.headerElement.querySelector('.q-quiz-button__content span').textContent = 'Thema vertiefen';
    } 
  }

  isHeaderButtonHidden() {
    return this.headerElement.querySelector('.q-quiz-button').classList.contains('q-quiz-button--hidden');
  }

  setButtonVisibility() {
    const isButtonHidden = this.isHeaderButtonHidden();
    if (this.position < this.numberElements - 1 && isButtonHidden) {
      this.headerElement.querySelector('.q-quiz-button').classList.remove('q-quiz-button--hidden');
    } else if (this.position === this.numberElements - 1) {
      this.headerElement.querySelector('.q-quiz-button').classList.add('q-quiz-button--hidden');
    }
  }

}
