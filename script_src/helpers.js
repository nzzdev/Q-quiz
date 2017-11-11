export function loadAdditionalArticles(articleIds) {
  let loadPromises = [];
  const apiUrl = 'https://enrico.nzz-tech.ch/v1/article';
  
  const enricoProducts = ['nzz'];

  articleIds.forEach(articleId => {
    if (!articleId || articleId.length === 0) {
      return
    }

    for (let product of enricoProducts) {
      loadPromises.push(
        fetch(`${apiUrl}?product=${product}&articleid=${articleId}`)
          .then(response => {
            if (response.status >= 200 && response.status < 300) {
              return response.json();
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
    }    
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
