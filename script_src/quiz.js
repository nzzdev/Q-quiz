import MultiQuizPositionHandler from './MultiQuizPositionHandler.js';
import AnswerHandler from './AnswerHandler.js';

export function display(data, quizRootElement) {
  let quizHeaderElement = quizRootElement.querySelector('.q-quiz-multi-header');
  let quizContainerElement = quizRootElement.querySelector('.q-quiz-multi-container');
  let multiQuizPositionController = new MultiQuizPositionHandler(quizHeaderElement, quizContainerElement, data);
  let position = 0;
  
  let quizHeaderButton = quizHeaderElement.querySelector('.q-quiz-button');
  quizHeaderButton.addEventListener('click', event => {
    position++;
    multiQuizPositionController.setPosition(position);
    const questionPosition = multiQuizPositionController.getQuestionNumber() - 1;
    let answerHandler = new AnswerHandler(quizContainerElement, data.correctAnswers);
    answerHandler.handleAnswer(questionPosition);
  });

  let quizButtons = quizContainerElement.querySelectorAll('.q-quiz-button');
  quizButtons.forEach(quizButton => {
    quizButton.addEventListener('click', event => {
      position++;
      multiQuizPositionController.setPosition(position);
      const questionPosition = multiQuizPositionController.getQuestionNumber() - 1;
      let answerHandler = new AnswerHandler(quizContainerElement, data.correctAnswers);
      answerHandler.handleAnswer(questionPosition);
    })
  });  
}

