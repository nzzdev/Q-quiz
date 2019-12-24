const noir = require("pino-noir");

module.exports = [
  require("@hapi/inert"),
  {
    plugin: require("hapi-pino"),
    options: {
      serializers: {
        req: noir(["req.headers.authorization"]).req
      },
      prettyPrint:
        process.env.APP_ENV !== "production" &&
        process.env.APP_ENV !== "staging" &&
        process.env.APP_ENV !== "test",
      logRouteTags: true,
      ignorePaths: ["/health"]
    }
  },
  {
    plugin: require("yaral"),
    options: {
      cache: "memoryCache",
      buckets: [
        {
          name: "maxPerIp",
          max: 30,
          interval: 1000 * 300,
          mode: "continuous",
          id: function(request) {
            return request.info.remoteAddress || Math.random();
          }
        }
      ]
    }
  }
];
