const Hapi = require("hapi");
const Boom = require("boom");
const Joi = require("joi");

// provide every fixture data file present in ../../resources/fixtures/data
const fixtureDataDirectory = "../../resources/fixtures/data";
const fixtureData = [
  require(`${fixtureDataDirectory}/all.json`),
  require(`${fixtureDataDirectory}/cover-with-title-no-last-card.json`)
];

const server = Hapi.server({
  port: 9999,
  routes: {
    cors: true
  }
});

server.route({
  method: "GET",
  path: "/item/{id}",
  options: {
    validate: {
      params: {
        id: Joi.string().required()
      }
    }
  },
  handler: async function(request, h) {
    try {
      return fixtureData[request.params.id];
    } catch (e) {
      return Boom.internal(e);
    }
  }
});

module.exports = {
  start: async function() {
    await server.start();
  }
};
