import QuestionHandler from "./QuestionHandler.js";
import * as helpers from "./helpers.js";
import env from "./env.js";

export function display(data, quizRootElement, clientEnv) {
  env.ENRICO_API_URL = clientEnv.ENRICO_API_URL;
  env.ENRICO_PRODUCTS = clientEnv.ENRICO_PRODUCTS;
  env.MAP = {
    style: clientEnv.MAP_STYLE_URL,
    attribution: clientEnv.MAP_ATTRIBUTION,
  };

  let questionHandler = new QuestionHandler(quizRootElement, data);
  let position = 0;

  // if we start the quiz without a cover we render everything what's needed on client side
  if (data.numberElements === 1 || !data.hasCover) {
    questionHandler.renderInputElement(position);
  }

  // add event listeners for switching to next question, answer buttons and input elements (number guess)
  let quizButtons = quizRootElement.querySelectorAll(".q-quiz-button");
  quizButtons.forEach((quizButton) => {
    quizButton.addEventListener("click", () => {
      position++;
      questionHandler.renderInputElement(position);

      // dispatch CustomEvent for next-screen for tracking
      // or anyone else interested in it
      let quizControlEvent = new CustomEvent("q-tracking-event", {
        bubbles: true,
        detail: {
          eventInfo: {
            componentName: "q-quiz",
            eventAction: "next-screen",
            eventNonInteractive: false,
          },
        },
      });
      quizRootElement.dispatchEvent(quizControlEvent);
    });
  });

  let answerButtons = quizRootElement.querySelectorAll(".q-quiz-answer-button");
  answerButtons.forEach((answerButton) => {
    answerButton.addEventListener("click", (event) => {
      questionHandler.handleAnswer(event);
    });
  });

  // construct picture element on client side if not already done on server-side
  let quizQuestionImages = Array.prototype.slice.call(
    quizRootElement.querySelectorAll(".q-quiz-question-image")
  );
  if (quizQuestionImages.length > 0) {
    if (quizQuestionImages[0].tagName !== "IMG") {
      helpers.constructPictureElement(quizRootElement, quizQuestionImages);
    }
  }
}
