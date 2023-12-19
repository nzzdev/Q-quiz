import Joi from 'joi';
import Boom from '@hapi/boom';

const getAnswers = require('../../resources/helpers/utils.js').getAnswers;
const getNumberOfAnswers =
  require('../../resources/helpers/utils.js').getNumberOfAnswers;
const getAnswer = require('../../resources/helpers/utils.js').getAnswer;
const getItem = require('../../resources/helpers/utils.js').getItem;

const statsCalculators = require('../../resources/helpers/statsCalculators.js');

module.exports = [
  {
    method: 'GET',
    path: '/stats/answers/{type}/{itemId}/{questionId}/{answerId?}',
    options: {
      tags: ['api'],
      validate: {
        params: {
          type: Joi.any().valid(Object.keys(statsCalculators)).required(),
          itemId: Joi.string().required(),
          questionId: Joi.string().required(),
          answerId: Joi.string().optional(),
        },
      },
    },
    handler: async function (request, h) {
      try {
        let options = {};

        let validQueryOptions = Object.keys(request.query).filter(function (
          optionName
        ) {
          return validCouchDBViewOptions.indexOf(optionName) >= 0;
        });

        validQueryOptions.forEach(function (optionName) {
          options[optionName] = request.query[optionName];
        });

        let dataPromises = [
          getAnswers(request.params.type, request.params.questionId, options),
          getItem(request.params.itemId),
        ];

        if (request.params.answerId !== undefined) {
          dataPromises.push(getAnswer(request.params.answerId));
        }

        return await Promise.all(dataPromises)
          .then((data) => {
            let answers = data[0];
            let item = data[1];
            let userAnswer;
            if (data[2]) {
              userAnswer = data[2];
            }

            let answersStats = [];
            if (answers.rows && answers.rows.length > 0) {
              answersStats = answers.rows.map((row) => {
                return {
                  value: row.key[1],
                  count: row.value,
                };
              });
            }

            let question = item.elements.filter((quizElement) => {
              return quizElement.id === request.params.questionId;
            })[0];

            let statsCalculator = new statsCalculators[request.params.type](
              answersStats,
              question.answer,
              userAnswer
            );

            let stats = statsCalculator.getStats();

            return stats;
          })
          .catch((couchError) => {
            console.log('error', couchError);
            return Boom.badRequest(couchError.message);
          });
      } catch (e) {
        console.log(`error in stats route: ${e}`);
        return Boom.badRequest(e);
      }
    },
  },
];
