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

    let systemConfigScript = `
        System.config({
          map: {
            "q-quiz/quiz.js": "${request.payload.toolRuntimeConfig.toolBaseUrl}/script/${hashMap['quiz.js']}"
          }
        });
    `;

    const item = request.payload.item;
    let id = item._id;
    if (!id && item.elements && item.elements.length > 0) {
      id = item.elements[0].id.split('-')[0] || (Math.random() * 10000).toFixed();
    }

    const quizContainerId = `q-quiz-${id}`;

    const coverElements = item.elements.filter(element => {
      return element.type === 'cover';
    });

    const lastCardElements = item.elements.filter(element => {
      return element.type === 'lastCard';
    });

    const questionElements = item.elements.filter(element => {
      return questionTypes.includes(element.type);
    })

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

    let saveAnswer = request.payload.toolRuntimeConfig.saveAnswer || false;
    
    let scriptData = {
      itemId: id,
      questionElementData: questionElementData,
      hasCover: coverElements.length > 0,
      hasLastCard: lastCardElements.length > 0,
      numberElements: item.elements.length,
      origin: 'http://localhost:3000',
      saveAnswer: saveAnswer
    }

    if (lastCardElements.length > 0) {
      scriptData.lastCardData = {
        articleRecommendations: lastCardElements[0].articleRecommendations
      }
    }

    let loaderScript = `
        System.import('q-quiz/quiz.js')
          .then(function(module) {
            return module.display(${JSON.stringify(scriptData)}, document.querySelector('#${quizContainerId}'))
          })
          .catch(function(error) {
            console.log(error)
          });
      `;

    let renderingData = {
      item: item,
      quizContainerId: quizContainerId
    }
    let renderingInfo = {
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
