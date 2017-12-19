const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const Boom = require('boom');
const lab = exports.lab = Lab.script();

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
  })
});

lab.experiment('schema route', () => {
  it('returns existing schema', async () => {
    const response = await server.inject(`/schema.json`);
    expect(response.statusCode).to.be.equal(200);
  })

  it('returns Not Found when requesting an inexisting schema', async () => {
    const response = await server.inject('/inexisting.json');
    expect(response.statusCode).to.be.equal(404);
  })
})

lab.experiment('stylesheets route', () => {
  it('returns existing stylesheet with right cache control header', {plan: 2}, async () => {
    const filename = require('../styles/hashMap.json').default;
    const response = await server.inject(`/stylesheet/${filename}`);
    expect(response.statusCode).to.be.equal(200);
    expect(response.headers['cache-control']).to.be.equal('max-age=31536000, immutable');
  })

  it('returns Not Found when requesting an inexisting stylesheet', async () => {
    const response = await server.inject('/stylesheet/inexisting.123.css');
    expect(response.statusCode).to.be.equal(404);
  })
});

lab.experiment('scripts route', () => {
  it('returns existing script with right cache control header', {plan: 2}, async () => {
    const filename = require('../scripts/hashMap.json').quiz;
    const response = await server.inject(`/script/${filename}`);
    expect(response.statusCode).to.be.equal(200);
    expect(response.headers['cache-control']).to.be.equal('max-age=31536000, immutable');
  })

  it('returns Not Found when requesting an inexisting script', async () => {
    const response = await server.inject('/script/inexisting.123.css');
    expect(response.statusCode).to.be.equal(404);
  })
});

lab.experiment('locales route', () => {
  it('returns existing english translation', async () => {
    const response = await server.inject(`/locales/en/translation.json`);
    expect(response.statusCode).to.be.equal(200);
  })

  it('returns Not Found when requesting an inexisting translation', async () => {
    const response = await server.inject('/locales/inexisting/translation.json');
    expect(response.statusCode).to.be.equal(404);
  })
})

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
  })

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
  })

  // id from answer and random id? 
  // no last card?
  // isFinalScoreShown?

  it('returns 400 if no payload is given', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/rendering-info/html-js',
    });
    expect(response.statusCode).to.be.equal(400);
  })

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
  })

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
  })
})

lab.experiment('answer store route', () => {
  it('returns id for stored answer', async () => {
    // only quick test at the moment with fixed values, should be random values in possible domain (min, max, max distance..) and should be done several times, also necessary for stats
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
  })
})

lab.experiment('answer stats route', () => {
  it('returns stats for a multiple choice question of first fixture quiz', async () => {
    const fixtureResponse = await server.inject('/fixtures/data');
    const fixtureData = fixtureResponse.result;
    const mcQuestion = fixtureData[0].elements[1];
    const statsReponse = await server.inject(`/stats/answers/${mcQuestion.type}/${fixtureData[0]._id}/${mcQuestion.id}`);
    expect(statsReponse.statusCode).to.be.equal(200);
  })
})

// check fixture data
// check save answer
// check answer stats
// check number guess plot and map guess heatmap
// check score route
