const wreck = require("wreck");

const views = require("./views.js");
const answers = require("./answers.js");
const fixtureData = [
  require("../../resources/fixtures/data/all.json"),
  require("../../resources/fixtures/data/cover-with-title-no-last-card.json")
];

module.exports = {
  setupCouch: async function() {
    try {
      await wreck.put("http://localhost:5984/answer-store");
    } catch (err) {
      console.log("failed to create database answer-store", err);
      process.exit(1);
    }
    try {
      for (const view of views) {
        const viewsResponse = await wreck.post(
          "http://localhost:5984/answer-store",
          {
            payload: view
          }
        );
        console.log(`all ${views.length} views successfully saved`);
      }
    } catch (err) {
      console.log("failed to add views to answer-store", err);
      process.exit(1);
    }
    try {
      for (const answer of answers) {
        const createAnswerResponse = await wreck.post(
          "http://localhost:5984/answer-store",
          {
            payload: answer
          }
        );
      }
      console.log(`all ${answers.length} answers successfully saved`);
    } catch (err) {
      console.log("failed to add documents to answer-store", err);
      process.exit(1);
    }
    try {
      await wreck.put("http://localhost:5984/q-items");
      console.log("q items created");
    } catch (err) {
      console.log("failed to create database q-items", err);
      process.exit(1);
    }
    try {
      for (const quiz of fixtureData) {
        const createQuizResponse = await wreck.post(
          "http://localhost:5984/q-items",
          {
            payload: quiz
          }
        );
      }
      console.log(`all ${fixtureData.length} quizzes successfully saved`);
      return;
    } catch (err) {
      console.log("failed to add fixture quizzes to q-items", err);
      process.exit(1);
    }
  }
};
