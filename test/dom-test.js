const JsDom = require('jsdom');
const expect = require('chai').expect;

const transform = require('../resources/helpers/itemTransformer.js');
let mockData = require('./resources/mock-data');
mockData = transform(mockData);
require('svelte/ssr/register');
const staticTpl = require('../views/html-js.html');

const quizId = (Math.random() * 10000).toFixed();
var markup = staticTpl.render(JSON.parse(JSON.stringify({item: mockData, quizContainerId: `q-quiz-${quizId}`})));


function element(selector) {
  return new Promise((resolve, reject) => {
    JsDom.env(
      markup,
      (err, window) => {
        resolve(window.document.querySelector(selector));
      })
  })
}

function elementCount(selector) {
  return new Promise((resolve, reject) => {
    JsDom.env(
      markup,
      (err, window) => {
        resolve(window.document.querySelectorAll(selector).length);
      })
  })
}

// some basic dom tests with mock data
describe('Q quiz dom tests', function() {

  // Header elements
  // Question element (input/result/answer button)

  /*it('should pass if sum of values is found', function() {
    return elementCount('div.renderer-sum').then(value => {
        expect(value).to.be.equal(1);
    })
  })

  it('should pass if for each sample data entry a DOM element is created', function() {
    return elementCount('div.renderer-data-entry').then(value => {
      expect(value).to.be.equal(mockData.sampleData.length);
    })
  })*/
})

