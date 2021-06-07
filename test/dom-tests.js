const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const Hapi = require("@hapi/hapi");
const lab = (exports.lab = Lab.script());
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const it = lab.it;

process.env.COUCH_DB_URL_Q_QUIZ = "http://localhost:5984/answer-store";
process.env.COUCH_DB_URL_Q_ITEMS = "http://localhost:9999/item";

let server;
const routes = require("../routes/routes.js");

before(async () => {
  server = Hapi.server({
    port: process.env.PORT || 3333,
    routes: {
      cors: true
    }
  });

  const { spawn } = require("child_process");
  pouchdbServer = spawn("./node_modules/pouchdb-server/bin/pouchdb-server", [
    "-c",
    "test/pouchdb-server-config.json",
    "--in-memory"
  ]);

  // wait a second to give pouchdbServer time to boot
  await new Promise(resolve => {
    setTimeout(resolve, 1000);
  });

  console.log("started pouchdb server with pid", pouchdbServer.pid);
  const setupCouch = await require("./mock/couchdb.js").setupCouch;

  await setupCouch();

  await require("./mock/qserver.js").start();

  await server.register(require("@hapi/inert"));
  server.route(routes);
  await server.start();
});

after(async () => {
  console.log("\ngoing to kill pouchdb server with pid", pouchdbServer.pid);
  pouchdbServer.kill("SIGHUP");
  console.log("killed?", pouchdbServer.killed, "\n");
  if (!pouchdbServer.killed) {
    console.log(
      'somehow i could not kill your pouchdb server. maybe another one is still running. check with "lsof -i :5984" and kill it yourself'
    );
  }
  await server.stop({ timeout: 2000 });
  server = null;
});

function element(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelector(selector));
  });
}

function elementCount(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector).length);
  });
}

lab.experiment("dom tests", () => {
  it("should display title", async () => {
    const response = await server.inject({
      url: "/rendering-info/html-js",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/all.json"),
        toolRuntimeConfig: {
          toolBaseUrl: "http://localhost:3000"
        }
      }
    });

    return elementCount(
      response.result.markup,
      "button.s-button--circular"
    ).then(value => {
      expect(value).to.be.equal(2);
    });
  });

  it("should display container", async () => {
    const response = await server.inject({
      url: "/rendering-info/html-js",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/all.json"),
        toolRuntimeConfig: {
          toolBaseUrl: "http://localhost:3000"
        }
      }
    });

    return elementCount(
      response.result.markup,
      ".q-quiz-element-container"
    ).then(value => {
      expect(value).to.be.equal(8);
    });
  });
});
