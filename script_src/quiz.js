import MultiQuizPositionHandler from './MultiQuizPositionHandler.js';
import QuestionHandler from './QuestionHandler.js';

export function display(data, quizRootElement) {
  let questionHandler = new QuestionHandler(quizRootElement, data);
  let position = 0;

  // if we start the quiz without a cover we render everything what's needed on client side
  if (data.numberElements === 1 || !data.hasCover) {
    questionHandler.renderInputElement(position);
  }

  // add event listeners for switching to next question, answer buttons and input elements (number guess)
  let quizButtons = quizRootElement.querySelectorAll('.q-quiz-button');
  quizButtons.forEach(quizButton => {
    quizButton.addEventListener('click', () => {
      position++;
      questionHandler.renderInputElement(position);
    })
  }); 
  
  let answerButtons = quizRootElement.querySelectorAll('.q-quiz-answer-button');
  answerButtons.forEach(answerButton => {
    answerButton.addEventListener('click', event => {
      questionHandler.handleAnswer(event);
    })
  });

  let inputElements = quizRootElement.querySelectorAll('.q-quiz-input input[type="range"]');
  inputElements.forEach(inputElement => {
    const labelContainer = inputElement.parentNode.firstChild;
    let label = labelContainer.querySelector('.s-input-range-position-label');
    const min = inputElement.getAttribute('min');
    const max = inputElement.getAttribute('max');
    inputElement.addEventListener('input', () => {
      label.textContent = inputElement.value;
      label.setAttribute('style', `left: ${(inputElement.value - min) / (max - min) * 100}%;`);
    });
    inputElement.addEventListener('change', () => {
      label.textContent = inputElement.value;
      label.setAttribute('style', `left: ${(inputElement.value - min) / (max - min) * 100}%;`);
    })
  });
}

