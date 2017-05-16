export function wrapEmojisInSpan(text) {
  text = text.replace(
    /([\ud800-\udbff])([\udc00-\udfff])/g,
    '<span class="emoji">$&</span>')
  return text
}


export function loadAdditionalArticles(articleIds) {
  let loadPromises = [];
  let apiUrl = 'https://headlines.nzz.ch/api/articles';
  if (articleIds.length > 0) {
    let relatedTitle = document.querySelector('.nzz-st-1602-related__title');
    if (relatedTitle) {
      relatedTitle.style.opacity = "1";
    }
  }
  articleIds.forEach(articleId => {
    if (!articleId || articleId.length === 0) {
      return
    }
    loadPromises.push(
      fetch(`${apiUrl}/${articleId}`)
        .then(response => {
          if ((response.status >= 200 && response.status < 300) || window.XDomainRequest === window.XMLHttpRequest) {
            return response.json();
          } else if (response.status === 404) {
            return undefined;
          } else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
          }
        })
        .catch(e => {
          // console.log(e);
        })
    );
  });
  return Promise.all(loadPromises);
}

export function isQuestionElement(element) {
  return isQuestionType(element.type)
}

export function isQuestionType(type) {
  return type === 'numberGuess' ||
         type === 'multipleChoice' ||
         type === 'mapPointGuess'
}
