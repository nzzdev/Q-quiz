import Hapi from '@hapi/hapi';
import routes from './dist/routes.js';

// These lines make "require" available.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const server = Hapi.server({
  port: process.env.PORT || 3000,
  // TODO: check if this is needed
  routes: {
    cors: {
      origin: ['*'], // Allow all origins
      additionalHeaders: ['cache-control', 'x-requested-with'],
    },
  },
});

async function init() {
  await server.register(require('@hapi/inert'));
  server.validator(require('joi'));

  server.route(routes);

  await server.start();
  console.log('server running ', server.info.uri);
}

init();

async function gracefullyStop() {
  console.log('stopping hapi server');
  try {
    await server.stop({ timeout: 10000 });
    console.log('hapi server stopped');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
  process.exit(0);
}

// listen on SIGINT and SIGTERM signal and gracefully stop the server.
process.on('SIGINT', gracefullyStop);
process.on('SIGTERM', gracefullyStop);
