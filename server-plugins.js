const require = createRequire(import.meta.url);
import { createRequire } from "module";

const noir = require("pino-noir");

module.exports = [
  require("@hapi/inert"),
  {
    plugin: require("hapi-pino"),
    options: {
      serializers: {
        req: noir(["req.headers.authorization"]).req,
      },
      prettyPrint:
        process.env.APP_ENV !== "production" &&
        process.env.APP_ENV !== "staging" &&
        process.env.APP_ENV !== "test",
      logRouteTags: true,
      ignorePaths: ["/health"],
    },
  },
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
