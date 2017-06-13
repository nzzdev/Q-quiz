const Joi = require('joi');
const Boom = require('boom');
const quizDb = require('../../resources/helpers/db.js').quizDb;

module.exports = [
  {
    method: 'POST',
    path: '/answer',
    config: {
      tags: ['api'],
      payload: {
        allow: ['application/json']
      },
      validate: {
        payload: {
          data: Joi.object().required(),
        }
      },
      cors: true,
      handler: function(request, reply) {
        var doc = request.payload;
        if (typeof request.payload !== 'object') {
          doc = JSON.parse(request.payload);
        }

        // we want some properties on every document that goes into user-store
        doc.created_at = new Date().toISOString();
        
        return quizDb.post(doc)
          .then(function(response) {
            if (response.ok) {
              return reply(response);
            } else {
              const error = Boom.create(response.status);
              error.reformat();
              return reply(error);
            }
          })
          .catch(function(couchError) {
            console.log(couchError);
            const error = Boom.badRequest(couchError.message);
            error.output.statusCode = couchError.status;
            error.reformat();
            return reply(error);
          })
      },
      /*plugins: {
        yaral: {
          buckets: ['maxPerIp']
        }
      }*/
    }
  }
]
