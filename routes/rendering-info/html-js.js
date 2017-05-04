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
const staticTemplate = require(viewsDir + 'html-static.html');

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
    let renderingData = {
      item: request.payload.item
    }
		let data = {
			stylesheets: [
				{
					name: 'default'
				}
			], 
      scripts: [
        {
          name: `${hashMap['quiz.js']}`
        }
      ],
			markup: staticTemplate.render(renderingData)
		}
		return reply(data);
	}
}
