import MultiQuizPositionHandler from './MultiQuizPositionHandler.js';
import AnswerHandler from './AnswerHandler.js';

export function display(data, quizRootElement) {
  let quizHeaderElement = quizRootElement.querySelector('.q-quiz-multi-header');
  let quizContainerElement = quizRootElement.querySelector('.q-quiz-multi-container');
  let multiQuizPositionController = new MultiQuizPositionHandler(quizHeaderElement, quizContainerElement, data);
  let position = 0;
  
  let quizHeaderButton = quizHeaderElement.querySelector('.q-quiz-button');
  quizHeaderButton.addEventListener('click', () => {
    position++;
    multiQuizPositionController.setPosition(position);
  });

  let quizButtons = quizContainerElement.querySelectorAll('.q-quiz-button');
  quizButtons.forEach(quizButton => {
    quizButton.addEventListener('click', () => {
      position++;
      multiQuizPositionController.setPosition(position);
    })
  }); 

  let answerButtons = quizContainerElement.querySelectorAll('.q-quiz-answer-button');
  answerButtons.forEach(answerButton => {
    answerButton.addEventListener('click', event => {
      let questionPosition = multiQuizPositionController.getQuestionNumber() - 1;
      let answerHandler = new AnswerHandler(
        quizContainerElement, 
        data.quizElementData[questionPosition]
      );
      answerHandler.handleAnswer(event);
    })
  });

  let inputElements = quizContainerElement.querySelectorAll('.q-quiz-input input[type="range"]');
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

