import NumberGuess from "./NumberGuessHandler.js";
import MultipleChoice from "./MultipleChoiceHandler.js";
import MapPointGuess from "./MapPointGuessHandler.js";
import * as answerHelpers from "./answerHelpers.js";
import MultiQuizPositionHandler from "./MultiQuizPositionHandler.js";
import AnswerStore from "./AnswerStore.js";

const questionTypes = {
  numberGuess: NumberGuess,
  multipleChoice: MultipleChoice,
  mapPointGuess: MapPointGuess
};

export default class QuestionHandler {
  constructor(quizRootElement, data) {
    this.quizRootElement = quizRootElement;
    this.data = data;
    this.userAnswers = [];
    this.isSingleQuestionQuiz = data.numberElements === 1;
    if (!this.isSingleQuestionQuiz) {
      this.multiQuizPositionHandler = new MultiQuizPositionHandler(
        quizRootElement,
        data
      );
    }
    this.answerStore = new AnswerStore(this.data.toolBaseUrl);
  }

  renderInputElement(position) {
    if (this.isSingleQuestionQuiz) {
      this.questionPosition = 0;
      this.quizElement = this.quizRootElement.querySelector(
        ".q-quiz-element-container--is-active"
      );
    } else {
      this.multiQuizPositionHandler.setPosition(position);
      this.questionPosition =
        this.multiQuizPositionHandler.getQuestionNumber() - 1;
      this.quizElement = this.multiQuizPositionHandler.getQuizElement();
    }

    if (this.questionPosition < this.data.questionElementData.length) {
      this.renderQuestion();
    } else if (this.data.hasLastCard) {
      this.renderLastCard();
    }
  }

  renderQuestion() {
    this.questionType = this.data.questionElementData[
      this.questionPosition
    ].type;
    this.questionRenderer = new questionTypes[this.questionType](
      this.quizElement,
      this.data.questionElementData[this.questionPosition],
      this.data.itemId,
      this.data.toolBaseUrl
    );
    if (typeof this.questionRenderer.renderInput === "function") {
      this.questionRenderer.renderInput();
    }
  }

  handleAnswer(event) {
    const answerValue = this.questionRenderer.getValue(event);

    if (typeof this.questionRenderer.isAnswerValid === "function") {
      if (!this.questionRenderer.isAnswerValid()) {
        this.questionRenderer.handleInvalidAnswer();
        return;
      }
    }

    // dispatch a custom event for tracking system to track the answer
    // and others if they are interested
    let answerEvent = new CustomEvent("q-quiz-answer", {
      bubbles: true,
      detail: {
        id: this.data.questionElementData[this.questionPosition].id
      }
    });
    this.quizRootElement.dispatchEvent(answerEvent);
    this.questionRenderer.renderResult(answerValue);
    this.userAnswers.push({
      questionId: this.data.questionElementData[this.questionPosition].id,
      value: answerValue
    });

    this.storeAnswer(answerValue)
      .then(responseStoreAnswer => {
        let answerId;
        if (responseStoreAnswer && responseStoreAnswer.id) {
          answerId = responseStoreAnswer.id;
        }
        return answerId;
      })
      .then(answerId => {
        return this.answerStore.getStats(
          this.data.itemId,
          this.data.questionElementData[this.questionPosition],
          answerId
        );
      })
      .then(stats => {
        if (typeof this.questionRenderer.renderResultStats === "function") {
          this.questionRenderer.renderResultStats(answerValue, stats);
        }
      })
      .catch(e => {
        // nevermind errors in storing the answer, we move on without displaying stats in this case
      });

    // if this was the last question, get score result promise
    if (
      this.questionPosition === this.data.questionElementData.length - 1 &&
      this.data.hasLastCard
    ) {
      this.getScore();
    }
    this.renderAdditionalInformation();
    this.displayResult();
  }

  storeAnswer(answerValue) {
    let answerData = {
      itemId: this.data.itemId,
      questionId: this.data.questionElementData[this.questionPosition].id,
      type: this.questionType,
      value: answerValue
    };

    if (!this.data.isPure) {
      return this.answerStore.saveAnswer(answerData);
    } else {
      return Promise.resolve();
    }
  }

  getScore() {
    // either scorePromise is already set with answering the last question or it will be set whenever needed e.g. when rendering last card
    if (this.scorePromise === undefined) {
      this.scorePromise = fetch(
        `${this.data.toolBaseUrl}/score?appendItemToPayload=${
          this.data.itemId
        }`,
        {
          method: "POST",
          body: JSON.stringify({
            userAnswers: this.userAnswers
          })
        }
      ).then(response => {
        if (response.ok) {
          return response.json();
        }
      });
    }
    return this.scorePromise;
  }

  renderAdditionalInformation() {
    answerHelpers.renderAdditionalInformationForQuestion(
      this.quizElement,
      this.data.questionElementData[this.questionPosition],
      this.data.enricoAPIUrl
    );
  }

  displayResult() {
    this.quizElement
      .querySelector(".q-quiz-input")
      .classList.add("state-hidden");
    this.quizElement
      .querySelector(".q-quiz-result")
      .classList.remove("state-hidden");
    this.quizElement
      .querySelector(".q-quiz-result")
      .classList.add("state-visible");
    if (this.hasNoFurtherQuizElements()) {
      this.quizElement
        .querySelector(".q-quiz-button")
        .classList.add("state-hidden");
    } else if (this.isNextQuizElementLastCard()) {
      if (this.data.isFinalScoreShown) {
        this.quizElement.querySelector(
          ".q-quiz-button__content span"
        ).textContent =
          "zur Auswertung";
      } else {
        this.quizElement.querySelector(
          ".q-quiz-button__content span"
        ).textContent =
          "Thema vertiefen";
      }
    }
  }

  hasNoFurtherQuizElements() {
    return (
      this.isSingleQuestionQuiz ||
      this.multiQuizPositionHandler.getPosition() ===
        this.data.numberElements - 1
    );
  }

  isNextQuizElementLastCard() {
    return (
      this.multiQuizPositionHandler.getQuestionNumber() ===
        this.data.questionElementData.length && this.data.hasLastCard
    );
  }

  renderLastCard() {
    if (
      this.data.lastCardData &&
      this.data.lastCardData.articleRecommendations
    ) {
      answerHelpers.renderAdditionalInformationForLastCard(
        this.quizElement,
        this.data.lastCardData.articleRecommendations,
        this.data.enricoAPIUrl
      );
    }
    if (this.data.isFinalScoreShown) {
      this.getScore().then(score => {
        let lastCardTitleElement = this.quizElement.querySelector(
          ".q-quiz-last-card-title"
        );
        lastCardTitleElement.innerHTML = `Sie haben ${
          score.achievedScore
        } von ${score.maxScore} möglichen Punkten erzielt.`;
        this.quizRootElement.querySelector(
          ".q-quiz-header__title"
        ).textContent =
          score.lastCardTitle;
      });
    }
  }
}
