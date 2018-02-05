export function loadAdditionalArticles(articleIds) {
  let loadPromises = [];
  const apiUrl = "https://enrico.nzz-tech.ch/v1/article";

  const enricoProducts = ["nzz", "nzzas"];

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
    type === "multipleChoice" ||
    type === "mapPointGuess"
  );
}

export function constructPictureElement(quizRootElement, quizQuestionImages) {
  const elementMarkup =
    '<source type="image/webp" srcset="webp1x 1x, webp2x 2x"><source srcset="png1x 1x, png2x 2x"><img class="q-quiz-question-image" src="png1x">';
  const rootElementWidth = quizRootElement.getBoundingClientRect().width;
  quizQuestionImages.forEach(function(quizImage) {
    const imageKey = quizImage.getAttribute("data-imageKey");
    const imageServiceUrl = quizImage.getAttribute("data-imageServiceUrl");
    const urls = getUrlsForImageAndWidth(
      imageServiceUrl,
      imageKey,
      rootElementWidth
    );
    const innerHTMLPictureElement = elementMarkup
      .replace(/png1x/g, urls.png1x)
      .replace(/png2x/g, urls.png2x)
      .replace(/webp1x/g, urls.webp1x)
      .replace(/webp2x/g, urls.webp2x);
    quizImage.innerHTML = innerHTMLPictureElement;
  });
}

function getImageUrlForWidthAndFormat(
  imageServiceUrl,
  imageKey,
  width,
  format
) {
  return imageServiceUrl
    .replace(/{key}/g, imageKey)
    .replace(/{width}/g, width)
    .replace(/{format}/g, format);
}

function getUrlsForImageAndWidth(imageServiceUrl, imageKey, width) {
  return {
    png1x: getImageUrlForWidthAndFormat(
      imageServiceUrl,
      imageKey,
      width,
      "png"
    ),
    png2x: getImageUrlForWidthAndFormat(
      imageServiceUrl,
      imageKey,
      width * 2,
      "png"
    ),
    webp1x: getImageUrlForWidthAndFormat(
      imageServiceUrl,
      imageKey,
      width,
      "webpll"
    ),
    webp2x: getImageUrlForWidthAndFormat(
      imageServiceUrl,
      imageKey,
      width * 2,
      "webpll"
    )
  };
}
