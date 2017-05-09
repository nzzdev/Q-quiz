const correctAnswers = [
  {
    id: "24e0125fe3583db8016ae44c2df47a64-1492782862005-3923",
    answer: "Homer",
    answerText: "Homer hatte die \"Odyssee\" gesungen, von James Joyce stammte der \"Ulysses\", und Derek Walcott hatte das Epos \"Omeros\" geschrieben."
  },
  {
    id: "24e0125fe3583db8016ae44c2df47a64-1492783275801-3327",
    answer: "663750",
    answerText: "Die Manuskript-Seite wurde im Juli 2000 bei Christie's für 663'750 Pfund versteigert."
  },
  {
    id: "24e0125fe3583db8016ae44c2df47a64-1492786169038-1451",
    answer: "\"Heidi\" von Johanna Spyri",
    answerText: "Johanna Spyris 1880 erschienenes Jugendbuch \"Heidi\" wurde in mehr als fünfzig Sprachen übersetzt."
  },
  {
    id: "24e0125fe3583db8016ae44c2df47a64-1492786574258-7503",
    answer: {
      "lat": 53.33928,
      "lng": -6.281314
    },
    answerText: "\"Ulysses\" von James Joyce spielt am 16. Juni 1904 in Dublin."
  }
]

let quiz = document.getElementsByClassName('q-quiz')[0];
let header = quiz.querySelector('.q-quiz-header');

const numberQuestions = correctAnswers.length;
let numberElements = numberQuestions;

// how to encapsulate from other quizzes?
let multiQuizContainerElement = document.getElementsByClassName('q-quiz-multi-container')[0];
let coverCard = multiQuizContainerElement.querySelector('.q-quiz__cover');
let lastCard = multiQuizContainerElement.querySelector('.q-quiz__last-card');
let currentPosition = 0;
const hasCover = coverCard !== undefined && coverCard !== null;
const hasLastCard = lastCard !== undefined && lastCard !== null;
if (hasCover) {
  numberElements++;
}
if (hasLastCard) {
  numberElements++;
}

function setPosition(position) {
  multiQuizContainerElement.style.transform = `translateX(${position * -100/numberElements}%)`;
  multiQuizContainerElement.style.webkitTransform = `translateX(${position * -100/numberElements}%)`;
  let multiQuizElements = multiQuizContainerElement.children;

  for (let i = 0; i < multiQuizElements.length; i++) {
    if (i === position) {
      multiQuizElements.item(i).classList.remove('q-quiz-element-container--is-inactive')
      multiQuizElements.item(i).classList.add('q-quiz-element-container--is-active')
    } else {
      multiQuizElements.item(i).classList.remove('q-quiz-element-container--is-active')
      multiQuizElements.item(i).classList.add('q-quiz-element-container--is-inactive')
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

if (hasCover) {
  let quizStartButton = multiQuizContainerElement.querySelector('.q-quiz-button');
  quizStartButton.addEventListener('click', function(event) {
    currentPosition++;
    setPosition(currentPosition);
    changeHeader(currentPosition);
    showHeader();
  })
}

let nextQuestionButton = header.querySelector('.q-quiz-button');
nextQuestionButton.addEventListener('click', function(event) {
  currentPosition++;
  setPosition(currentPosition);
  changeHeader(currentPosition);
})


export function display(data, element) {
  console.log(data);
  console.log(element);
}


// endpoint to fetch json of correct answers
// and then do fancy stuff with it :)
