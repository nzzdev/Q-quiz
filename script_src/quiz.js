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
}

