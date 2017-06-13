const fs = require('fs');
const Enjoi = require('enjoi');
const Joi = require('joi');
const resourcesDir = __dirname + '/../../resources/';
const viewsDir = __dirname + '/../../views/';
const scriptsDir  = __dirname + '/../../scripts/';
const transform = require(resourcesDir + 'helpers/itemTransformer.js');

const schemaString = JSON.parse(fs.readFileSync(resourcesDir + 'schema.json', {
  encoding: 'utf-8'
}));

const schema = Enjoi(schemaString);

const hashMap = require(`${scriptsDir}hashMap.json`);

require('svelte/ssr/register');
const staticTemplate = require(viewsDir + 'HtmlJs.html');

module.exports = {
  method: 'POST',
  path: '/rendering-info/html-js',
  config: {
    validate: {
      options: {
        allowUnknown: true
      },
      payload: {
        item: schema,
        toolRuntimeConfig: Joi.object()
      }
    },
    cors: true
  },
  handler: function(request, reply) {

    let item = transform(request.payload.item);

    // get id of quiz item
    let id = item._id;
    if (!id && item.elements && item.elements.length > 0) {
      id = item.elements[0].id.split('-')[0] || (Math.random() * 10000).toFixed();
    }
    item._id = id;

    const quizContainerId = `q-quiz-${id}`;

    // prepare data for client side script
    const questionElementData = item.questions.map(element => {
        return {
          id: element.id,
          type: element.type,
          correctAnswer: element.answer,
          answerText: element.answerText,
          articleRecommendations: element.articleRecommendations
        }
      });

    // if isPure is set to true no side effects will be caused, in this 
    // special case no answers will get stored
    const isPure = request.payload.toolRuntimeConfig.isPure || false;

    let scriptData = {
      itemId: item._id,
      questionElementData: questionElementData,
      hasCover: item.hasCover,
      hasLastCard: item.hasLastCard,
      numberElements: item.elementCount,
      toolBaseUrl: request.payload.toolRuntimeConfig.toolBaseUrl,
      isPure: isPure
    }

    if (item.hasLastCard) {
      scriptData.lastCardData = {
        articleRecommendations: item.lastCard.articleRecommendations
      }
    }

    // elements are already split into cover, last card and questions
    // so we don't need it here anymore
    delete item.elements;

    const renderingData = {
      item: item,
      quizContainerId: quizContainerId
    }

    const systemConfigScript = `
      System.config({
        map: {
          "q-quiz/quiz.js": "${request.payload.toolRuntimeConfig.toolBaseUrl}/script/${hashMap['quiz.js']}"
        }
      });
    `;

    const loaderScript = `
      System.import('q-quiz/quiz.js')
        .then(function(module) {
          return module.display(${JSON.stringify(scriptData)}, document.querySelector('#${quizContainerId}'))
        })
        .catch(function(error) {
          console.log(error)
        });
    `;

    const renderingInfo = {
      loaderConfig: {
        polyfills: ['Promise', 'CustomEvent'],
        loadSystemJs: 'full'
      },
      stylesheets: [
        {
          name: 'default'
        }
      ], 
      scripts: [
        {
          content: systemConfigScript,
          loadOnce: true
        },
        {
          content: loaderScript
        },
        {
          url: 'https://storytelling.nzz.ch/track-manager/v0/track.js',
          loadOnce: true
        }
      ],
      markup: staticTemplate.render(renderingData)
    }
    return reply(renderingInfo);
  }
}
