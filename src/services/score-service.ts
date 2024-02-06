import { distance, point, type Units } from '@turf/turf';

import { multiplicators } from '@src/constants';
import { QuizElementType } from '@src/enums';
import type {
  AnswerGeoData,
  MapPointGuess,
  MultipleChoice,
  NumberGuess,
  QuizBaseQuestion,
  QuizeScore,
} from '@src/interfaces';
import type { QuestionScoreTypes } from '@src/types';

/**
 * Represents a service for calculating scores in a quiz
 * for question types like multiple choice, number guess and map point guess.
 *
 */
export class ScoreService {
  private calculateWorstAnswerDifference(question: QuizBaseQuestion) {
    if (question.type === QuizElementType.NumberGuess) {
      const numberGuestQuestion = question as NumberGuess;
      return Math.max(
        numberGuestQuestion.answer - numberGuestQuestion.min,
        numberGuestQuestion.max - numberGuestQuestion.answer
      );
    }
    if (question.type === QuizElementType.MapPointGuess) {
      const mapPointAnswer = question as MapPointGuess;
      const bbox = mapPointAnswer.answer.bbox;
      const correctAnswerCoord = mapPointAnswer.answer.geometry.coordinates;

      const pointNorthWest = point([bbox[3], bbox[0]]);
      const pointSouthWest = point([bbox[1], bbox[0]]);
      const pointNorthEast = point([bbox[3], bbox[2]]);
      const pointSouthEast = point([bbox[1], bbox[2]]);
      const correctAnswer = point([
        correctAnswerCoord[1],
        correctAnswerCoord[0],
      ]);

      // there is no meter unit in turf, we use kilometers and multiply with
      // 1000 afterwards to get the needed meters
      const distanceOptions = {
        units: 'kilometers' as Units,
      };
      return (
        Math.max(
          distance(pointNorthWest, correctAnswer, distanceOptions),
          distance(pointSouthWest, correctAnswer, distanceOptions),
          distance(pointNorthEast, correctAnswer, distanceOptions),
          distance(pointSouthEast, correctAnswer, distanceOptions)
        ) * 1000
      );
    }
    return undefined;
  }

  private calculateAchievedScore(
    answerQuality: number,
    questionType: QuestionScoreTypes
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
    // TODO: new, check if this is correct
    return 0;
  }

  private getNumberGuessResult(question: NumberGuess) {
    // Calculate the absolute difference between the correct answer and the user's answer
    if (question.userAnswer) {
      const userAnswer = question.userAnswer.answer as number;
      const difference = Math.abs(question.answer - userAnswer);
      const maxScore = 10;
      const minScore = 0;
      const numberOfPossibleAnswers =
        (question.max - question.min) / question.step;

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
    // TODO: new, check if this is correct
    return 0;
  }

  // Get the quality of the answer of mulitple choice, number poll and map point guess questions.
  private getAnswerQuality(
    question: QuizBaseQuestion,
    answer: string | number | AnswerGeoData | undefined
  ) {
    const worstAnswerDifference = this.calculateWorstAnswerDifference(question);

    if (question.userAnswer && question.userAnswer.answer) {
      if (
        question.type === QuizElementType.MultipleChoice &&
        question.userAnswer.answer === answer
      ) {
        return 1;
      }
      if (
        question.type === QuizElementType.MapPointGuess &&
        worstAnswerDifference !== undefined
      ) {
        const geoData = question.userAnswer.answer as AnswerGeoData;
        const distance = geoData.distance;
        return 1 - distance / worstAnswerDifference;
      }
    }

    return 0;
  }

  private getScoreTitle(scorePercentage: number) {
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

  public calculateScore(questions: QuizBaseQuestion[]) {
    const score: QuizeScore = {
      maxScore: 0,
      achievedScore: 0,
    };

    questions
      .filter(
        (question) =>
          question.type !== QuizElementType.Cover &&
          question.type !== QuizElementType.LastCard
      )
      .forEach((question) => {
        const questionTyped = question as
          | NumberGuess
          | MultipleChoice
          | MapPointGuess;
        score.maxScore += multiplicators[questionTyped.type];

        if (questionTyped.userAnswer !== undefined) {
          if (questionTyped.type === QuizElementType.NumberGuess) {
            const numberGuessQuestion = questionTyped as NumberGuess;
            score.achievedScore +=
              this.getNumberGuessResult(numberGuessQuestion);
          } else {
            const answerQuality = this.getAnswerQuality(
              questionTyped,
              questionTyped.userAnswer.answer
            );
            score.achievedScore += this.calculateAchievedScore(
              answerQuality,
              questionTyped.type
            );
          }
        }
      });

    score.achievedScore = Math.round(score.achievedScore);
    if (score.achievedScore > score.maxScore) {
      score.achievedScore = score.maxScore;
    }

    const scorePercentage = score.achievedScore / score.maxScore;
    score.lastCardTitle = this.getScoreTitle(scorePercentage);
    return score;
  }
}
