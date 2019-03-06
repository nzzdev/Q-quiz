# Q Quiz [![Build Status](https://travis-ci.com/nzzdev/Q-quiz.svg?token=bwR7zbPTTpEoDxbY2dJR&branch=dev)](https://travis-ci.com/nzzdev/Q-quiz)

**Maintainer**: [manuelroth](https://github.com/manuelroth)

Q Quiz is one tool of the Q toolbox to render quizzes containing questions of type multiple choice, number guess and map point guess. It also includes the rendering of answer statistics for each question type.

## Table of contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Tool implementation details ](#tool-implementation-details)
- [Features](#features)
- [Architecture](#architecture)
- [License](#license)

## Installation

```bash
$ npm install
$ npm run build
```

[to the top](#table-of-contents)

## Configuration
The following environment variables must be specified when starting the tool:
- ```COUCH_DB_USER```
- ```COUCH_DB_PASS```
- ```COUCH_DB_URL_Q_QUIZ```
- ```COUCH_DB_URL_Q_ITEMS```
- ```IMAGE_SERVICE_URL```
- ```ENRICO_API_URL```
- ```ENRICO_PRODUCTS```

Please have a look at the test environment for examples on what this variables should look like.

## Development

Install the [Q cli](https://github.com/nzzdev/Q-cli) and start the Q dev server:

```
$ Q server
```

Run the Q tool:
```
$ node dev.js
```
[to the top](#table-of-contents)

## Testing
The testing framework used in this repository is [Code](https://github.com/hapijs/code).

Run the tests:
```
$ npm run test
```

### Implementing a new test

When changing or implementing...
- A `route`, it needs to be tested in the `e2e-tests.js` file
- Something on the frontend, it needs to be tested in the `dom-tests.js` file

[to the top](#table-of-contents)

## Tool implementation details
The tool structure follows the general structure of each Q tool. Further information can be found in [Q server documentation - Developing tools](https://nzzdev.github.io/Q-server/developing-tools.html).

[to the top](#table-of-contents)

## Features

### Question Types

Q-Quiz supports three different question types multiple choice, number guess and map point guess. Each question type takes a question, a correct answer and additional configuration parameters like wrong answers or min and max values. The questions types are implemented as ES6 classes and each follow the same structure.

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

## License
Copyright (c) 2019 Neue Zürcher Zeitung. All rights reserved.

This software is published under the MIT license.

[to the top](#table-of-contents)
