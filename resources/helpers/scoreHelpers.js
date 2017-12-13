const turf = require('@turf/turf');
const scoreConstants = require('./scoreConstants.js');

function calculateWorstAnswerDifference(question) {
  if (question.type === 'numberGuess') {
    return Math.max((question.answer - question.min), (question.max - question.answer));
  }
  if (question.type === 'mapPointGuess') {
    const bbox = question.answer.bbox;
    const correctAnswerCoord = question.answer.geometry.coordinates;
    
    const pointNorthWest = turf.point([bbox[3], bbox[0]]);
    const pointSouthWest = turf.point([bbox[1], bbox[0]]);
    const pointNorthEast = turf.point([bbox[3], bbox[2]]);
    const pointSouthEast = turf.point([bbox[1], bbox[2]]);
    const correctAnswer = turf.point([correctAnswerCoord[1], correctAnswerCoord[0]]);
    const distanceOptions = {
      units: 'kilometers'
    }
    return Math.max(
      turf.distance(pointNorthWest, correctAnswer, distanceOptions), 
      turf.distance(pointSouthWest, correctAnswer, distanceOptions), 
      turf.distance(pointNorthEast, correctAnswer, distanceOptions), 
      turf.distance(pointSouthEast, correctAnswer, distanceOptions)
    ) * 1000;
  }
  return undefined;
}

function initializeScoreInfo(questions) {
  const score = {
    maxScore: 0,
    questions: [] 
  };
  for (const question of questions) {
    score.questions.push({
      type: question.type,
      correctAnswer: question.answer,
      worstAnswerDifference: calculateWorstAnswerDifference(question),
      achievedScore: 0
    })
    score.maxScore += scoreConstants.multiplicator[question.type]
  }
  return score;
}

function calculateAchievedScore(guessQuality, questionType) {
  const turningPoint = 0.6; // x=y
  // slope was pre-calculated with a defined point of worst estimation quality of (0.08, 0)
  const lowerSlope = 0.6 / 0.52;
  const lowerConstant = -(lowerSlope * turningPoint) + turningPoint; // y = ax + b, for a = lowerSlope and (x,y) = turningPoint
  
  // slope was pre-calculated with a defined point of best estimation quality of (0.9, 0.98)
  const upperSlope = 0.38 / 0.3;
  const upperConstant = -(upperSlope * turningPoint) + turningPoint; // y = ax + b, for a = upperSlope and (x,y) = turningPoint
  
  const lowerBoundX = (0 - lowerConstant) / lowerSlope; // 0 = ax + b, for a = lowerSlope, b = lowerConstant and y = 0 -> no negative values
  const upperBoundX = (1 - upperConstant) / upperSlope; // 0 = ax + b, for a = upperSlope, b = upperConstant and y = 1 -> no values over 1

  const multiplicator = scoreConstants.multiplicator[questionType];

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

module.exports = {
  initializeScoreInfo: initializeScoreInfo,
  getAchievedScore: calculateAchievedScore
};
