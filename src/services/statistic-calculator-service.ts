import type { NumberOfAnswersPerChoice, Statistic } from '@src/interfaces';

export class StatisticCalculator {
  public static numberGuess(
    answersStats: NumberOfAnswersPerChoice[],
    correctAnswer: number,
    userAnswer: number
  ): Statistic {
    let betterThanCount;
    let numberOfSameAnswers;
    let diffPercentage;

    let totalAnswers = answersStats.reduce((prev, current) => {
      return prev + current.value;
    }, 0);

    if (userAnswer) {
      betterThanCount = answersStats.reduce((prev, current) => {
        if (
          Math.abs(correctAnswer - current.value) >
          Math.abs(correctAnswer - userAnswer)
        ) {
          return prev + current.value;
        }
        return prev;
      }, 0);

      numberOfSameAnswers = answersStats.reduce((prev, current) => {
        if (userAnswer === current.value) {
          return prev + current.value - 1;
        }
        return prev;
      }, 0);

      diffPercentage = Math.abs(
        Math.round((Math.abs(correctAnswer - userAnswer) / correctAnswer) * 100)
      );
    }

    return {
      betterThanPercentage:
        betterThanCount !== undefined
          ? Math.round((betterThanCount / totalAnswers) * 100)
          : undefined,
      betterThanCount: betterThanCount,
      diffPercentage: diffPercentage,
      numberOfSameAnswers: numberOfSameAnswers,
      totalAnswers: totalAnswers,
    };
  }

  public static numberPoll(
    answersStats: NumberOfAnswersPerChoice[],
    userAnswer: number
  ): Statistic {
    let numberOfSameAnswers;

    let totalAnswers = answersStats.reduce((prev, current) => {
      return prev + current.value;
    }, 0);

    if (userAnswer) {
      numberOfSameAnswers = answersStats.reduce((prev, current) => {
        if (userAnswer === current.value) {
          return prev + current.value - 1;
        }
        return prev;
      }, 0);
    }

    return {
      numberOfSameAnswers: numberOfSameAnswers,
      totalAnswers: totalAnswers,
    };
  }

  // TODO: Save answer first and then calculate stats, or calculate stats (and than calculate new answer too) and then save answer?
  public static multipleChoiceStats(
    answersStats: NumberOfAnswersPerChoice[]
  ): Statistic {
    let totalAnswers = answersStats.reduce((prev: number, current) => {
      return (prev += current.value);
    }, 0);
    return {
      totalAnswers: totalAnswers,
      numberOfAnswersPerChoice: answersStats,
    };
  }

  // @ts-ignore
  // TODO
  public static mapPointGuess(
    answersStats: NumberOfAnswersPerChoice[], // @ts-ignore
    userAnswer
  ): Statistic {
    let betterThanCount = 0;
    let numberOfSameAnswers;

    let totalAnswers = answersStats.reduce((prev: number, current) => {
      return (prev += current.value);
    }, 0);

    if (userAnswer) {
      betterThanCount =
        answersStats.find((answer) => answer.key > userAnswer)?.value || 0;
      numberOfSameAnswers =
        answersStats.find((answer) => answer.key === userAnswer)?.value || 0;
    }

    return {
      betterThanCount: betterThanCount,
      betterThanPercentage: Math.floor((betterThanCount / totalAnswers) * 100),
      numberOfSameAnswers: numberOfSameAnswers,
      totalAnswers: totalAnswers,
    };
  }
}