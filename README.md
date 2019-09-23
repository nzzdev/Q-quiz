# Q Quiz [![Build Status](https://travis-ci.com/nzzdev/Q-quiz.svg?token=bwR7zbPTTpEoDxbY2dJR&branch=dev)](https://travis-ci.com/nzzdev/Q-quiz) [![Greenkeeper badge](https://badges.greenkeeper.io/nzzdev/Q-quiz.svg?token=0092ccff54931fc37f0887dd73f1a0bd550f584c80482e40fde8768e26d885ac&ts=1551342745740)](https://greenkeeper.io/)

**Maintainer**: [manuelroth](https://github.com/manuelroth)

Q Quiz is one tool of the Q toolbox to render quizes containing questions of type multiple choice, number guess and map point guess. It also includes the rendering of answer statistics for each question type. Test it in the [playground](https://q-playground.st.nzz.ch/).

## Table of contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Functionality](#functionality)
- [License](#license)

## Installation

```bash
git clone git@github.com:nzzdev/Q-quiz.git
cd ./Q-quiz
nvm use
npm install
jspm install
npm run build
```

[to the top](#table-of-contents)

## Configuration

The following environment variables must be specified when starting the tool:

- `COUCH_DB_USER` - couchdb user for accessing the answer-store database
- `COUCH_DB_PASS` - couchdb password for accessing the answer-store database
- `COUCH_DB_URL_Q_QUIZ` - url to the answer-store database
- `COUCH_DB_URL_Q_ITEMS` - url to the q-items database (used for the statistics)
- `ENRICO_API_URL` - url to enrico used to give article recommendations
- `ENRICO_PRODUCTS` - array of publications which should be queried for article recommendations
- `IMAGE_SERVICE_URL` - url to the image service - It should contain a URL with 3 parameters that will get replaced before the URL is used to load the images.
  `{key}` will be replaced by the string Q-server stored as the key when the file got uploaded through Q-servers `/file` endpoint provided by the [file plugin](https://github.com/nzzdev/Q-server/blob/dev/plugins/file/index.js)
  `{width}` is replaced by the width the image should be loaded
  `{format}` will be `png` or `webp` (a `picture` element is used in the HTML with multiple `source` elements)
  Example: `https://q-images.nzz.ch/{key}?width={width}&format={format}`
- `MAP` - object containing properties (style url, attribution) for the map required by the mappointguess question type

Please have a look at the test environment for examples on what this variables should look like.

[to the top](#table-of-contents)

## Development

Start the Q dev server:

```
npx @nzz/q-cli server
```

Run the Q tool:

```
node dev.js
```

[to the top](#table-of-contents)

## Testing

The testing framework used in this repository is [Code](https://github.com/hapijs/code).

Run the tests:

```
npm run test
```

### Implementing a new test

When changing or implementing...

- A `route`, it needs to be tested in the `e2e-tests.js` file
- Something on the frontend, it needs to be tested in the `dom-tests.js` file

[to the top](#table-of-contents)

## Deployment

We provide automatically built docker images at https://hub.docker.com/r/nzzonline/q-quiz/.
There are three options for deployment:

- use the provided images
- build your own docker images
- deploy the service using another technology

### Use the provided docker images

1. Deploy `nzzonline/q-quiz` to a docker environment
2. Set the ENV variables as described in the [configuration section](#configuration)

[to the top](#table-of-contents)

## Functionality

The tool structure follows the general structure of each Q tool. Further information can be found in [Q server documentation - Developing tools](https://nzzdev.github.io/Q-server/developing-tools.html).

### Question Types

Q-Quiz supports three different question types `multiple choice`, `number guess` and `map point guess`. Each question type takes a question, a correct answer and additional configuration parameters like wrong answers or min and max values. The questions types are implemented as ES6 classes and each follow the same structure.

### `/rendering-info/html-js`

This is the default endpoint called for web targets. It returns the markup, stylesheets and scripts
. The svelte framework is used to generate the markup. The scripts get transpiled to a jspm bundle and get loaded by the jspm loader on client-side.

### Answer-Service

The frontend communicates with the answer-service to store all the entered answers, get statistics on a single question or get the total score.

#### `/answer`

This endpoint is responsible for saving an `answer` object in the quiz answer database.

#### `/score`

This endpoint takes the `item` and an array of `answer` objects and returns a score object with properties `maxScore` and `achievedScore` based on the submitted answers.

#### `/stats/answers/{type}/{itemId}/{questionId}/{answerId?}`

This endpoint takes the question `type`, `itemId`, `questionId` and optionally an `answerId` as input and returns a stats object with parameters `betterThanPercentage`, `betterThanCount`, `diffPercentage`, `numberOfSameAnswers`, `totalAnswers`. This information is used to display sentences like `Nur 10 Prozent aller anderen lagen noch weiter daneben als Sie` after the user entered an answer.

#### `/map/{questionId}/heatmap/{width}/{height}/{bbox}`

This endpoint takes the `questionId`, `width`, `height` and bounding box as parameter and returns a heatmap visualizing other map point guesses.

#### `/number-guess/{itemId}/{questionId}/plot/{width}`

This endpoint takes the `itemId`, `questionId` and width as parameter and stripplot svg visualizing other number guesses.

[to the top](#table-of-contents)

### Options

There are on options for this tool.

[to the top](#table-of-contents)

## License

Copyright (c) 2019 Neue Zürcher Zeitung. All rights reserved.

This software is published under the [MIT](LICENSE) license.

[to the top](#table-of-contents)
