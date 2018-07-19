const noir = require("pino-noir");

module.exports = [
  require("inert"),
  {
    plugin: require("hapi-pino"),
    options: {
      serializers: {
        req: req => {
          // this is from https://github.com/pinojs/hapi-pino/blob/master/index.js#L164-L174
          // and should be changed once there is an agreement on: https://github.com/pinojs/hapi-pino/pull/34
          const raw = req.raw.req;
          const normalizedReq = {
            id: req.info.id,
            method: raw.method,
            url: raw.url,
            headers: raw.headers,
            remoteAddress: raw.connection.remoteAddress,
            remotePort: raw.connection.remotePort
          };
          return noir(["req.headers.authorization"]).req(normalizedReq);
        }
      },
      prettyPrint:
        process.env.APP_ENV !== "production" &&
        process.env.APP_ENV !== "staging",
      logRouteTags: true,
      ignorePaths: ["/health"]
    }
  }
  // should be added again as soon as yaral and hapi 17 are compatible
  /* {
    plugin: require('yaral'),
    options: {
      cache: 'memoryCache',
      buckets: [
        {
          name: 'maxPerIp',
          max: 30,
          interval: 1000 * 300,
          mode: 'continuous',
          id: function(request) {
            return request.info.remoteAddress || 'a';
          }
        }
      ],
      default: []
    }
  }, */
];
