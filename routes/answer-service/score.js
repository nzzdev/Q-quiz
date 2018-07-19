const fs = require("fs");
const Enjoi = require("enjoi");
const Joi = require("joi");
const Boom = require("boom");
const resourcesDir = __dirname + "/../../resources/";
const scoreHelpers = require(`${resourcesDir}helpers/scoreHelpers.js`);
const questionTypes = require(`${resourcesDir}helpers/constants.js`)
  .questionTypes;
const answerDb = require("../../resources/helpers/db.js").quizDb;

const schemaString = JSON.parse(
  fs.readFileSync(`${resourcesDir}schema.json`, {
    encoding: "utf-8"
  })
);

const schema = Enjoi(schemaString).required();

module.exports = {
  method: "POST",
  path: "/score",
  options: {
    validate: {
      payload: {
        item: schema,
        userAnswers: Joi.array().items(
          Joi.object({
            questionId: Joi.string()
          })
        )
      },
      options: {
        allowUnknown: true
      }
    },
    cors: true
  },
  handler: async function(request, h) {
    try {
      const questions = request.payload.item.elements.filter(element => {
        return questionTypes.includes(element.type);
      });

      const userAnswers = request.payload.userAnswers;
      questions.forEach(question => {
        if (userAnswers) {
          const relevantAnswers = userAnswers.filter(
            userAnswer => userAnswer.questionId === question.id
          );
          if (relevantAnswers.length > 0) {
            question.userAnswer = relevantAnswers[0].value;
          }
        }
      });

      return scoreHelpers.calculateScore(questions);
    } catch (e) {
      return Boom.internal(e);
    }
  }
};
