import * as answerHelpers from './answerHelpers.js';

export default class MultipleChoiceHandler {
  
  constructor (questionElement, data) {
    this.questionElement = questionElement;
    this.data = data;
  }

  renderInput() {}

  renderResult(event) {
    const value = event.target.textContent;
    const checkmark = '<svg class="q-quiz-result__answer__checkmark s-viz-color-three-5" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="none" d="M0 12V0h16v16H0z"/><path d="M0 9l5 5L16 3l-2-2-9 9-3-3-2 2z" fill="currentColor"/></g></svg>';
    const crossmark = '<svg class="q-quiz-result__answer__checkmark s-viz-color-six-5" width="16" height="16" viewBox="0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="none" d="M0 12V0h16v16H0z"/><path fill="currentColor" d="M8 10l-5 5-2-2 5-5-5-5 2-2 5 5 5-5 2 2-5 5 5 5-2 2-5-5z"/></g></svg>';

    this.questionElement.querySelectorAll('.q-quiz-result__answer > span').forEach(element => {
      if (element.textContent === this.data.correctAnswer) {
        element.classList.add('s-font-note--strong', 's-viz-color-three-5');

        let correctAnswerElement = document.createElement('span');
        correctAnswerElement.classList.add('s-viz-color-three-5');
        correctAnswerElement.innerText = 'korrekte Antwort';
        element.parentNode.insertBefore(correctAnswerElement, element.nextSibling);

        if (this.data.correctAnswer === value) {
          let checkmarkElement = document.createElement('span');
          checkmarkElement.innerHTML = checkmark;
          element.parentNode.insertBefore(checkmarkElement, element);
        }
      } else {
        if (element.textContent === value) {
          let crossmarkElement = document.createElement('span');
          crossmarkElement.innerHTML = crossmark;
          element.parentNode.insertBefore(crossmarkElement, element);
          element.classList.add('s-font-note--strong', 's-viz-color-six-5');

          let wrongAnswerElement = document.createElement('span');
          wrongAnswerElement.classList.add('s-viz-color-six-5');
          wrongAnswerElement.innerText = 'falsche Antwort';
          element.parentNode.insertBefore(wrongAnswerElement, element.nextSibling);
        } else {
          element.classList.add('s-font-note--light');
        }
      }
    })    
    // this.saveInput();
    // this.loadStats();
  }  
}
