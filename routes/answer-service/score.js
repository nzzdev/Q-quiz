const fs = require('fs');
const Enjoi = require('enjoi');
const Joi = require('joi');
const resourcesDir = __dirname + '/../../resources/';
const scoreHelpers = require(`${resourcesDir}helpers/scoreHelpers.js`);
const questionTypes = require(`${resourcesDir}helpers/constants.js`).questionTypes;
const answerDb = require('../../resources/helpers/db.js').quizDb;

const schemaString = JSON.parse(fs.readFileSync(`${resourcesDir}schema.json`, {
  encoding: 'utf-8'
}));

const schema = Enjoi(schemaString);

module.exports = {
  method: 'POST',
  path: '/score',
  options: {
    validate: {
      payload: {
        item: schema,
        userAnswers: Joi.array().items(Joi.object({
          questionId: Joi.string().required(),
          value: Joi.required()
        }))
      },
      options: {
        allowUnknown: true
      }
    },
    cors: true
  },
  handler: async function(request, h){
    const questions = request.payload.item.elements.filter(element => {
      return questionTypes.includes(element.type);
    });

    const userAnswers = request.payload.userAnswers;
    questions.forEach(question => {
      const relevantAnswers = userAnswers.filter(userAnswer => userAnswer.questionId === question.id);
      if (relevantAnswers.length > 0) {
        question.userAnswer = relevantAnswers[0].value;
      }
    })

    return scoreHelpers.calculateScore(questions);
  }
}
