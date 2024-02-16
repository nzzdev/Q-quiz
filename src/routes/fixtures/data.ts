import type { ServerRoute } from '@hapi/hapi';

import lastCardt from '../../../resources/fixtures/data/last-card.json';
import allCoverWithImageAndthemeLogo from '../../../resources/fixtures/data/all-cover-with-image-and-theme-title.json';
import all from '../../../resources/fixtures/data/all.json';
import allQuestionTypesWithImages from '../../../resources/fixtures/data/all-question-types-with-images.json';
import coverWithTitleNoLastCard from '../../../resources/fixtures/data/cover-with-title-no-last-card.json';
import singleBigNumberGuess from '../../../resources/fixtures/data/single-big-number-guess.json';
import singleBigNumberPoll from '../../../resources/fixtures/data/single-big-number-poll.json';
import singleBigNumberSmallStepGuess from '../../../resources/fixtures/data/single-big-number-small-step-guess.json';
import singleFloatNumberGuess from '../../../resources/fixtures/data/single-float-number-guess.json';
import singleFloatNumberPoll from '../../../resources/fixtures/data/single-float-number-poll.json';
import singleMapPointGuessHighZoomlevel from '../../../resources/fixtures/data/single-map-point-guess-high-zoomlevel.json';
import singleMapPointGuessLowZoomlevel from '../../../resources/fixtures/data/single-map-point-guess-low-zoomlevel.json';
import singlemapPointGuess from '../../../resources/fixtures/data/single-map-point-guess.json';
import singleMultipleChoice from '../../../resources/fixtures/data/single-multiple-choice.json';
import singleNumberGuessAndrin from '../../../resources/fixtures/data/single-number-guess-andrin.json';
import singleNumberGuess from '../../../resources/fixtures/data/single-number-guess.json';
import singleNumberPoll from '../../../resources/fixtures/data/single-number-poll.json';
import stripPlotNumberGuess from '../../../resources/fixtures/data/strip-plot-number-guess.json';

const fixtureData = [
  lastCardt,
  allCoverWithImageAndthemeLogo,
  allQuestionTypesWithImages,
  all,
  coverWithTitleNoLastCard,
  singleBigNumberGuess,
  singleBigNumberPoll,
  singleBigNumberSmallStepGuess,
  singleFloatNumberGuess,
  singleFloatNumberPoll,
  singleMapPointGuessHighZoomlevel,
  singleMapPointGuessLowZoomlevel,
  singlemapPointGuess,
  singleMultipleChoice,
  singleNumberGuessAndrin,
  singleNumberGuess,
  singleNumberPoll,
  stripPlotNumberGuess,
];

const route: ServerRoute = {
  path: '/fixtures/data',
  method: 'GET',
  options: {
    tags: ['api'],
  },
  handler: () => {
    return fixtureData;
  },
};

export default route;
