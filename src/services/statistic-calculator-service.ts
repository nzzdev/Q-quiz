import type {
  NumberOfAnswersPerChoice,
  Statistic,
  StatisticView,
} from '@src/interfaces';
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

  // TODO: Save answer first and then calculate stats, or calculate stats (and than calculate new answer too) and then save answer?
  public static multipleChoiceStats(answersStats: NumberOfAnswersPerChoice[]) {
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
