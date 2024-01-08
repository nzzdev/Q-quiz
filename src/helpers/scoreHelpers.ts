import { multiplicators } from '@src/constants';
import { QuestionType } from '@src/enums';
import type {
  MapPointElement,
  NumberElement,
  QuizeScore,
} from '@src/interfaces';

const turf = require('@turf/turf');

function calculateWorstAnswerDifference(
  question: NumberElement | MapPointElement
) {
  if (question.type === 'numberGuess') {
    const numberAnswer = question as NumberElement;
    return Math.max(
      numberAnswer.answer - numberAnswer.min,
      numberAnswer.max - question.answer
    );
  }
  if (question.type === 'numberPoll') {
    return 1;
  }
  if (question.type === 'mapPointGuess') {
    const mapPointAnswer = question as MapPointElement;
    const bbox = mapPointAnswer.answer.bbox;
    const correctAnswerCoord = mapPointAnswer.answer.geometry.coordinates;

    const pointNorthWest = turf.point([bbox[3], bbox[0]]);
    const pointSouthWest = turf.point([bbox[1], bbox[0]]);
    const pointNorthEast = turf.point([bbox[3], bbox[2]]);
    const pointSouthEast = turf.point([bbox[1], bbox[2]]);
    const correctAnswer = turf.point([
      correctAnswerCoord[1],
      correctAnswerCoord[0],
    ]);

    // there is no meter unit in turf, we use kilometers and multiply with
    // 1000 afterwards to get the needed meters
    const distanceOptions = {
      units: 'kilometers',
    };
    return (
      Math.max(
        turf.distance(pointNorthWest, correctAnswer, distanceOptions),
        turf.distance(pointSouthWest, correctAnswer, distanceOptions),
        turf.distance(pointNorthEast, correctAnswer, distanceOptions),
        turf.distance(pointSouthEast, correctAnswer, distanceOptions)
      ) * 1000
    );
  }
  return undefined;
}

function calculateAchievedScore(
  answerQuality: number,
  questionType: QuestionType
): number {
  const turningPoint = 0.6; // x=y
  // slope was pre-calculated with a defined point of worst estimation quality of (0.08, 0)
  const lowerSlope = 0.6 / 0.52;
  const lowerConstant = -(lowerSlope * turningPoint) + turningPoint; // y = ax + b, for a = lowerSlope and (x,y) = turningPoint

  // slope was pre-calculated with a defined point of best estimation quality of (0.9, 0.98)
  const upperSlope = 0.38 / 0.3;
  const upperConstant = -(upperSlope * turningPoint) + turningPoint; // y = ax + b, for a = upperSlope and (x,y) = turningPoint

  const lowerBoundX = (0 - lowerConstant) / lowerSlope; // 0 = ax + b, for a = lowerSlope, b = lowerConstant and y = 0 -> no negative values
  const upperBoundX = (1 - upperConstant) / upperSlope; // 0 = ax + b, for a = upperSlope, b = upperConstant and y = 1 -> no values over 1

  if (
    questionType !== QuestionType.COVER &&
    questionType !== QuestionType.LAST_CARD
  ) {
    const multiplicator = multiplicators[questionType];

    if (answerQuality < lowerBoundX) {
      return 0;
    } else if (lowerBoundX <= answerQuality && answerQuality <= turningPoint) {
      return (
        multiplicator *
        (lowerSlope * answerQuality -
          (lowerSlope * turningPoint - turningPoint))
      );
    } else if (turningPoint < answerQuality && answerQuality <= upperBoundX) {
      return (
        multiplicator *
        (upperSlope * answerQuality -
          (upperSlope * turningPoint - turningPoint))
      );
    } else if (answerQuality > upperBoundX) {
      return multiplicator;
    }
  }
  // TODO: new, check if this is correct
  return 0;
}

function getNumberGuessResult(question: NumberElement) {
  // Calculate the absolute difference between the correct answer and the user's answer
  // @ts-ignore
  // TODO: check .userAnswer
  const difference = Math.abs(question.answer - question.userAnswer);
  const maxScore = 10;
  const minScore = 0;
  const numberOfPossibleAnswers = (question.max - question.min) / question.step;

  // Calculate the deviation as a percentage of the full range
  const deviation = (difference / (question.max - question.min)) * 100;

  let points =
    maxScore -
    (difference / (numberOfPossibleAnswers * question.step)) * maxScore;

  // Initialize a stepFactor which adjusts the score if there are more than 100 steps in the range
  let stepFactor = 1;

  // Check if there are more than 100 steps in the range and adjust stepFactor accordingly
  if (numberOfPossibleAnswers > 100) {
    stepFactor = Math.min(1, numberOfPossibleAnswers / 100);
  }

  // Score calculation based on deviation from the correct answer
  if (deviation <= 2) {
    points = 10;
  } else if (deviation <= 10) {
    points *= 0.92 * stepFactor;
  } else if (deviation >= 70) {
    points *= 0;
  } else if (deviation >= 60) {
    points *= 0.05;
  } else if (deviation >= 50) {
    points *= 0.1;
  } else if (deviation >= 40) {
    points *= 0.3;
  } else if (deviation >= 30) {
    points *= 0.55;
  } else if (deviation >= 20) {
    points *= 0.75;
  } else if (deviation >= 10) {
    points *= 0.85 * stepFactor;
  }

  return Math.max(minScore, Math.round(points));
}

function getAnswerQuality(question: MapPointElement) {
  let worstAnswerDifference = calculateWorstAnswerDifference(question);
  if (
    question.type === 'multipleChoice' &&
    // @ts-ignore
    // TODO: check .userAnswer
    question.userAnswer === question.answer
  ) {
    return 1;
  }
  if (question.type === 'numberGuess' && worstAnswerDifference !== undefined) {
    return (
      1 -
      // @ts-ignore
      // TODO: check .userAnswer
      Math.abs(question.userAnswer - question.answer) / worstAnswerDifference
    );
  }
  if (question.type === 'numberPoll') {
    return 1;
  }
  if (
    question.type === 'mapPointGuess' &&
    worstAnswerDifference !== undefined
  ) {
    // @ts-ignore
    // TODO: check .userAnswer
    return 1 - question.userAnswer.distance / worstAnswerDifference;
  }
  return 0;
}

function getScoreTitle(scorePercentage: number) {
  if (scorePercentage < 0.2) {
    return '😱';
  } else if (scorePercentage < 0.5) {
    return '😕';
  } else if (scorePercentage < 0.8) {
    return '🙂';
  } else if (scorePercentage < 1.0) {
    return '👏👏👏';
  } else {
    return '👏👏👏👏👏';
  }
}

function calculateScore(questions: (NumberElement | MapPointElement)[]) {
  let score: QuizeScore = {
    maxScore: 0,
    achievedScore: 0,
  };

  questions.forEach((question) => {
    if (
      question.type !== QuestionType.COVER &&
      question.type !== QuestionType.LAST_CARD &&
      // @ts-ignore
      // TODO: check .userAnswer
      question.userAnswer !== undefined
    ) {
      score.maxScore += multiplicators[question.type];

      if (question.type === 'numberGuess') {
        score.achievedScore += getNumberGuessResult(question as NumberElement);
      } else {
        score.achievedScore += calculateAchievedScore(
          getAnswerQuality(question),
          question.type
        );
      }
    }
  });

  score.achievedScore = Math.round(score.achievedScore);
  if (score.achievedScore > score.maxScore) {
    score.achievedScore = score.maxScore;
  }

  let scorePercentage = score.achievedScore / score.maxScore;
  score.lastCardTitle = getScoreTitle(scorePercentage);
  return score;
}

module.exports = {
  calculateScore: calculateScore,
  worstAnswerDifference: calculateWorstAnswerDifference,
};
