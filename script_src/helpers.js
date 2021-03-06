import env from "./env.js";

export function loadAdditionalArticles(articleIds) {
  let loadPromises = [];
  const apiUrl = env.ENRICO_API_URL;
  const enricoProducts = env.ENRICO_PRODUCTS;

  articleIds.forEach(articleId => {
    if (!articleId || articleId.length === 0) {
      return;
    }

    enricoProducts.forEach(product => {
      loadPromises.push(
        fetch(`${apiUrl}?product=${product}&articleid=${articleId}`)
          .then(response => {
            if (response.status >= 200 && response.status < 300) {
              return response.json();
            }
            return undefined;
          })
          .catch(e => {
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
  quizQuestionImages.forEach(function(quizImage) {
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
    webp2x: getImageUrl(imageServiceUrl, imageKey, width * 2, "webply")
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
