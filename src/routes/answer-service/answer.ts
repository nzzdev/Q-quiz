import type { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import Boom from '@hapi/boom';
import Joi from 'joi';
import { AnswerDatabase } from '@src/services/answer-store';

const route: ServerRoute = {
  method: 'POST',
  path: '/answer',
  options: {
    cors: true, // Enable CORS for this route
    tags: ['api'],
    payload: {
      allow: ['application/json'],
    },
    validate: {
      payload: {
        data: Joi.object().required(),
      },
    },
  },
  handler: function (request: Request, h: ResponseToolkit) {
    var doc = request.payload;
    if (typeof request.payload !== 'object') {
      doc = JSON.parse(request.payload);
    }

    // we want some properties on every document that goes into user-store
    // TODO
    // @ts-ignore
    doc.created_at = new Date().toISOString();

    const database = new AnswerDatabase();
    return database.saveAnswer(doc);
  },
};

export default route;
