const Joi = require('joi');
const Boom = require('boom');
const quizDb = require('../../resources/helpers/db.js').quizDb;

module.exports = [
  {
    method: 'POST',
    path: '/answer',
    options: {
      tags: ['api'],
      payload: {
        allow: ['application/json']
      },
      validate: {
        payload: {
          data: Joi.object().required(),
        }
      },
      cors: true
    },
    handler: function(request, h) {
      var doc = request.payload;
      if (typeof request.payload !== 'object') {
        doc = JSON.parse(request.payload);
      }

      // we want some properties on every document that goes into user-store
      doc.created_at = new Date().toISOString();
      
      return quizDb.post(doc)
        .then(function(response) {
          if (response.ok) {
            return response;
          } else {
            return new Boom(response.status);
          }
        })
        .catch(function(couchError) {
          console.log(couchError);
          return Boom.badRequest(couchError.message);
        })
    },
    /* plugins: {
      yaral: {
        buckets: ['maxPerIp']
      }
    } */
  }
]
