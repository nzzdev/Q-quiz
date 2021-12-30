const Boom = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");

const viewsDir = path.join(__dirname, "/../../views/");
const stylesDir = path.join(__dirname, "/../../styles/");
const scriptsDir = path.join(__dirname, "/../../scripts/");
const resourcesDir = path.join(__dirname, "/../../resources/");

require("svelte/register");
const staticTemplate = require(path.join(viewsDir, "/App.svelte")).default;
const styles = fs.readFileSync(path.join(stylesDir, "/default.css")).toString();
const styleHashMap = require(path.join(stylesDir, "/hashMap.json"));
const scriptHashMap = require(path.join(scriptsDir, "/hashMap.json"));
const transform = require(path.join(
  resourcesDir,
  "/helpers/itemTransformer.js"
));
const getExactPixelWidth = require(path.join(
  resourcesDir,
  "/helpers/toolRuntimeConfig.js"
)).getExactPixelWidth;
const getImageUrls = require(path.join(
  resourcesDir,
  "/helpers/images.js"
)).getImageUrls;

// POSTed item will be validated against given schema
// hence we fetch the JSON schema...
const schemaString = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../resources/", "schema.json"), {
    encoding: "utf-8",
  })
);

const ajv = new Ajv({ strict: false });
const validate = ajv.compile(schemaString);

function validateAgainstSchema(item, options) {
  if (validate(item)) {
    return item;
  } else {
    throw Boom.badRequest(JSON.stringify(validate.errors));
  }
}

async function validatePayload(payload, options, next) {
  if (typeof payload !== "object") {
    return next(Boom.badRequest(), payload);
  }
  if (typeof payload.item !== "object") {
    return next(Boom.badRequest(), payload);
  }
  if (typeof payload.toolRuntimeConfig !== "object") {
    return next(Boom.badRequest(), payload);
  }
  await validateAgainstSchema(payload.item, options);
}

function getTransformedItemForClientSideScript(item, toolRuntimeConfig) {
  const questionElementData = item.questions.map((element) => {
    return {
      id: element.id,
      type: element.type,
      correctAnswer: element.answer,
      answerText: element.answerText,
      articleRecommendations: element.articleRecommendations,
    };
  });

  let scriptData = {
    itemId: item._id,
    questionElementData: questionElementData,
    hasCover: item.hasCover,
    hasLastCard: item.hasLastCard,
    numberElements: item.elementCount,
    toolBaseUrl: toolRuntimeConfig.toolBaseUrl,
    isPure: toolRuntimeConfig.isPure || false,
  };

  if (item.lastCard) {
    scriptData.lastCardData = {
      articleRecommendations: item.lastCard.articleRecommendations,
    };
    scriptData.isFinalScoreShown = item.isFinalScoreShown;
  }
  return scriptData;
}

module.exports = {
  method: "POST",
  path: "/rendering-info/web",
  options: {
    validate: {
      options: {
        allowUnknown: true,
      },
      payload: validatePayload,
    },
    cache: false, // TODO: Check if still needed after build process update
  },
  handler: async function (request, h) {
    const toolRuntimeConfig = request.payload.toolRuntimeConfig;
    // item.elements will be split into cover, last card and questions during transformation step
    // after that we don't need item.elements anymore
    let item = transform(request.payload.item);
    delete item.elements;
    // get id of quiz item out of query string
    let id = request.query._id;
    if (id === undefined && item.elements && item.elements.length > 0) {
      id =
        item.elements[0].id.split("-")[0] || (Math.random() * 10000).toFixed();
    }
    item._id = id;

    if (item.lastCard) {
      item.isFinalScoreShown = item.lastCard.isFinalScoreShown || false;
    }

    const context = {
      id: `q-quiz-${toolRuntimeConfig.requestId}`,
      item: item,
      imageServiceUrl: process.env.IMAGE_SERVICE_URL,
    };

    // if we have the width in toolRuntimeConfig.size
    // we can use it to set the resolution of the image
    const exactPixelWidth = getExactPixelWidth(
      request.payload.toolRuntimeConfig
    );

    if (Number.isInteger(exactPixelWidth)) {
      context.width = exactPixelWidth;
      context.item.questions.map((question) => {
        if (question.image && question.image.key) {
          question.image.urls = getImageUrls(
            question.image.key,
            context.width,
            context.imageServiceUrl
          );
        }
      });
    }

    const staticTemplateRender = staticTemplate.render(context);

    const renderingInfo = {
      loaderConfig: {
        polyfills: ["Promise", "CustomEvent", "NodeList.prototype.forEach"],
        loadSystemJs: "full",
      },
      stylesheets: [{ content: styles }, { name: styleHashMap["default"] }],
      scripts: [
        { name: scriptHashMap["default"] },
        {
          content: `
          (function () {
            var target = document.querySelector('#${context.id}_container');
            target.innerHTML = "";
            var props = ${JSON.stringify(context)};
            new window._q_quiz.Quiz({
              "target": target,
              "props": props
            })
          })();`,
        },
      ],
      markup: staticTemplateRender.html,
    };

    return renderingInfo;
  },
};
