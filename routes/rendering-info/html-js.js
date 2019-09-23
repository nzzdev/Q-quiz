const fs = require("fs");
const Enjoi = require("enjoi");
const Joi = require("@hapi/joi");
const resourcesDir = `${__dirname}/../../resources/`;
const viewsDir = `${__dirname}/../../views/`;
const scriptsDir = `${__dirname}/../../scripts/`;
const stylesDir = `${__dirname}/../../styles/`;
const transform = require(`${resourcesDir}helpers/itemTransformer.js`);
const getExactPixelWidth = require(resourcesDir +
  "helpers/toolRuntimeConfig.js").getExactPixelWidth;
const getImageUrls = require(`${resourcesDir}helpers/images.js`).getImageUrls;

const schemaString = JSON.parse(
  fs.readFileSync(`${resourcesDir}schema.json`, {
    encoding: "utf-8"
  })
);

const schema = Enjoi.schema(schemaString).required();

const scriptHashMap = require(`${scriptsDir}/hashMap.json`);
const styleHashMap = require(`${stylesDir}/hashMap.json`);

require("svelte/ssr/register");
const staticTemplate = require(`${viewsDir}HtmlJs.html`);

function getTransformedItemForClientSideScript(item, toolRuntimeConfig) {
  const questionElementData = item.questions.map(element => {
    return {
      id: element.id,
      type: element.type,
      correctAnswer: element.answer,
      answerText: element.answerText,
      articleRecommendations: element.articleRecommendations
    };
  });

  let scriptData = {
    itemId: item._id,
    questionElementData: questionElementData,
    hasCover: item.hasCover,
    hasLastCard: item.hasLastCard,
    numberElements: item.elementCount,
    toolBaseUrl: toolRuntimeConfig.toolBaseUrl,
    isPure: toolRuntimeConfig.isPure || false
  };

  if (item.lastCard) {
    scriptData.lastCardData = {
      articleRecommendations: item.lastCard.articleRecommendations
    };
    scriptData.isFinalScoreShown = item.isFinalScoreShown;
  }
  return scriptData;
}

module.exports = {
  method: "POST",
  path: "/rendering-info/html-js",
  options: {
    validate: {
      options: {
        allowUnknown: true
      },
      payload: {
        item: schema,
        toolRuntimeConfig: Joi.object({
          toolBaseUrl: Joi.string().required()
        }).required()
      }
    },
    cache: false,
    cors: true
  },
  handler: function(request, h) {
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
    const quizContainerId = `q-quiz-${id}`;

    if (item.lastCard) {
      item.isFinalScoreShown = item.lastCard.isFinalScoreShown || false;
    }

    const systemConfigScript = `
      System.config({
        map: {
          "q-quiz/quiz.js": "${
            request.payload.toolRuntimeConfig.toolBaseUrl
          }/script/${scriptHashMap["quiz"]}"
        }
      });
    `;

    const scriptData = getTransformedItemForClientSideScript(
      item,
      request.payload.toolRuntimeConfig
    );

    if (!process.env.ENRICO_PRODUCTS) {
      process.env.ENRICO_PRODUCTS = `[]`;
    }

    const clientEnv = {
      ENRICO_API_URL: process.env.ENRICO_API_URL,
      ENRICO_PRODUCTS: JSON.parse(process.env.ENRICO_PRODUCTS),
      MAP_STYLE_URL: process.env.MAP_STYLE_URL,
      MAP_ATTRIBUTION: process.env.MAP_ATTRIBUTION
    };

    const loaderScript = `
      System.import('q-quiz/quiz.js')
        .then(function(module) {
          return module.display(${JSON.stringify(
            scriptData
          )}, document.querySelector('#${quizContainerId}'), ${JSON.stringify(
      clientEnv
    )})
        })
        .catch(function(error) {
          console.log(error)
        });
    `;

    const context = {
      item: item,
      quizContainerId: quizContainerId,
      imageServiceUrl: process.env.IMAGE_SERVICE_URL
    };

    // if we have the width in toolRuntimeConfig.size
    // we can use it to set the resolution of the image
    const exactPixelWidth = getExactPixelWidth(
      request.payload.toolRuntimeConfig
    );

    if (Number.isInteger(exactPixelWidth)) {
      context.width = exactPixelWidth;
      context.item.questions.map(question => {
        if (question.image && question.image.key) {
          question.image.urls = getImageUrls(
            question.image.key,
            context.width,
            context.imageServiceUrl
          );
        }
      });
    }

    const renderingInfo = {
      loaderConfig: {
        polyfills: ["Promise", "CustomEvent"],
        loadSystemJs: "full"
      },
      stylesheets: [
        {
          name: styleHashMap["default"]
        }
      ],
      scripts: [
        {
          content: systemConfigScript,
          loadOnce: true
        },
        {
          content: loaderScript
        }
      ],
      markup: staticTemplate.render(context).html
    };
    return renderingInfo;
  }
};
