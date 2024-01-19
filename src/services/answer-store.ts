import Boomm, { Boom } from '@hapi/boom';
import PouchDB from 'pouchdb';

import { QuizElementType } from '@src/enums';
import type { DBOptions, StatisticView } from '@src/interfaces';
// import { quizDb } from '@src/helpers/db';

export class AnswerDatabase {
  private db: PouchDB.Database;

  constructor() {
    const options: DBOptions = {};
    if (process.env.COUCH_DB_USER && process.env.COUCH_DB_PASS) {
      options.auth = {
        username: process.env.COUCH_DB_USER,
        password: process.env.COUCH_DB_PASS,
      };
    }
    this.db = new PouchDB(process.env.COUCH_DB_URL_Q_QUIZ, options);
  }

  // TODO:
  // @ts-ignore
  async saveAnswer(doc) {
    return this.db
      .post(doc)
      .then((response) => {
        if (response.ok) {
          return response;
        } else {
          // TODO: set boom text error
          return new Boom();
        }
      })
      .catch(function (couchError) {
        console.warn(couchError);
        return Boomm.badRequest(couchError.message);
      });
  }

  async getAnswer(
    type: QuizElementType,
    questionId: string
  ): Promise<StatisticView[]> {
    return await this.db
      .query<StatisticView>(`stats/answers-${type}`, {
        startkey: [questionId],
        endkey: [questionId, {}],
        group: true,
      })
      .then((doc) => doc.rows)
      .then((rows) =>
        rows.map((row) => ({ key: row.key[1], value: row.value }))
      );
  }
}
