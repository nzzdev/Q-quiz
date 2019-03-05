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

Q-Quiz support three different question types multiple choice, number guess and map point guess. Each question type takes a question, a correct answer and additional configuration parameters like wrong answers or min and max values.
The questions types are implemented as ES6 classes and each follow the same structure.

[to the top](#table-of-contents)

## Architecture

### Frontend code

The frontend code gets transpiled to a jspm bundle and this bundle gets loaded and initialized by the jspm loader on client-side.

### Answer-Service

The frontend communicates with the answer-service to store all the entered answers, get the total score and statistics.

[to the top](#table-of-contents)

## License
Copyright (c) 2019 Neue Zürcher Zeitung. All rights reserved.

This software is published under the MIT license.

[to the top](#table-of-contents)
