module.exports = [
  require('./rendering-info/html-js.js'),
  require('./stylesheet.js'),
  require('./schema.js'),
  require('./locales.js'),
  require('./health.js')
]
.concat(
  require('./scripts.js'), 
  require('./answer-service/answer.js'), 
  require('./answer-service/stats.js'), 
  require('./answer-service/map-point-guess.js'), 
  require('./answer-service/number-guess.js')
)
