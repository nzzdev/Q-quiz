const checkmark = '<svg class="q-quiz-result__answer__checkmark s-viz-color-three-5" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="none" d="M0 12V0h16v16H0z"/><path d="M0 9l5 5L16 3l-2-2-9 9-3-3-2 2z" fill="currentColor"/></g></svg>';
const crossmark = '<svg class="q-quiz-result__answer__checkmark s-viz-color-six-5" width="16" height="16" viewBox="0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="none" d="M0 12V0h16v16H0z"/><path fill="currentColor" d="M8 10l-5 5-2-2 5-5-5-5 2-2 5 5 5-5 2 2-5 5 5 5-2 2-5-5z"/></g></svg>';

let header;
let quizContainer;
let numberElements;
let numberQuestions;
let hasCover;
let hasLastCard;

function initValues(data, quizRootElement) {
  header = quizRootElement.querySelector('.q-quiz-header');
  quizContainer = quizRootElement.querySelector('.q-quiz-container');
  numberElements = data.numberElements;
  numberQuestions = data.numberQuestions;
  hasCover = data.hasCover;
  hasLastCard = data.hasLastCard;
}

function setPosition(position) {
  quizContainer.style.transform = `translateX(${position * -100 / numberElements}%)`;
  quizContainer.style.webkitTransform = `translateX(${position * -100 / numberElements}%)`;
  let quizElements = quizContainer.querySelectorAll('.q-quiz-element-container');

  for (let i = 0; i < quizElements.length; i++) {
    if (i === position) {
      quizElements.item(i).classList.remove('q-quiz-element-container--is-inactive')
      quizElements.item(i).classList.add('q-quiz-element-container--is-active')
    } else {
      quizElements.item(i).classList.remove('q-quiz-element-container--is-active')
      quizElements.item(i).classList.add('q-quiz-element-container--is-inactive')
    }
  }
}

function changeHeader(position) {
  if (position < numberQuestions) {
    header.querySelector('.q-quiz-header__title').textContent = "Frage " + position + " / " + numberQuestions;
  } else if (position === numberQuestions) {
    header.querySelector('.q-quiz-header__title').textContent = "letzte Frage";
    if (!hasLastCard) {
      header.querySelector('.q-quiz-button').classList.add('q-quiz-button--hidden');
    } else {
      header.querySelector('.q-quiz-button__content span').textContent = "Thema vertiefen";
    }
  } else {
    header.querySelector('.q-quiz-header__title').textContent = "Fertig!"
    header.querySelector('.q-quiz-button').classList.add('q-quiz-button--hidden');
  }
}

function showHeader() {
  header.classList.remove('q-quiz-header--is-empty');
  header.querySelector('.q-quiz-button').classList.remove('q-quiz-button--hidden');
}

// todo: different handling for different question types
function handleAnswer(correctAnswer) {
  const activeQuestion = quizContainer.querySelector('.q-quiz-element-container--is-active');
  if (correctAnswer.type === 'multipleChoice') {
    handleMultipleChoice(correctAnswer, activeQuestion);
  } else if (correctAnswer.type === 'numberGuess') {

  } else if (correctAnswer.type === 'mapPointGuess') {
    
  }
}

function handleMultipleChoice(correctAnswer, activeQuestion) {
  let answerButtons = activeQuestion.querySelectorAll('.q-quiz-answer-button');
  answerButtons.forEach(answerButton => {
    answerButton.addEventListener('click', function(event) {
      activeQuestion.querySelector('.q-quiz-input').classList.add('state-hidden');
      activeQuestion.querySelector('.q-quiz-result').classList.remove('state-hidden');
      activeQuestion.querySelector('.q-quiz-result').classList.add('state-visible');
      activeQuestion.querySelectorAll('.q-quiz-result__answer > span').forEach(element => {
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
}

export function display(data, quizRootElement) {
  initValues(data, quizRootElement);
  let currentPosition = 0;
  let offset = 0;

  if (hasCover) {
    // maybe better solution for non-question elements (differently build data object?)
    offset = -1;
    let quizStartButton = quizContainer.querySelector('.q-quiz-button');
    quizStartButton.addEventListener('click', function(event) {
      currentPosition++;
      setPosition(currentPosition);
      changeHeader(currentPosition);
      showHeader();
      handleAnswer(data.correctAnswers[currentPosition + offset]);
    });
  }

  let nextQuestionButton = header.querySelector('.q-quiz-button');
  nextQuestionButton.addEventListener('click', function(event) {
    currentPosition++;
    setPosition(currentPosition);
    changeHeader(currentPosition);
    handleAnswer(data.correctAnswers[currentPosition + offset]);
  })
}

