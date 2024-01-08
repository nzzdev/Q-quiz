import Ajv from 'ajv';
import Boom from '@hapi/boom';

import { readFileSync } from 'fs';
import schemaString from '../../../resources/schema.json';
import type { Request, ServerRoute } from '@hapi/hapi';
import type {
  DisplayOptions,
  QQuizSvelteProperties,
  QuizContext,
  QuizDoc,
  RenderingInfo,
  StyleHashMap,
  ToolRuntimeConfig,
  WebPayload,
} from '@src/interfaces';
// import { transform } from '@src/helpers/itemTransformer';
import getExactPixelWidth from '@src/helpers/toolRuntimeConfig';
import { getImageUrls } from '@src/helpers/images';
import { transform } from '@src/helpers/quizService';

// function getTransformedItemForClientSideScript(
//   item: QuizDoc,
//   toolRuntimeConfig: ToolRuntimeConfig
// ) {
//   const questionElementData = item.elements.map((element) => {
//     return {
//       id: element.id,
//       type: element.type,
//       correctAnswer: element.answer,
//       answerText: element.answerText,
//       articleRecommendations: element.articleRecommendations,
//     };
//   });

//   let scriptData = {
//     itemId: item._id,
//     questionElementData: questionElementData,
//     hasCover: item.hasCover,
//     hasLastCard: item.hasLastCard,
//     numberElements: item.elementCount,
//     toolBaseUrl: toolRuntimeConfig.toolBaseUrl,
//     isPure: toolRuntimeConfig.isPure || false,
//   };

//   if (item.lastCard) {
//     scriptData.lastCardData = {
//       articleRecommendations: item.lastCard.articleRecommendations,
//     };
//     scriptData.isFinalScoreShown = item.isFinalScoreShown;
//   }
//   return scriptData;
// }

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
      width,
    };

    // item.elements will be split into cover, last card and questions during transformation step
    // after that we don't need item.elements anymore
    // let item = transform(payload.item);
    // let toolRuntimeConfig = payload.toolRuntimeConfig;
    // TODO: find new solution for this
    // delete item.elements;
    // get id of quiz item out of query string
    // let id = request.query._id;
    // if (id === undefined && item.elements && item.elements.length > 0) {
    //   id =
    //     item.elements[0].id.split('-')[0] || (Math.random() * 10000).toFixed();
    // }
    // item._id = id;
    // const quizContainerId = `q-quiz-${id}`;

    // if (item.lastCard) {
    //   item.isFinalScoreShown = item.lastCard.isFinalScoreShown || false;
    // }

    // const scriptData = getTransformedItemForClientSideScript(
    //   item,
    //   toolRuntimeConfig
    // );

    // if (!process.env.ENRICO_PRODUCTS) {
    //   process.env.ENRICO_PRODUCTS = `[]`;
    // }

    // const clientEnv = {
    //   ENRICO_API_URL: process.env.ENRICO_API_URL,
    //   ENRICO_PRODUCTS: JSON.parse(process.env.ENRICO_PRODUCTS),
    //   MAP_STYLE_URL: process.env.MAP_STYLE_URL,
    //   MAP_ATTRIBUTION: process.env.MAP_ATTRIBUTION,
    // };

    // const loaderScript = `
    //   System.import('q-quiz/quiz.js')
    //     .then(function(module) {
    //       return module.display(${JSON.stringify(
    //         scriptData
    //       )}, document.querySelector('#${quizContainerId}'), ${JSON.stringify(
    //   clientEnv
    // )})
    //     })
    //     .catch(function(error) {
    //       console.log(error)
    //     });
    // `;

    // const context: QuizContext = {
    //   item: item,
    //   quizContainerId: quizContainerId,
    //   imageServiceUrl: process.env.IMAGE_SERVICE_URL || '',
    // };

    // if we have the width in toolRuntimeConfig.size
    // we can use it to set the resolution of the image
    // const exactPixelWidth = getExactPixelWidth(toolRuntimeConfig);

    // if (
    //   context.item &&
    //   context.item.elements &&
    //   Number.isInteger(exactPixelWidth)
    // ) {
    //   context.width = exactPixelWidth;
    //   context.item.elements.map((element) => {
    //     if (element.image && element.image.key) {
    //       element.image.urls = getImageUrls(
    //         element.image.key,
    //         context.width as number
    //       );
    //     }
    //   });
    // }

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
