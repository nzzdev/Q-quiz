const PouchDB = require('pouchdb');

const quizDb = new PouchDB(process.env.COUCH_DB_URL_Q_QUIZ, {
  auth: {
    username: process.env.COUCH_DB_USER,
    password: process.env.COUCH_DB_PASS
  }
});

const itemDb = new PouchDB(process.env.COUCH_DB_URL_Q_ITEMS);

console.log('connected to ' + process.env.COUCH_DB_URL_Q_QUIZ);

module.exports = {
  quizDb: quizDb,
  itemDb: itemDb
}
