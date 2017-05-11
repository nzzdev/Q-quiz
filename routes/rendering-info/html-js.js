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

    const id = request.payload.item._id || (Math.random() * 10000).toFixed();
    const quizContainerId = `q-quiz-${id}`;

    const item = request.payload.item;
    const coverElements = item.elements.filter(element => {
      return element.type === 'cover';
    });

    const lastCardElements = item.elements.filter(element => {
      return element.type === 'lastCard';
    });

    const questionElements = item.elements.filter(element => {
      return coverElements.indexOf(element) === -1 && lastCardElements.indexOf(element) === -1;
    });

    const correctAnswers = questionElements.map(element => {
        return {
          id: element.id,
          type: element.type,
          answer: element.answer,
          answerText: element.answerText
        }
      });

    let data = {
      correctAnswers: correctAnswers,
      hasCover: coverElements.length > 0,
      hasLastCard: lastCardElements.length > 0,
      numberElements: item.elements.length,
      numberQuestions: questionElements.length
    }

    let loaderScript = `
        System.import('q-quiz/quiz.js')
          .then(function(module) {
            return module.display(${JSON.stringify(data)}, document.querySelector('#${quizContainerId}'))
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
