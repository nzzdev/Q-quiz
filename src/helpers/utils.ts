import fetch from 'node-fetch';

import { quizDb } from './db';
import type {
  AnswerNumberOption,
  AnswerQueryOptions,
  QQuizConfig,
} from '@src/interfaces';

export function getAnswers(
  type: string,
  questionId: number,
  options: AnswerQueryOptions
) {
  if (typeof options === 'undefined') {
    options = {};
  }
  if (
    type === 'numberGuess' ||
    type === 'numberPoll' ||
    type === 'mapPointGuess' ||
    type === 'multipleChoice'
  ) {
    options['start_key'] = [questionId];
    options['end_key'] = [questionId, {}];
    options['group'] = true;
  }

  return quizDb.query(`stats/answers-${type}`, options);
}

export async function getAnswer(id: string) {
  return await quizDb.get<QQuizConfig>(id).then((answer) => {
    return answer.data;
  });
}

export async function getItem(itemId: string) {
  return await fetch(`${process.env.COUCH_DB_URL_Q_ITEMS}/${itemId}`)
    .then(async (response) => {
      if (response.ok && response.status < 400) {
        return (await response.json()) as QQuizConfig;
      }
      // TODO: check
      throw new Error(response.statusText);
    })
    .then((item: QQuizConfig) => {
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
              type: item.type,
            },
            item.data
          )
        );

        delete item.type;
        item.data = {
          elements: elements,
        };
      }
      return item;
    });
}

export async function getNumberOfAnswers(
  questionId: string,
  options: AnswerNumberOption
) {
  if (typeof options === 'undefined') {
    options = {};
  }
  options['key'] = questionId;
  options['reduce'] = true;

  return await quizDb.query('docs/byQuestionId', options).then((data) => {
    return data.rows[0].value;
  });
}

export function getPrecision(value: number) {
  // TODO: check magic number
  let magicNumber = 1;
  while (Math.round(value * magicNumber) / magicNumber !== value)
    magicNumber *= 10;
  return Math.round(Math.log(magicNumber) / Math.LN10);
}
