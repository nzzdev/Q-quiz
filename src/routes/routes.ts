import web from './rendering-info/html-js';
import stylesheet from './stylesheet';
import dynamicSchemas from './dynamic-schemas/index';
import health from './health';
import locales from './locales';
import fixtureData from './fixtures/data';

// answer service
import schema from './schema';

const allRoutes = [
  web,
  stylesheet,
  ...dynamicSchemas,
  health,
  locales,
  fixtureData,
  ...schema,
];

export default allRoutes;
