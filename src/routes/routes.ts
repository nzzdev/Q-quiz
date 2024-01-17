import web from './rendering-info/html-js';
import stylesheet from './stylesheet';
import dynamicSchemas from './dynamic-schemas/index';
import health from './health';
import locales from './locales';
import fixtureData from './fixtures/data';
import schema from './schema';
import answers from './answer-service/stats';

// answer service
// import statistic from './answer-service/statistics';
const allRoutes = [
  web,
  stylesheet,
  ...dynamicSchemas,
  health,
  locales,
  fixtureData,
  ...schema,
  answers,
  // statistic,
];

export default allRoutes;
