const fs = require('fs');
const Enjoi = require('enjoi');
const Joi = require('joi');
const resourcesDir = __dirname + '/../../resources/';
const viewsDir = __dirname + '/../../views/';
const scriptsDir  = __dirname + '/../../scripts/';

const schemaString = JSON.parse(fs.readFileSync(resourcesDir + 'schema.json', {
	encoding: 'utf-8'
}));

const schema = Enjoi(schemaString);

const hashMap = require(`${scriptsDir}/hashMap.json`);

const questionTypes = ['multipleChoice', 'numberGuess', 'mapPointGuess'];

require('svelte/ssr/register');
const staticTemplate = require(viewsDir + 'html-js.html');

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

    let item = request.payload.item;

    // get id of quiz item
    let id = item._id;
    if (!id && item.elements && item.elements.length > 0) {
      id = item.elements[0].id.split('-')[0] || (Math.random() * 10000).toFixed();
    }

    const quizContainerId = `q-quiz-${id}`;

    // extract only one of the possibly existing cover elements, undefined otherwise
    const coverElement = item.elements.filter(element => {
      return element.type === 'cover';
    })[0];

    const hasCover = coverElement !== undefined;

    // extract only one of the possibly existing last card elements, undefined otherwise
    const lastCardElement = item.elements.filter(element => {
      return element.type === 'lastCard';
    })[0];

    const hasLastCard = lastCardElement !== undefined;
    
    // extract question elements
    const questionElements = item.elements.filter(element => {
      return questionTypes.includes(element.type);
    })

    // prepare data for client side script
    const questionElementData = questionElements.map(element => {
        let data = {
          id: element.id,
          type: element.type,
          correctAnswer: element.answer,
          answerText: element.answerText,
          articleRecommendations: element.articleRecommendations
        }
        if (element.type === 'mapPointGuess') {
          data.bbox = element.bbox,
          data.pointLabel = element.pointLabel
        }
        return data;
      });

    // if isPure is set to true no side effects will be caused, in this 
    // special case no answers will get stored
    const isPure = request.payload.toolRuntimeConfig.isPure || false;

    let scriptData = {
      itemId: id,
      questionElementData: questionElementData,
      hasCover: hasCover,
      hasLastCard: hasLastCard,
      toolBaseUrl: request.payload.toolRuntimeConfig.toolBaseUrl,
      isPure: isPure
    }

    let numberElements = questionElements.length;
    if (hasCover) {
      numberElements++;
    }

    if (hasLastCard) {
      numberElements++;
      scriptData.lastCardData = {
        articleRecommendations: lastCardElement.articleRecommendations
      }
    }

    scriptData.numberElements = numberElements;

    // prepare data for server side rendering
    item.questions = questionElements;
    item.cover = coverElement;
    item.lastCard = lastCardElement;
    item.hasCover = hasCover;
    item.hasLastCard = hasLastCard;
    item.elementCount = numberElements;
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
        polyfills: ['Promise'],
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
        }
      ],
			markup: staticTemplate.render(renderingData)
		}
		return reply(renderingInfo);
	}
}
