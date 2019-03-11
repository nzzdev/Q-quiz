const plugins = require("./server-plugins.js");
const routes = require("./routes/routes.js");
const Hapi = require("hapi");

const start = async function () {
  let server = Hapi.server({
    port: process.env.PORT || 3000,
    routes: {
      cors: true
    }
  });
  await server.register(plugins);
  server.route(routes);
  server.cache.provision({
    provider: {
      constructor: require('catbox-memory'),
      options: {
        partition: 'x',
        maxByteSize: 10000
      }
    },
    name: "memoryCache"
  });
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

start();
