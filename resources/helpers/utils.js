const quizDb = require("./db.js").quizDb;
const fetch = require("node-fetch");

function getAnswers(type, questionId, options) {
  if (typeof options === "undefined") {
    options = {};
  }
  if (
    type === "numberGuess" ||
    type === "mapPointGuess" ||
    type === "multipleChoice"
  ) {
    options["start_key"] = [questionId];
    options["end_key"] = [questionId, {}];
    options["group"] = true;
  }

  return quizDb.query(`stats/answers-${type}`, options);
}

function getAnswer(id) {
  return quizDb.get(id).then(answer => {
    return answer.data;
  });
}

function getItem(itemId) {
  return fetch(`${process.env.COUCH_DB_URL_Q_ITEMS}/${itemId}`)
    .then(response => {
      if (response.ok && response.status < 400) {
        return response.json();
      }
      throw new Error(response);
    })
    .then(item => {
      // if the type is set directly on the top level, we have a legacy datastructure
      // and transform it here, so we can handle legacy and new datastructure
      if (item.type) {
        // transform legacy datastructure
        // check again concerning item.data..
        let elements = [];
        elements.push(
          Object.assign(
            {
              id: item._id,
              title: item.title,
              notes: item.notes,
              type: item.type
            },
            item.data
          )
        );

        delete item.type;
        item.data = {
          elements: elements
        };
      }
      return item;
    });
}

function getNumberOfAnswers(questionId, options) {
  if (typeof options === "undefined") {
    options = {};
  }
  options["key"] = questionId;
  options["reduce"] = true;

  return quizDb.query("docs/byQuestionId", options).then(data => {
    return data.rows[0].value;
  });
}

function getPrecision(n) {
  var e = 1;
  while (Math.round(n * e) / e !== n) e *= 10;
  return Math.round(Math.log(e) / Math.LN10);
}

module.exports = {
  getAnswers: getAnswers,
  getNumberOfAnswers: getNumberOfAnswers,
  getAnswer: getAnswer,
  getItem: getItem,
  getPrecision: getPrecision
};
