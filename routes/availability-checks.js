const Boom = require("boom");
const Joi = require("joi");

function hasImage(item) {
  return item.elements.some(element => element.image && element.image.key);
}

module.exports = {
  method: "POST",
  path: "/availability-checks/{propertyName}",
  options: {
    validate: {
      payload: Joi.object()
    },
    cors: true
  },
  handler: function(request, h) {
    if (request.params.propertyName === "credit") {
      return {
        available: hasImage(request.payload)
      };
    }

    return Boom.badRequest();
  }
};
