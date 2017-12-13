const Joi = require('joi');
const getAchievedScore = require('../../resources/helpers/scoreHelpers.js').getAchievedScore;
const scoreConstants = require('../../resources/helpers/scoreConstants.js');

module.exports = {
  method: 'POST',
  path: '/score/{index}',
  options: {
    validate: {
      payload: {
        score: Joi.object().required(),
        answerValue: Joi.required()
      },
      params: {
        index: Joi.number().required()
      }
    },
    cors: true
  },
  handler: function(request, h){
    // TODO rename worst answer because it's more a worst distance
    let score = request.payload.score;
    const currentQuestion = score.questions[request.params.index]
    if (currentQuestion.type === 'multipleChoice' && request.payload.answerValue === currentQuestion.correctAnswer) {
      score.questions[request.params.index].achievedScore = scoreConstants.multiplicator[currentQuestion.type];
    }
    if (currentQuestion.type === 'numberGuess' && currentQuestion.worstAnswerDifference !== undefined) {
      const guessQuality = 1 - (Math.abs(request.payload.answerValue - currentQuestion.correctAnswer) / currentQuestion.worstAnswerDifference);
      score.questions[request.params.index].achievedScore = getAchievedScore(guessQuality, currentQuestion.type);
    }
    if (currentQuestion.type === 'mapPointGuess' && currentQuestion.worstAnswerDifference !== undefined) {
      const guessQuality = 1 - (request.payload.answerValue.distance / currentQuestion.worstAnswerDifference);
      score.questions[request.params.index].achievedScore = getAchievedScore(guessQuality, currentQuestion.type);
    }
    return score;
  }
}
