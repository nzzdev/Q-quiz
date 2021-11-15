const Hapi = require("@hapi/hapi");
const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");

// provide every fixture data file present in ../../resources/fixtures/data
const fixtureDataDirectory = "../../resources/fixtures/data";
const fixtureData = [
  require(`${fixtureDataDirectory}/all.json`),
  require(`${fixtureDataDirectory}/cover-with-title-no-last-card.json`)
];

const server = Hapi.server({
  port: 9999,
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
