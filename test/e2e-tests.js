const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const Boom = require('boom');
const lab = exports.lab = Lab.script();
const PouchDb = require('pouchdb');

const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const it = lab.it;

process.env.COUCH_DB_URL_Q_QUIZ = 'http://localhost:5984/answer-store';
process.env.COUCH_DB_URL_Q_ITEMS = 'http://localhost:9999/item'

let server = require('./server.js').getServer();
const plugins = require('./plugins');
const routes = require('../routes/routes.js');

before(async () => {
  const { spawn } = require('child_process');
  pouchdbServer = spawn('./node_modules/pouchdb-server/bin/pouchdb-server', ['-c','test/pouchdb-server-config.json', '--in-memory']);
  
  // wait a second to give pouchdbServer time to boot
  await new Promise(resolve => {
    setTimeout(resolve, 1000);
  });
  
  console.log('started pouchdb server with pid', pouchdbServer.pid);
  const setupCouch = await require('./mock/couchdb.js').setupCouch;

  await setupCouch();

  await require('./mock/qserver.js').start();

  await server.register(plugins);
  server.route(routes);
  await server.start();
});

after(async () => {
  console.log('\ngoing to kill pouchdb server with pid', pouchdbServer.pid);
  pouchdbServer.kill('SIGHUP');
  console.log('killed?', pouchdbServer.killed, '\n');
  if (!pouchdbServer.killed) {
    console.log('somehow i could not kill your pouchdb server. maybe another one is still running. check with "lsof -i :5984" and kill it yourself');
  }
  await server.stop({timeout: 2000});
  server = null;
  return;
});

lab.experiment('basic routes', () => {
  it('starts the server', () => {
    expect(server.info.created).to.be.a.number();
  });

  it('is healthy', async () => {
    const response = await server.inject('/health');
    expect(response.payload).to.be.equal('ok');
  });
});

lab.experiment('schema route', () => {
  it('returns existing schema', async () => {
    const response = await server.inject(`/schema.json`);
    expect(response.statusCode).to.be.equal(200);
  });

  it('returns Not Found when requesting an inexisting schema', async () => {
    const response = await server.inject('/inexisting.json');
    expect(response.statusCode).to.be.equal(404);
  });
});

lab.experiment('stylesheets route', () => {
  it('returns existing stylesheet with right cache control header', {plan: 2}, async () => {
    const filename = require('../styles/hashMap.json').default;
    const response = await server.inject(`/stylesheet/${filename}`);
    expect(response.statusCode).to.be.equal(200);
    expect(response.headers['cache-control']).to.be.equal('max-age=31536000, immutable');
  });

  it('returns Not Found when requesting an inexisting stylesheet', async () => {
    const response = await server.inject('/stylesheet/inexisting.123.css');
    expect(response.statusCode).to.be.equal(404);
  });
});

lab.experiment('scripts route', () => {
  it('returns existing script with right cache control header', {plan: 2}, async () => {
    const filename = require('../scripts/hashMap.json').quiz;
    const response = await server.inject(`/script/${filename}`);
    expect(response.statusCode).to.be.equal(200);
    expect(response.headers['cache-control']).to.be.equal('max-age=31536000, immutable');
  });

  it('returns Not Found when requesting an inexisting script', async () => {
    const response = await server.inject('/script/inexisting.123.css');
    expect(response.statusCode).to.be.equal(404);
  });
});

lab.experiment('locales route', () => {
  it('returns existing english translation', async () => {
    const response = await server.inject(`/locales/en/translation.json`);
    expect(response.statusCode).to.be.equal(200);
  });

  it('returns Not Found when requesting an inexisting translation', async () => {
    const response = await server.inject('/locales/inexisting/translation.json');
    expect(response.statusCode).to.be.equal(404);
  });
});

lab.experiment('rendering info route', async () => {
  it('renders a quiz', {plan: 4}, async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const fixtureData = fixtureResponse.result;
    const response = await server.inject({
      method: 'POST',
      url: '/rendering-info/html-js',
      payload: {
        item: JSON.stringify(fixtureData[0]),
        toolRuntimeConfig: {
          toolBaseUrl: 'http://localhost:3000'
        }
      }
    })
    expect(response.statusCode).to.be.equal(200);
    expect(response.result.markup).startsWith(`<div class="q-quiz s-color-gray-4" id="q-quiz-${fixtureData[0]._id}" style="opacity: 0;" data-track-id="quiz" data-track-component-id="${fixtureData[0]._id}">`);
    expect(response.result.stylesheets[0].name).startsWith('default.');
    expect(response.result.scripts.length).to.be.equal(2);
  });

  it('renders quiz for which answers will not be saved (= is pure)', {plan: 3}, async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const fixtureData = fixtureResponse.result;
    const response = await server.inject({
      method: 'POST',
      url: '/rendering-info/html-js',
      payload: {
        item: JSON.stringify(fixtureData[0]),
        toolRuntimeConfig: {
          toolBaseUrl: 'http://localhost:3000',
          isPure: true
        }
      }
    })
    expect(response.statusCode).to.be.equal(200);
    expect(response.result.scripts.length).to.be.equal(2);    
    expect(response.result.scripts[1].content).contains('"isPure":true');    
  });

  // id from answer and random id? 
  // no last card?
  // isFinalScoreShown?

  it('returns 400 if no payload is given', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/rendering-info/html-js',
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it('returns 400 if no item is given in payload', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/rendering-info/html-js',
      payload: {
        toolRuntimeConfig: {
          toolBaseUrl: 'http://localhost:3000'
        }
      }
    });
    expect(response.statusCode).to.be.equal(400);
  });

  it('returns 400 if no toolRuntimeConfig is given in payload', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const fixtureData = fixtureResponse.result;
    const response = await server.inject({
      method: 'POST',
      url: '/rendering-info/html-js',
      payload: {
        item: JSON.stringify(fixtureData[0]),
      }
    });
    expect(response.statusCode).to.be.equal(400);
  });
});

lab.experiment('answer store route', () => {
  it('returns id for stored answer', async () => {
    // only quick test at the moment with fixed value, should be random values in possible domain (min, max, max distance..) and should be done several times, maybe also use for testing stats route
    const fixtureResponse = await server.inject('/fixtures/data');
    const fixtureData = fixtureResponse.result;
    const data = {
      itemId: fixtureData[0]._id,
      questionId: fixtureData[0].elements[2].id,
      type: fixtureData[0].elements[2].type,
      value: 7
    }
    const answerStoreResponse = await server.inject({
      method: 'POST',
      url: '/answer',
      payload: {
        data: JSON.stringify(data)
      },
    })
    expect(answerStoreResponse.statusCode).to.be.equal(200);
    expect(answerStoreResponse.result.id).to.be.a.string();
  });

  it('returns 400 if payload is empty', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/answer',
      payload: {}
    })
    expect(response.statusCode).to.be.equal(400);
  });
});

lab.experiment('answer stats route', () => {
  it('returns stats for a multiple choice question of first fixture quiz', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const fixtureData = fixtureResponse.result;
    const mcQuestion = fixtureData[0].elements[1];
    const statsReponse = await server.inject(`/stats/answers/${mcQuestion.type}/${fixtureData[0]._id}/${mcQuestion.id}`);
    expect(statsReponse.statusCode).to.be.equal(200);
    expect(statsReponse.result.totalAnswers).to.be.equal(5);
    expect(statsReponse.result.numberOfAnswersPerChoice['richtig']).to.be.equal(3);
  });

  it('returns 400 if question type is not valid', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const fixtureData = fixtureResponse.result;
    const mcQuestion = fixtureData[0].elements[1];
    const response = await server.inject(`/stats/answers/singleChoice/${fixtureData[0]._id}/${mcQuestion.id}`);
    expect(response.statusCode).to.be.equal(400);
  });
});

lab.experiment('score route', () => {
  const questionTypes = require('../resources/helpers/constants.js').questionTypes;
  const worstAnswerDifference = require('../resources/helpers/scoreHelpers.js').worstAnswerDifference;
  
  it('returns 100% score for only right answers', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const quiz = fixtureResponse.result[0];
    const questions = quiz.elements.filter(element => {
      return questionTypes.includes(element.type);
    });
    let userAnswers = [];
    for (const question of questions) {
      let userAnswer = {
        questionId: question.id,
      }
      if (question.type === 'multipleChoice' || question.type === 'numberGuess') {
        userAnswer.value = question.answer;
      } else if (question.type === 'mapPointGuess') {
        userAnswer.value = {
          distance: 0
        }
      }
      userAnswers.push(userAnswer);
    };

    const response = await server.inject({
      method: 'POST',
      url: '/score',
      payload: {
        item: JSON.stringify(quiz),
        userAnswers: userAnswers
      }
    });

    expect(response.statusCode).to.be.equal(200);
    expect(response.result.maxScore).to.be.equal(response.result.achievedScore);
  });

  it('returns score for mixed answers', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const quiz = fixtureResponse.result[0];
    const questions = quiz.elements.filter(element => {
      return questionTypes.includes(element.type);
    });
    let userAnswers = [];
    for (const question of questions) {
      let userAnswer = {
        questionId: question.id,
      }
      if (question.type === 'multipleChoice') {
        userAnswer.value = question.choices[0];
      } else if (question.type === 'numberGuess') {
        // random answer between min and max
        userAnswer.value = Math.random() + (question.max - question.min) + question.min;
      } else if (question.type === 'mapPointGuess') {
        // random answer between 0 distance and worst distance
        const worst = worstAnswerDifference(question);
        userAnswer.value = {
          distance: Math.random() * worst
        }
      }
      userAnswers.push(userAnswer);
    };

    const response = await server.inject({
      method: 'POST',
      url: '/score',
      payload: {
        item: JSON.stringify(quiz),
        userAnswers: userAnswers
      }
    });

    expect(response.statusCode).to.be.equal(200);
    expect(response.result.maxScore).to.be.greaterThan(response.result.achievedScore);
  });

  it('returns score for partially answered questions', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const quiz = fixtureResponse.result[0];
    const questions = quiz.elements.filter(element => {
      return questionTypes.includes(element.type);
    });
    let userAnswers = [];
    for (const [index, question] of questions.entries()) {
      if (index % 2 === 0) {
        let userAnswer = {
          questionId: question.id,
        }
        if (question.type === 'multipleChoice') {
          userAnswer.value = question.answer;
        } else if (question.type === 'numberGuess') {
          // random answer between min and max
          userAnswer.value = Math.random() + (question.max - question.min) + question.min;
        } else if (question.type === 'mapPointGuess') {
          // random answer between 0 distance and worst distance
          const worst = worstAnswerDifference(question);
          userAnswer.value = {
            distance: Math.random() * worst
          }
        }
        userAnswers.push(userAnswer);
      }
    };

    const response = await server.inject({
      method: 'POST',
      url: '/score',
      payload: {
        item: JSON.stringify(quiz),
        userAnswers: userAnswers
      }
    });

    expect(response.statusCode).to.be.equal(200);
    expect(response.result.maxScore).to.be.greaterThan(response.result.achievedScore);
  })

  it('returns 0 score for only wrong/worst answers', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const quiz = fixtureResponse.result[0];
    const questions = quiz.elements.filter(element => {
      return questionTypes.includes(element.type);
    });
    let userAnswers = [];
    for (const question of questions) {
      let userAnswer = {
        questionId: question.id,
      }
      if (question.type === 'multipleChoice') {
        userAnswer.value = question.choices[0];
      } else if (question.type === 'numberGuess') {
        const worst = worstAnswerDifference(question);
        if (worst === question.max) {
          userAnswer.value = question.max;
        } else {
          userAnswer.value = question.min;
        }
      } else if (question.type === 'mapPointGuess') {
        userAnswer.value = {
          distance: worstAnswerDifference(question)
        }
      }
      userAnswers.push(userAnswer);
    };

    const response = await server.inject({
      method: 'POST',
      url: '/score',
      payload: {
        item: JSON.stringify(quiz),
        userAnswers: userAnswers
      }
    });

    expect(response.statusCode).to.be.equal(200);
    expect(response.result.achievedScore).to.be.equal(0);
  });

  it('returns 400 if payload is empty', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/score',
      payload: {}
    });
  });

  it('returns 400 if item is missing in payload', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/score',
      payload: {
        userAnswers: [{
          questionId: 'inexisting',
          value: 'inexisting'
        }]
      }
    });

    expect(response.statusCode).to.be.equal(400);
  });

  it('returns 400 if user answer values are missing in payload', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const quiz = fixtureResponse.result[0];

    const response = await server.inject({
      method: 'POST',
      url: '/score',
      payload: {
        item: JSON.stringify(quiz)
      }
    });
  });
});

lab.experiment('number guess plot route', () => {
  it('returns number guess plot', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const quiz = fixtureResponse.result[0];
    const response = await server.inject(`/number-guess/${quiz._id}/${quiz.elements[2].id}/plot/${560}`);
    expect(response.statusCode).to.be.equal(200);
    expect(response.result).startsWith('<svg');
  })

  it('returns 400 for requesting number guess plot with multiple choice question', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const quiz = fixtureResponse.result[0];
    const response = await server.inject(`/number-guess/${quiz._id}/${quiz.elements[1].id}/plot/${560}`);
    expect(response.statusCode).to.be.equal(400);
    expect(response.result.message).to.be.equal('stats is undefined');
  })
})

lab.experiment('map point guess plot route', () => {
  it('returns heatmap for map point guess', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const quiz = fixtureResponse.result[0];
    const mapPointQuestion = quiz.elements[4];
    const bboxString = `${mapPointQuestion.answer.bbox[0]}, ${mapPointQuestion.answer.bbox[1]}, ${mapPointQuestion.answer.bbox[3]}, ${mapPointQuestion.answer.bbox[4]}`
    const response = await server.inject(`/map/${mapPointQuestion.id}/heatmap/${560}/${500}/${bboxString}`);
    expect(response.statusCode).to.be.equal(200);
    expect(response.headers['content-type']).to.be.equal('image/png');
  })

  it('returns 400 for requesting number guess plot with multiple choice question', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const quiz = fixtureResponse.result[0];
    const response = await server.inject(`/map/${quiz.elements[1].id}/heatmap/${560}/${500}/1, 2, 3, 4`);
    expect(response.statusCode).to.be.equal(400);
    expect(response.result.message).to.be.equal('invalid answer');
  })
})

// check further very specific points in code (see coverage result) if they should/can be tested, maybe also with unit tests
