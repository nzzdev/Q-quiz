import Hapi from "@hapi/hapi";
import { createRequire } from "module";

import routes from "./dist/routes.js";
import plugins from "./dist/plugins.js";

// These lines make "require" available.
const require = createRequire(import.meta.url);

const server = Hapi.server({
  port: process.env.PORT || 3000,
});

async function init() {
  await server.register(require("@hapi/inert"));
  server.validator(require("joi"));

  server.route(routes);

  // Register plugins
  await server.register(plugins);

  // configuration for caching
  // TODO: is this needed?
  server.cache.provision({
    provider: {
      constructor: require("@hapi/catbox-memory"),
      options: {
        partition: "x",
        maxByteSize: 10000,
      },
    },
    name: "memoryCache",
  });

  await server.start();
  console.log("server running ", server.info.uri);
}

init();

async function gracefullyStop() {
  console.log("stopping hapi server");
  try {
    await server.stop({ timeout: 10000 });
    console.log("hapi server stopped");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
  process.exit(0);
}

// listen on SIGINT and SIGTERM signal and gracefully stop the server.
process.on("SIGINT", gracefullyStop);
process.on("SIGTERM", gracefullyStop);
