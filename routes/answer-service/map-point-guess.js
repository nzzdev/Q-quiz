'use strict';

var heatmap = require('sparseheatmap');
heatmap.FILTER = heatmap.FILTERS.LOWPASS;

const Joi = require('joi');
const Boom = require('boom');

const quizDb = require('../../resources/helpers/db.js').quizDb;

// red-ish heatmap, not used for now but keep for future use

// heatmap.COLORMAP = []; // Empty it out
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(255, 255, 255, 0));
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(132, 31, 20, 255));
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(172, 35, 24, 255));
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(212, 39, 27, 255));
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(234, 124, 50, 255));
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(243, 156, 82, 255));
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(252, 187, 113, 255));
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(253, 202, 139, 255));
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(254, 218, 165, 255));
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(254, 233, 191, 255));
// heatmap.COLORMAP = heatmap.COLORMAP.concat(heatmap.createColorMap(255, 248, 217, 255));

module.exports = [
  {
    method: 'GET',
    path: '/map/{questionId}/heatmap/{width}/{height}/{bbox}',
    options: {
      tags: ['api'],
      validate: {
        params: {
          questionId: Joi.string().required(),
          width: Joi.number().required(),
          height: Joi.number().required(),
          bbox: Joi.string().required(),
        }
      }
    },
    handler: async function(request, h) {
      var data = [];
      try {
        const points = await quizDb.query('mapPointGuess/points', { 'reduce': false, 'keys': [request.params.questionId] })
          .then(answers => {
            if (answers && answers.rows && answers.rows.length) {
              return answers.rows.map(answer => answer.value);
            }
            throw('invalid answer');
          })
          .then(userPoints => {
            let points = [];
            let bbox = request.params.bbox.split(',').map(val => parseFloat(val));
            for (var i = 0; i < userPoints.length; i++) {
              let lat = parseFloat(userPoints[i].lat)
              let lng = parseFloat(userPoints[i].lng)
  
              let lngExtent = bbox[2] - bbox[0];
              let fromLeft = lng - bbox[0];
  
              let latExtent = bbox[3] - bbox[1];
              let fromTop = bbox[3] - lat;
  
              let x = request.params.width * fromLeft / lngExtent;
  
              let mapLatBottomDegree = bbox[1] * Math.PI / 180;
              let d = Math.PI / 180;
              let mapWidth = ((request.params.width / lngExtent) * 360) / (2 * Math.PI);
              let mapOffsetY = (mapWidth / 2 * Math.log((1 + Math.sin(mapLatBottomDegree)) / (1 - Math.sin(mapLatBottomDegree))));
              let y = request.params.height - ((mapWidth / 2 * Math.log((1 + Math.sin(lat * d)) / (1 - Math.sin(lat * d)))) - mapOffsetY);
  
              points = points.concat([1,x,y]);
            }
            return points;
          });
        data.push(new heatmap.SparseArray(heatmap.LAYOUTS.CENTERFIXEDWIDTH, request.params.width, request.params.height, points));
        
        let heatmapStream = await Promise.resolve(new Promise(resolve => {
          new heatmap(request.params.width, request.params.height, request.params.width, heatmap.LAYOUTS.CENTERFIXEDWIDTH, data, heatmap.BLOBTYPE.SMALL, function(heatmapStream) {
            resolve(heatmapStream);
          })
        }));
        return h.response(heatmapStream).type('image/png');
      } catch (e) {
        return Boom.badRequest(e)
      }
    }
  }
]
