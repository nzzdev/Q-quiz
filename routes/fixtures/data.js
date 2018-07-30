const fixtureDataDirectory = "../../resources/fixtures/data";

// provide every fixture data file present in ../../resources/fixtures/data
const fixtureData = [
  require(`${fixtureDataDirectory}/all.json`),
  require(`${fixtureDataDirectory}/all-question-types-with-images-and-credit.json`),
  require(`${fixtureDataDirectory}/cover-with-title-no-last-card.json`),
  require(`${fixtureDataDirectory}/single-multiple-choice.json`),
  require(`${fixtureDataDirectory}/single-number-guess.json`),
  require(`${fixtureDataDirectory}/single-map-point-guess.json`),
  require(`${fixtureDataDirectory}/single-map-point-guess-low-zoomlevel.json`),
  require(`${fixtureDataDirectory}/single-map-point-guess-high-zoomlevel.json`)
];

module.exports = {
  path: "/fixtures/data",
  method: "GET",
  config: {
    tags: ["api"],
    cors: true
  },
  handler: (request, h) => {
    return fixtureData;
  }
};
