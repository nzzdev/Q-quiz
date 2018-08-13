module.exports = [
  {
    _id: "_design/stats",
    views: {
      "answers-numberGuess": {
        map:
          "function (doc) {\n  if (doc.data && doc.data.type === 'numberGuess' && typeof doc.data.value !== 'undefined') {\n    var questionId;\n    if (doc.data.questionId) {\n      questionId = doc.data.questionId;\n    } else if (doc.data.itemId) {\n      questionId = doc.data.itemId;\n    }\n    if (questionId) {\n      emit([questionId, doc.data.value], 1);\n    }\n  }\n}",
        reduce: "_count"
      },
      "answers-mapPointGuess": {
        map:
          "function (doc) {\n  if (doc.data && doc.data.type === 'mapPointGuess' && typeof doc.data.value !== 'undefined') {\n    var questionId;\n    if (doc.data.questionId) {\n      questionId = doc.data.questionId;\n    } else if (doc.data.itemId) {\n      questionId = doc.data.itemId;\n    }\n    if (questionId) {\n      emit([questionId, doc.data.value.distance], 1);\n    }\n  }\n}",
        reduce: "_count"
      },
      "answers-multipleChoice": {
        reduce: "_count",
        map:
          "function (doc) {\n  if (doc.data && doc.data.type === 'multipleChoice' && typeof doc.data.value !== 'undefined') {\n    var questionId;\n    if (doc.data.questionId) {\n      questionId = doc.data.questionId;\n    } else if (doc.data.itemId) {\n      questionId = doc.data.itemId;\n    }\n    if (questionId) {\n      emit([questionId, doc.data.value], 1);\n    }\n  }\n}"
      }
    },
    language: "javascript"
  },
  {
    _id: "_design/mapPointGuess",
    views: {
      points: {
        map:
          "function (doc) {\n  if (doc.data && doc.data.type === 'mapPointGuess' && typeof doc.data.value.latLng !== 'undefined') {\n    var questionId;\n    if (doc.data.questionId) {\n      questionId = doc.data.questionId;\n    } else if (doc.data.itemId) {\n      questionId = doc.data.itemId;\n    }\n    if (questionId) {\n      emit(questionId, doc.data.value.latLng);\n    }\n  }\n}"
      }
    },
    language: "javascript"
  }
];
