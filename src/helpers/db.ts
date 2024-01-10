import PouchDB from 'pouchdb';

import type { DBOptions } from '@src/interfaces';

const options: DBOptions = {};
if (process.env.COUCH_DB_USER && process.env.COUCH_DB_PASS) {
  options.auth = {
    username: process.env.COUCH_DB_USER,
    password: process.env.COUCH_DB_PASS,
  };
}

export const quizDb = new PouchDB(process.env.COUCH_DB_URL_Q_QUIZ, options);
