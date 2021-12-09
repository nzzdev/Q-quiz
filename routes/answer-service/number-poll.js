"use strict";

const Boom = require("@hapi/boom");
const Joi = require("joi");
const getAnswers = require("../../resources/helpers/utils.js").getAnswers;
const getItem = require("../../resources/helpers/utils.js").getItem;

const getBarchartSvg =
  require("../../resources/helpers/svgHelpers.js").getBarchartSvg;
const getStripplotSvg =
  require("../../resources/helpers/svgHelpers.js").getStripplotSvg;

module.exports = [
  {
    method: "GET",
    path: "/number-poll/{itemId}/{questionId}/plot/{width}",
    options: {
      tags: ["api"],
      validate: {
        params: {
          itemId: Joi.string().required(),
          questionId: Joi.string().required(),
          width: Joi.number().required(),
        },
      },
    },
    handler: async function (request, h) {
      return await Promise.all([
        getItem(request.params.itemId),
        getAnswers("numberPoll", request.params.questionId),
      ])
        .then((data) => {
          let item = data[0];
          let answers = data[1];
          let stats;

          if (answers.rows && answers.rows.length > 0) {
            stats = answers.rows.map((row) => {
              return {
                value: row.key[1],
                count: row.value,
              };
            });
          }
          let question = item.elements.filter((element) => {
            return element.id === request.params.questionId;
          })[0];

          return {
            stats: stats,
            question: question,
          };
        })
        .then(async (data) => {
          let stats = data.stats;
          let question = data.question;

          question.min = parseFloat(question.min);
          question.max = parseFloat(question.max);
          question.step = parseFloat(question.step);

          let numberOfPossibleAnswers = 0;
          for (let i = question.min; i <= question.max; i = i + question.step) {
            numberOfPossibleAnswers++;
          }

          if (numberOfPossibleAnswers <= 100) {
            try {
              return await getBarchartSvg(
                question,
                stats,
                request.params.width
              );
            } catch (errMessage) {
              console.log(errMessage);
              return Boom.badRequest(errMessage);
            }
          } else {
            try {
              return await getStripplotSvg(
                question,
                stats,
                request.params.width
              );
            } catch (errMessage) {
              console.log(errMessage);
              return Boom.badRequest(errMessage);
            }
          }
        })
        .catch((couchError) => {
          console.log(couchError);
          return Boom.badRequest(couchError.message);
        });
    },
  },
];
