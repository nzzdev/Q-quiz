import * as answerHelpers from './answerHelpers.js';

export default class MultipleChoiceHandler {
  
  constructor (questionElement, correctAnswer) {
    this.questionElement = questionElement;
    this.correctAnswer = correctAnswer;
  }

  handleUserInput() {
    const checkmark = '<svg class="q-quiz-result__answer__checkmark s-viz-color-three-5" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="none" d="M0 12V0h16v16H0z"/><path d="M0 9l5 5L16 3l-2-2-9 9-3-3-2 2z" fill="currentColor"/></g></svg>';
    const crossmark = '<svg class="q-quiz-result__answer__checkmark s-viz-color-six-5" width="16" height="16" viewBox="0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="none" d="M0 12V0h16v16H0z"/><path fill="currentColor" d="M8 10l-5 5-2-2 5-5-5-5 2-2 5 5 5-5 2 2-5 5 5 5-2 2-5-5z"/></g></svg>';
    
    let answerButtons = this.questionElement.querySelectorAll('.q-quiz-answer-button');
    answerButtons.forEach(answerButton => {
      let questionElement = this.questionElement;
      let correctAnswer = this.correctAnswer;
      answerButton.addEventListener('click', () => {
        questionElement.querySelector('.q-quiz-input').classList.add('state-hidden');
        questionElement.querySelector('.q-quiz-result').classList.remove('state-hidden');
        questionElement.querySelector('.q-quiz-result').classList.add('state-visible');
        questionElement.querySelectorAll('.q-quiz-result__answer > span').forEach(element => {
          if (element.textContent === correctAnswer.answer) {
            element.classList.add('s-font-note--strong', 's-viz-color-three-5');

            let correctAnswerElement = document.createElement('span');
            correctAnswerElement.classList.add('s-viz-color-three-5');
            correctAnswerElement.innerText = "korrekte Antwort";
            element.parentNode.insertBefore(correctAnswerElement, element.nextSibling);

            if (correctAnswer.answer === event.target.textContent) {
              let checkmarkElement = document.createElement('span');
              checkmarkElement.innerHTML = checkmark;
              element.parentNode.insertBefore(checkmarkElement, element);
            }
          } else {
            if (element.textContent === event.target.textContent) {
              let crossmarkElement = document.createElement('span');
              crossmarkElement.innerHTML = crossmark;
              element.parentNode.insertBefore(crossmarkElement, element);
              element.classList.add('s-font-note--strong', 's-viz-color-six-5');

              let wrongAnswerElement = document.createElement('span');
              wrongAnswerElement.classList.add('s-viz-color-six-5');
              wrongAnswerElement.innerText = "falsche Antwort";
              element.parentNode.insertBefore(wrongAnswerElement, element.nextSibling);
            } else {
              element.classList.add('s-font-note--light');
            }
          }
        }); 
      })
    })    
    this.renderAdditionalInformation();
    // this.saveInput();
    // this.loadStats();
  }

  renderAdditionalInformation() {
    let detailedAnswer = this.questionElement.querySelector('.q-quiz-result p');
    detailedAnswer.innerText = this.correctAnswer.answerText;

    let articleRecommendationsElement = answerHelpers.getRecommendationsElement(this.correctAnswer.articleRecommendations);
    detailedAnswer.parentNode.insertBefore(articleRecommendationsElement, detailedAnswer.nextSibling);

    let nextQuestionButton = this.questionElement.querySelector('button.q-quiz-button.q-quiz-button--horizontal.q-quiz-button--right');
    nextQuestionButton.classList.remove('state-hidden');
  }
}
