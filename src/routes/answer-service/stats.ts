import type { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import Boom from '@hapi/boom';

import type { QuizElementType } from '@src/enums';
import { AnswerDatabase } from '@src/services/answer-store';

const route: ServerRoute = {
  method: 'GET',
  path: '/answers/{type}/{questionId}',
  options: {
    tags: ['api'],
  },
  handler: async function (request: Request, h: ResponseToolkit) {
    try {
      const type = request.params.type as QuizElementType;
      const questionId = request.params.questionId;
      const database = new AnswerDatabase();
      return await database.getAnswer(type, questionId);
    } catch (e) {
      console.log(`error in stats route: ${e}`);
      // TODO:
      // @ts-ignore
      return Boom.badRequest(e);
    }
  },
};

export default route;
