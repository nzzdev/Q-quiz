const turningPoint = 0.6; // x=y

// slope was pre-calculated with a defined point of worst estimation quality of (0.08, 0)
const lowerSlope = 0.6 / 0.52;
const lowerConstant = -(lowerSlope * turningPoint) + turningPoint; // y = ax + b, for a = lowerSlope and (x,y) = turningPoint

// slope was pre-calculated with a defined point of best estimation quality of (0.9, 0.98)
const upperSlope = 0.38 / 0.3;
const upperConstant = -(upperSlope * turningPoint) + turningPoint; // y = ax + b, for a = upperSlope and (x,y) = turningPoint

const lowerBoundX = (0 - lowerConstant) / lowerSlope; // 0 = ax + b, for a = lowerSlope, b = lowerConstant and y = 0 -> no negative values
const upperBoundX = (1 - upperConstant) / upperSlope; // 0 = ax + b, for a = upperSlope, b = upperConstant and y = 1 -> no values over 1

export function getTotalScore(finalScore) {
  let multipleChoice = finalScore.multipleChoice;
  let numberGuess = finalScore.numberGuess;
  let mapPointGuess = finalScore.mapPointGuess;
  let totalScore = (multipleChoice.numberQuestions * multipleChoice.multiplicator) 
      + (numberGuess.numberQuestions * numberGuess.multiplicator)
      + (mapPointGuess.numberQuestions * mapPointGuess.multiplicator);
  return totalScore;
}

export function getAchievedScore(finalScore) {
  return Math.round(finalScore.multipleChoice.sumPoints + finalScore.numberGuess.sumPoints + finalScore.mapPointGuess.sumPoints);
}

export function getScorePerQuestion(guessQuality, multiplicator) {
  if (guessQuality < lowerBoundX) {
    return 0;
  } else if (lowerBoundX <= guessQuality && guessQuality <= turningPoint) {
    return multiplicator * (lowerSlope * guessQuality - ((lowerSlope * turningPoint) - turningPoint));
  } else if (turningPoint < guessQuality && guessQuality <= upperBoundX) {
    return multiplicator * (upperSlope * guessQuality - ((upperSlope * turningPoint) - turningPoint));
  } else if (guessQuality > upperBoundX) {
    return 10;
  }
}

export function renderFinalScoreText(finalScore, element) {
  let lastCardTitleElement = element.querySelector('.q-quiz-last-card-title');
  let totalScore = getTotalScore(finalScore);
  let achievedScore = getAchievedScore(finalScore);
  // this is a hack, we will fix it properly with resolving issue 29 https://github.com/nzzdev/Q-quiz/issues/29
  if (achievedScore > totalScore) {
    achievedScore = totalScore;
  }
  lastCardTitleElement.innerHTML = `Sie haben ${achievedScore} von ${totalScore} möglichen Punkten erzielt.` 
}

export function getFinalScoreTitle(finalScore) {
  let totalScore = getTotalScore(finalScore);
  let achievedScore = getAchievedScore(finalScore);
  let percentageScore = achievedScore / totalScore;
  if (percentageScore < 0.2) {
    return '😱';
  } else if (percentageScore < 0.5) {
    return '😕';
  } else if (percentageScore < 0.8) {
    return '🙂';
  } else if (percentageScore < 1.0) {
    return '👏👏👏';
  } else {
    return '👏👏👏👏👏';
  }
}
