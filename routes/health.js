module.exports = {
  path: '/health',
  method: 'GET',
  options: {
    tags: ['api', 'health']
  },
  handler: (request, h) => {
    return 'ok';
  }
}
