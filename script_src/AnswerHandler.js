import MultipleChoiceHandler from './MultipleChoiceHandler.js'

export default class AnswerController {
  constructor (quizContainerElement, correctAnswers) {
    this.quizContainerElement = quizContainerElement;
    this.correctAnswers = correctAnswers;
  }

  handleAnswer(questionPosition) {
    let activeQuestion = this.quizContainerElement.querySelector('.q-quiz-element-container--is-active');
    const correctAnswer = this.correctAnswers[questionPosition];
    if (correctAnswer.type === 'multipleChoice') {
      let multipleChoiceHandler = new MultipleChoiceHandler(activeQuestion, correctAnswer);
      multipleChoiceHandler.handleUserInput();
    }
  }
}
