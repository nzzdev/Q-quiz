import env from "./env.js";

export function loadAdditionalArticles(articleIds) {
  let loadPromises = [];
  const apiUrl = env.ENRICO_API_URL;
  const enricoProducts = env.ENRICO_PRODUCTS;

  articleIds.forEach((articleId) => {
    if (!articleId || articleId.length === 0) {
      return;
    }

    enricoProducts.forEach((product) => {
      loadPromises.push(
        fetch(`${apiUrl}?product=${product}&articleid=${articleId}`)
          .then((response) => {
            if (response.status >= 200 && response.status < 300) {
              return response.json();
            }
            return undefined;
          })
          .catch((e) => {
            // console.log(e);
          })
      );
    });
  });
  return Promise.all(loadPromises);
}

export function isQuestionElement(element) {
  return isQuestionType(element.type);
}

export function isQuestionType(type) {
  return (
    type === "numberGuess" ||
    type === "numberPoll" ||
    type === "multipleChoice" ||
    type === "mapPointGuess"
  );
}

export function constructPictureElement(quizRootElement, quizQuestionImages) {
  const elementMarkup =
    '<source type="image/webp" srcset="{webp1x} 1x, {webp2x} 2x"><source srcset="{image1x} 1x, {image2x} 2x"><img class="q-quiz-question-image q-quiz-question-image--responsive" src="{image1x}">';
  const rootElementWidth = quizRootElement.getBoundingClientRect().width;
  quizQuestionImages.forEach(function (quizImage) {
    const imageKey = quizImage.getAttribute("data-imageKey");
    const imageServiceUrl = quizImage.getAttribute("data-imageServiceUrl");
    const urls = getImageUrls(imageServiceUrl, imageKey, rootElementWidth);
    const innerHTMLPictureElement = elementMarkup
      .replace(/{image1x}/g, urls.image1x)
      .replace(/{image2x}/g, urls.image2x)
      .replace(/{webp1x}/g, urls.webp1x)
      .replace(/{webp2x}/g, urls.webp2x);
    quizImage.innerHTML = innerHTMLPictureElement;
  });
}

export function alignInputRangeLabelPosition(
  displayedRangeValue,
  positionInPercent,
  labelEle,
  labelContainerEle
) {
  const snapToStartThreshold = calculateSnapToBorderThreshold(
    displayedRangeValue,
    labelEle
  );
  const snapToEndThreshold = 100 - snapToStartThreshold;

  if (positionInPercent < snapToStartThreshold) {
    labelContainerEle.classList.add(
      "q-quiz-input-range-position-label-container--flex"
    );
    labelEle.classList.add("q-quiz-input-range-position-label--left-aligned");
  } else if (positionInPercent > snapToEndThreshold) {
    labelContainerEle.classList.add(
      "q-quiz-input-range-position-label-container--flex"
    );
    labelEle.classList.add("q-quiz-input-range-position-label--right-aligned");
  } else {
    labelContainerEle.classList.remove(
      "q-quiz-input-range-position-label-container--flex"
    );
    labelEle.classList.remove(
      "q-quiz-input-range-position-label--left-aligned"
    );
    labelEle.classList.remove(
      "q-quiz-input-range-position-label--right-aligned"
    );
  }
}

function calculateSnapToBorderThreshold(displayedValue, labelEle) {
  if (displayedValue < 1000) {
    return 0;
  }

  const qQuizEle = labelEle.closest(".q-quiz");
  const quizWidth = qQuizEle.getBoundingClientRect().width;
  const smallViewportWidth = 400;
  const baseThreshold = quizWidth <= smallViewportWidth ? 10 : 5;

  return baseThreshold;
}

export function formatNumber(number) {
  const quarterSpace = " ";
  const formatter = new Intl.NumberFormat("de-CH");
  const parts = formatter.formatToParts(number);
  const formattedNumber = parts
    .map((part) => (part.type === "group" ? quarterSpace : part.value))
    .join("");

  return formattedNumber;
}

function getImageUrls(imageServiceUrl, imageKey, width) {
  return {
    image1x: getImageUrl(
      imageServiceUrl,
      imageKey,
      width,
      getFileExtension(imageKey)
    ),
    image2x: getImageUrl(
      imageServiceUrl,
      imageKey,
      width * 2,
      getFileExtension(imageKey)
    ),
    webp1x: getImageUrl(imageServiceUrl, imageKey, width, "webply"),
    webp2x: getImageUrl(imageServiceUrl, imageKey, width * 2, "webply"),
  };
}

function getImageUrl(imageServiceUrl, imageKey, width, format) {
  return imageServiceUrl
    .replace(/{key}/g, imageKey)
    .replace(/{width}/g, width)
    .replace(/{format}/g, format);
}

function getFileExtension(imageKey) {
  const fileExtensionPattern = /\.([0-9a-z]+$)/i;
  const fileExtension = imageKey.match(fileExtensionPattern);
  if (fileExtension && fileExtension[1] === "png") {
    return "png";
  }
  return "pjpg";
}
