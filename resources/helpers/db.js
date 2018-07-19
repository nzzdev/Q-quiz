const PouchDB = require("pouchdb");

const options = {};
if (process.env.COUCH_DB_USER && process.env.COUCH_DB_PASS) {
  options.auth = {
    username: process.env.COUCH_DB_USER,
    password: process.env.COUCH_DB_PASS
  };
}

const quizDb = new PouchDB(process.env.COUCH_DB_URL_Q_QUIZ, options);

console.log(`connected to ${process.env.COUCH_DB_URL_Q_QUIZ}`);

module.exports = {
  quizDb: quizDb
};
