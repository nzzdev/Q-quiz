export default class AnswerStore {

  constructor(qServerOrigin) {
    this.qServerOrigin = qServerOrigin;
  }

  saveAnswer(answer) {
    return fetch(`${this.qServerOrigin}/answer`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        data: answer
      })
    })
    .then(response => {
      return response.json()
    })
    .then(data => {
      return data;
    })
  }

  getStats(itemId, questionData, answerId = undefined) {
    if (questionData.type === 'numberGuess' || questionData.type === 'mapPointGuess' || questionData.type === 'multipleChoice') {
      let statsServiceUrl = `${this.qServerOrigin}/stats/answers/${questionData.type}/${itemId}/${questionData.id}`
      if (answerId !== undefined) {
        statsServiceUrl += `/${answerId}`
      }
      return fetch(statsServiceUrl)
        .then(response => {
          return response.json()
        })
    } else {
      return Promise.resolve(undefined)
    }
  }

}
