const fixtureDataDirectory = '../../resources/fixtures/data';

// provide every fixture data file present in ../../resources/fixtures/data
const fixtureData = [
  require(`${fixtureDataDirectory}/all.json`),
  require(`${fixtureDataDirectory}/cover-with-title-no-last-card.json`),
  require(`${fixtureDataDirectory}/single-multiple-choice.json`),
  require(`${fixtureDataDirectory}/single-number-guess.json`),
  require(`${fixtureDataDirectory}/single-map-point-guess.json`),
  // Todo: 
  // Quiz mit Bildern
  // Quiz mit Artikelempfehlungen
  // Quiz mit ausformulierten Antworten
];

module.exports = {
  path: '/fixtures/data',
  method: 'GET',
  config: {
    tags: ['api'],
    cors: true
  },
  handler: (request, h) => {
    return fixtureData;
  }
}
