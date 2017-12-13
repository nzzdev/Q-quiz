const Joi = require('joi');
const getAchievedScore = require('../../resources/helpers/scoreHelpers.js').getAchievedScore;

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
      // answer quality is set to best value of 1 for multiple choice questions
      score.questions[request.params.index].achievedScore = getAchievedScore(1, currentQuestion.type);
    }
    if (currentQuestion.type === 'numberGuess' && currentQuestion.worstAnswerDifference !== undefined) {
      const answerQuality = 1 - (Math.abs(request.payload.answerValue - currentQuestion.correctAnswer) / currentQuestion.worstAnswerDifference);
      score.questions[request.params.index].achievedScore = getAchievedScore(answerQuality, currentQuestion.type);
    }
    if (currentQuestion.type === 'mapPointGuess' && currentQuestion.worstAnswerDifference !== undefined) {
      const answerQuality = 1 - (request.payload.answerValue.distance / currentQuestion.worstAnswerDifference);
      score.questions[request.params.index].achievedScore = getAchievedScore(answerQuality, currentQuestion.type);
    }
    return score;
  }
}
