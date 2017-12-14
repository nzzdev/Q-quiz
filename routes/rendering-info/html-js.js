const fs = require('fs');
const Enjoi = require('enjoi');
const Joi = require('joi');
const resourcesDir = __dirname + '/../../resources/';
const viewsDir = __dirname + '/../../views/';
const scriptsDir  = __dirname + '/../../scripts/';
const stylesDir  = __dirname + '/../../styles/';
const transform = require(resourcesDir + 'helpers/itemTransformer.js');

const schemaString = JSON.parse(fs.readFileSync(resourcesDir + 'schema.json', {
  encoding: 'utf-8'
}));

const schema = Enjoi(schemaString);

const scriptHashMap = require(`${scriptsDir}/hashMap.json`);
const styleHashMap = require(`${stylesDir}/hashMap.json`);

require('svelte/ssr/register');
const staticTemplate = require(viewsDir + 'HtmlJs.html');

function transformItemForClientSideScript(item, toolRuntimeConfig) {
  const questionElementData = item.questions.map(element => {
    return {
      id: element.id,
      type: element.type,
      correctAnswer: element.answer,
      answerText: element.answerText,
      articleRecommendations: element.articleRecommendations
    }
  });

  let scriptData = {
    itemId: item._id,
    questionElementData: questionElementData,
    hasCover: item.hasCover,
    hasLastCard: item.hasLastCard,
    numberElements: item.elementCount,
    toolBaseUrl: toolRuntimeConfig.toolBaseUrl,
    isPure: toolRuntimeConfig.isPure || false
  }

  if (item.lastCard) {
    scriptData.lastCardData = {
      articleRecommendations: item.lastCard.articleRecommendations,
    }
    scriptData.isFinalScoreShown = item.isFinalScoreShown;
  }
  return scriptData;
}

module.exports = {
  method: 'POST',
  path: '/rendering-info/html-js',
  options: {
    validate: {
      options: {
        allowUnknown: true
      },
      payload: {
        item: schema,
        toolRuntimeConfig: Joi.object()
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

    // get id of quiz item
    let id = item._id;
    if (!id && item.elements && item.elements.length > 0) {
      id = item.elements[0].id.split('-')[0] || (Math.random() * 10000).toFixed();
    }
    item._id = id;
    const quizContainerId = `q-quiz-${id}`;

    if (item.lastCard) {
      item.isFinalScoreShown = item.lastCard.isFinalScoreShown || false;
    }
    
    const systemConfigScript = `
      System.config({
        map: {
          "q-quiz/quiz.js": "${request.payload.toolRuntimeConfig.toolBaseUrl}/script/${scriptHashMap['quiz']}"
        }
      });
    `;

    const scriptData = transformItemForClientSideScript(item, request.payload.toolRuntimeConfig);
    const loaderScript = `
      System.import('q-quiz/quiz.js')
        .then(function(module) {
          return module.display(${JSON.stringify(scriptData)}, document.querySelector('#${quizContainerId}'))
        })
        .catch(function(error) {
          console.log(error)
        });
    `;

    const renderingData = {
      item: item,
      quizContainerId: quizContainerId
    }

    const renderingInfo = {
      loaderConfig: {
        polyfills: ['Promise', 'CustomEvent'],
        loadSystemJs: 'full'
      },
      stylesheets: [
        {
          name: styleHashMap['default']
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
      markup: staticTemplate.render(renderingData)
    }
    return renderingInfo;
  }
}
