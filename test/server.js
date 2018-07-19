const Hapi = require("hapi");

function getServer() {
  let server = Hapi.server({
    port: process.env.PORT || 3333,
    routes: {
      cors: true
    }
  });
  return server;
}

module.exports.getServer = getServer;
