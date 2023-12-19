import schema from '../../resources/schema.json';
import type { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';

const schemaRoute: ServerRoute = {
  method: 'GET',
  path: '/schema.json',
  handler: function (request: Request, h: ResponseToolkit) {
    return h.response(schema);
  },
};

export default [schemaRoute];
