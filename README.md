# Q Quiz [![Build Status](https://travis-ci.com/nzzdev/Q-quiz.svg?token=bwR7zbPTTpEoDxbY2dJR&branch=dev)](https://travis-ci.com/nzzdev/Q-quiz)

**Maintainer**: [manuelroth](https://github.com/manuelroth)

Q Quiz is one tool of the Q toolbox to render quizzes containing questions of type multiple choice, number guess and map point guess. It also includes the rendering of answer statistics for each question type.

## Table of contents
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Tool implementation details ](#tool-implementation-details)
- [License](#license)

## Installation

```bash
$ npm install
$ npm run build
```

[to the top](#table-of-contents)
## Development

Install the [Q cli](https://github.com/nzzdev/Q-cli) and start the Q dev server:

```
$ Q server
```

Run the Q tool:
```
$ node index.js
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

## License
Copyright (c) 2019 Neue Zürcher Zeitung. All rights reserved.

This software is published under the MIT license.

[to the top](#table-of-contents)
