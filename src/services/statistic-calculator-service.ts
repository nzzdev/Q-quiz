import type { Statistic } from '@src/interfaces';
import type { AnswerStatistic } from '@src/types';

export class StatisticCalculator {
  // @ts-ignore
  // TODO
  public static numberGuess(
    answersStats: AnswerStatistic[], // @ts-ignore
    correctAnswer, // @ts-ignore
    userAnswer
  ) {
    const answersStatsConvert = answersStats as number[];
    let betterThanCount;
    let numberOfSameAnswers;
    let diffPercentage;

    // @ts-ignore
    // TODO
    let totalAnswers = answersStats.length;

    if (userAnswer) {
      // @ts-ignore
      // TODO
      betterThanCount = answersStatsConvert.filter(
        (answer: number) =>
          Math.abs(correctAnswer - answer) >
          Math.abs(correctAnswer - userAnswer.value)
      ).length;

      // @ts-ignore
      // TODO

      numberOfSameAnswers = answersStatsConvert.filter(
        (answers) => userAnswer.value === answers
      ).length;

      diffPercentage = Math.abs(
        Math.round(
          (Math.abs(correctAnswer - userAnswer.value) / correctAnswer) * 100
        )
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

  // @ts-ignore
  // TODO
  public static numberPoll(
    answersStats: AnswerStatistic[], // @ts-ignore
    correctAnswer, // @ts-ignore
    userAnswer
  ) {
    let numberOfSameAnswers;

    // @ts-ignore
    // TODO
    let totalAnswers = answersStats.reduce((prev, current) => {
      // @ts-ignore
      return prev + current.count;
    }, 0);

    if (userAnswer) {
      // @ts-ignore
      // TODO
      numberOfSameAnswers = answersStats.reduce((prev, current) => {
        // @ts-ignore
        if (userAnswer.value === current.value) {
          // @ts-ignore
          return prev + current.count - 1;
        }
        return prev;
      }, 0);
    }

    return {
      numberOfSameAnswers: numberOfSameAnswers,
      totalAnswers: totalAnswers,
    };
  }

  // @ts-ignore
  // TODO
  public static multipleChoiceStats(
    answersStats: AnswerStatistic[], // @ts-ignore
    correctAnswer, // @ts-ignore
    userAnswer
  ) {
    let numberOfAnswersPerChoice = {};

    // @ts-ignore
    // TODO
    let totalAnswers = answersStats.reduce((prev, current) => {
      // @ts-ignore
      return prev + current.count;
    }, 0);

    // @ts-ignore
    // TODO
    answersStats.map((answer) => {
      // @ts-ignore
      // TODO
      numberOfAnswersPerChoice[answer.value] = answer.count;
    });

    return {
      totalAnswers: totalAnswers,
      numberOfAnswersPerChoice: numberOfAnswersPerChoice,
    };
  }

  // @ts-ignore
  // TODO
  public static mapPointGuess(
    answersStats: AnswerStatistic[], // @ts-ignore
    userAnswer
  ): Statistic {
    const answersStatsConvert = answersStats as number[];
    let betterThanCount = 0;
    let numberOfSameAnswers;

    console.log('answersStats', answersStats);
    console.log('userAnswer', userAnswer);

    let totalAnswers = answersStatsConvert.length;

    if (userAnswer) {
      betterThanCount = answersStatsConvert.filter(
        (answer: number) => answer > userAnswer
      ).length;
      numberOfSameAnswers = answersStatsConvert.filter(
        (answer: number) => answer === userAnswer
      ).length;
    }

    return {
      betterThanCount: betterThanCount,
      betterThanPercentage: Math.floor((betterThanCount / totalAnswers) * 100),
      numberOfSameAnswers: numberOfSameAnswers,
      totalAnswers: totalAnswers,
    };
  }
}
