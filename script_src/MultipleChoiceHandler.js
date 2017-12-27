import * as answerHelpers from './answerHelpers.js';

export default class MultipleChoiceHandler {
  
  constructor (questionElement, data, quizId, toolBaseUrl) {
    this.questionElement = questionElement;
    this.data = data;
    this.quizId = quizId;
    this.toolBaseUrl = toolBaseUrl;
  }

  getValue(event) {
    return event.target.value;
  }

  renderResult(answer) {
    const checkmark = '<svg class="q-quiz-result__answer__checkmark s-color-positive" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="none" d="M0 12V0h16v16H0z"/><path d="M0 9l5 5L16 3l-2-2-9 9-3-3-2 2z" fill="currentColor"/></g></svg>';
    const crossmark = '<svg class="q-quiz-result__answer__checkmark s-color-negative" width="16" height="16" viewBox="0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="none" d="M0 12V0h16v16H0z"/><path fill="currentColor" d="M8 10l-5 5-2-2 5-5-5-5 2-2 5 5 5-5 2 2-5 5 5 5-2 2-5-5z"/></g></svg>';

    this.choices = [];
    this.questionElement.querySelectorAll('.q-quiz-result__answer > span').forEach(element => {
      this.choices.push(element.textContent);
      let parentNode = element.parentNode;
      let bar = parentNode.querySelector('.q-quiz-result__multiple-choice-bar');

      // is answer element the correct answer
      if (element.textContent === this.data.correctAnswer) {
        element.classList.add('s-font-note--strong');
        element.classList.add('s-color-positive');

        let correctAnswerElement = document.createElement('span');
        correctAnswerElement.classList.add('s-color-positive');
        correctAnswerElement.innerText = 'korrekte Antwort';
        parentNode.insertBefore(correctAnswerElement, element.nextSibling);

        bar.classList.add('s-font-note-s--strong');
        bar.classList.add('s-color-positive');

        // is user input correct
        if (this.data.correctAnswer === answer) {
          let checkmarkElement = document.createElement('span');
          checkmarkElement.innerHTML = checkmark;
          parentNode.insertBefore(checkmarkElement, element);
        }
      } else {
        // is user input not correct
        if (element.textContent === answer) {
          let crossmarkElement = document.createElement('span');
          crossmarkElement.innerHTML = crossmark;
          parentNode.insertBefore(crossmarkElement, element);
          element.classList.add('s-font-note--strong');
          element.classList.add('s-color-negative');

          let wrongAnswerElement = document.createElement('span');
          wrongAnswerElement.classList.add('s-color-negative');
          wrongAnswerElement.innerText = 'falsche Antwort';
          parentNode.insertBefore(wrongAnswerElement, element.nextSibling);

          bar.classList.add('s-font-note-s--strong');
          bar.classList.add('s-color-negative');
        } else {
          // all other answer elements
          element.classList.add('s-font-note--light');
          bar.classList.add('s-color-gray-4');
        }
      }
    }) 
  }  

  getMaxAnswersCount(answersStats) {
    let maxAnswersCount = this.choices
      .map(choice => {
        if (answersStats.hasOwnProperty('numberOfAnswersPerChoice') && answersStats.numberOfAnswersPerChoice.hasOwnProperty(choice)) {
          return parseInt(answersStats.numberOfAnswersPerChoice[choice])
        }
        return 0
      })
      .reduce((prev, current) => {
        if (current > prev) {
          return current
        }
        return prev
      },0)
    return maxAnswersCount
  }

  renderResultStats(answer, answersStats) {
    let resultVisualElement = this.questionElement.querySelector('.q-quiz-result-visual');
    let maxAnswersCount = this.getMaxAnswersCount(answersStats)

    this.choices.forEach((choice, index) => {
      let bar = resultVisualElement.querySelectorAll('.q-quiz-result__multiple-choice-bar').item(index);
      let percentageWithThisAnswer = 0;
      let barWidthPercentage = 0;
      if (answersStats.numberOfAnswersPerChoice.hasOwnProperty(choice)) {
        percentageWithThisAnswer = (answersStats.numberOfAnswersPerChoice[choice] / answersStats.totalAnswers * 100).toFixed(0);
        barWidthPercentage = (answersStats.numberOfAnswersPerChoice[choice] / maxAnswersCount * 100).toFixed(0);
      }
      bar.style.width = `${barWidthPercentage}%`
      if (percentageWithThisAnswer === 0) {
        bar.innerHTML = `<span class="q-quiz-result-mc-answer-is-zero">${percentageWithThisAnswer} %</span>`;
      } else {
        bar.innerHTML = `<span>${percentageWithThisAnswer} %</span>`;
      }
    })
    this.questionElement.querySelectorAll('.q-quiz-result__answer > span').forEach((element, index) => {
      
    })
  }
}
