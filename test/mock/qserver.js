const Hapi = require('hapi');
const Boom = require('boom');
const Joi = require('joi');
const PouchDB = require('pouchdb');

const server = Hapi.server({
  port: 9999,
  routes: {
    cors: true
  }
});

server.route({
  method: 'GET',
  path: '/item/{id}',
  options: {
    validate: {
      params: {
        id: Joi.string().required()
      }
    }
  },
  handler: async function(request, h) {
    const db = new PouchDB('http://localhost:5984/q-items');
    try {
      return await db.get(request.params.id);
    } catch (e) {
      return Boom.internal(e);
    }
  }
});

module.exports = {
  start: async function() {
    await server.start();
  }
}
