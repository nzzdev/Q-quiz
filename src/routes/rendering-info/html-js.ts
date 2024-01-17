import Ajv from 'ajv';
import Boom from '@hapi/boom';
import type { Request, ServerRoute } from '@hapi/hapi';
import { readFileSync } from 'fs';

import schemaString from '../../../resources/schema.json';
import type {
  DisplayOptions,
  QQuizSvelteProperties,
  RenderingInfo,
  StyleHashMap,
  WebPayload,
} from '@src/interfaces';
import getExactPixelWidth from '@src/helpers/toolRuntimeConfig';
import { transform } from '@src/helpers/quizService';

const ajv = new Ajv({
  strict: false,
});
const validate = ajv.compile(schemaString);

const route: ServerRoute = {
  method: 'POST',
  path: '/rendering-info/html-js',
  options: {
    validate: {
      options: {
        allowUnknown: true,
      },
      payload: (payload) => {
        const payloadTyped = payload as WebPayload;
        const item = payloadTyped.item;
        const toolRuntimeConfig = payloadTyped.toolRuntimeConfig;

        if (
          typeof payloadTyped !== 'object' ||
          typeof item !== 'object' ||
          typeof toolRuntimeConfig !== 'object'
        ) {
          throw Boom.badRequest(
            'The given payload for this route is not correct.'
          );
        }

        if (validate(item)) {
          return new Promise((resolve) => {
            resolve(item);
          });
        } else {
          throw Boom.badRequest(JSON.stringify(validate.errors));
        }
      },
    },
  },
  handler: function (request: Request) {
    const id = createId(request);
    let qQuizCompiledScript = '';
    let styleHashMap: StyleHashMap | null = null;

    try {
      qQuizCompiledScript = readFileSync('dist/Q-Quiz.js', {
        encoding: 'utf-8',
      });
    } catch (e) {
      console.warn('Failed reading compiled Q-Table code - ', e);
    }

    try {
      const rawString = readFileSync('dist/styles/hashMap.json', {
        encoding: 'utf-8',
      });

      styleHashMap = JSON.parse(rawString) as StyleHashMap;
    } catch (e) {
      console.warn('Failed reading compiled style hashmap - ', e);
    }

    const payload = request.orig.payload as WebPayload;

    // Extract quiz configurations.
    const config = payload.item;

    const toolRuntimeConfig = payload.toolRuntimeConfig || {};
    const displayOptions =
      toolRuntimeConfig.displayOptions || ({} as DisplayOptions);
    const options = config.options;
    const width = getExactPixelWidth(toolRuntimeConfig);

    const props: QQuizSvelteProperties = {
      item: transform(config), // To make renderingInfoScripts working. refactor later.
      config,
      displayOptions: displayOptions,
      noInteraction: payload.toolRuntimeConfig.noInteraction || false,
      id,
      imageServiceUrl: process.env.IMAGE_SERVICE_URL || '',
      mapConfigurtaion: {
        styleUrl: process.env.MAP_STYLE_URL || '',
        attribution: process.env.MAP_ATTRIBUTION || '',
      },
      enrico: {
        products: JSON.parse(process.env.ENRICO_PRODUCTS || ''),
        url: process.env.ENRICO_API_URL || '',
      },
      toolBaseUrl: toolRuntimeConfig.toolBaseUrl,
    };

    const renderingInfo: RenderingInfo = {
      polyfills: ['Promise', 'CustomEvent', 'NodeList.prototype.forEach'],
      stylesheets: [],
      scripts: [
        {
          content: qQuizCompiledScript,
        },
        {
          content: `
          (function () {
            var target = document.querySelector('#${id}_container');
            target.innerHTML = "";
            var props = ${JSON.stringify(props)};
            new window.q_quiz  ({
              "target": target,
              "props": {
                componentConfiguration: props
              }
            })
          })();`,
        },
      ],
      markup: `<div id="${id}_container" class="q-quiz-container"></div>`,
    };

    if (styleHashMap !== null) {
      renderingInfo.stylesheets.push({
        name: styleHashMap['q-quiz'],
      });
    }

    return renderingInfo;
  },
};

function createId(request: Request): string {
  return `q_quiz_${request.query._id}_${Math.floor(
    Math.random() * 100000
  )}`.replace(/-/g, '');
}

export default route;
