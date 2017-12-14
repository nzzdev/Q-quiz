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
        answerValues: Joi.array().required()
      },
      options: {
        allowUnknown: true
      }
    },
    cors: true
  },
  handler: async function(request, h){
    const questions = request.payload.item.elements.filter(element => {
      return questionTypes.include(element.type);
    });

    questions.forEach((question, index) => {
      question.answerValue = answerValues[index];
    })

    return scoreHelpers.calculateScore(questions);
  }
}
