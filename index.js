const plugins = require("./server-plugins.js");
const routes = require("./routes/routes.js");
const Hapi = require("@hapi/hapi");

const start = async function() {
  let server = Hapi.server({
    port: process.env.PORT || 3000,
    routes: {
      cors: true
    }
  });
  server.cache.provision({
    provider: {
      constructor: require("@hapi/catbox-memory"),
      options: {
        partition: "x",
        maxByteSize: 10000
      }
    },
    name: "memoryCache"
  });
  await server.register(plugins);
  server.route(routes);
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

start();
