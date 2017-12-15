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

  await server.register(plugins);
  server.route(routes);
  await server.start();
});

after(async () => {
  console.log('\ngoing to kill pouchdb server with pid', pouchdbServer.pid);
  pouchdbServer.kill('SIGHUP');
  console.log('killed?', pouchdbServer.killed, '\n');
  if (!pouchdbServer.killed) {
    console.log('somehow i could not kill your pouchdb server. maybe another one is still running. check with "lsof -i:5984" and kill it yourself');
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
