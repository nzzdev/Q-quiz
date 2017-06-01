const Hapi = require('hapi');

const hapiOptions = {
  cache: [
    {
      name: 'memoryCache',
      engine: require('catbox-memory')
    }
  ]
}

const server = new Hapi.Server(hapiOptions);
server.connection({
	port: process.env.PORT || 3000
});

module.exports = server;
