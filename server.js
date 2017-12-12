const Hapi = require('hapi');

const hapiOptions = {
  cache: [
    {
      name: 'memoryCache',
      engine: require('catbox-memory')
    }
  ],
  port: process.env.PORT || 3000
}

module.exports = new Hapi.Server(hapiOptions);
