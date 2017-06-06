module.exports = [
  require('inert'),
  {
    register: require('yaral'),
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
  },
]
