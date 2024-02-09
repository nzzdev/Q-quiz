import type { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import Boom from '@hapi/boom';

import { QuizElementType } from '@src/enums';
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
      if (type === QuizElementType.MapPointGuess) {
        return await database.getMapPointGuessAnswer(questionId);
      }
      return await database.getAnswer(type, questionId);
    } catch (error) {
      console.error(`error in stats route: ${error}`);
      return Boom.badRequest(error as Error);
    }
  },
};

export default route;
