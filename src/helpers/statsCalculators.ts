import type { AnswerStatistic } from '@src/interfaces';

// TODO: userAnswer check is needed for all calculators, type is any yet now
// TODO: refactor
export class NumberGuessStatsCalculator {
  constructor(
    private answersStats: AnswerStatistic[],
    private correctAnswer: number,
    private userAnswer: any
  ) {}

  getStats() {
    let betterThanCount;
    let numberOfSameAnswers;
    let diffPercentage;

    let totalAnswers = this.answersStats.reduce((prev, current) => {
      return prev + current.count;
    }, 0);

    // TODO:
    if (this.userAnswer) {
      betterThanCount = this.answersStats.reduce((prev, current) => {
        if (
          Math.abs(this.correctAnswer - current.value) >
          Math.abs(this.correctAnswer - this.userAnswer.value)
        ) {
          return prev + current.count;
        }
        return prev;
      }, 0);

      numberOfSameAnswers = this.answersStats.reduce((prev, current) => {
        if (this.userAnswer.value === current.value) {
          return prev + current.count - 1;
        }
        return prev;
      }, 0);

      diffPercentage = Math.abs(
        Math.round(
          (Math.abs(this.correctAnswer - this.userAnswer.value) /
            this.correctAnswer) *
            100
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
}

export class NumberPollStatsCalculator {
  constructor(
    private answersStats: AnswerStatistic[],
    private correctAnswer: number,
    private userAnswer: any
  ) {
    // for consistency, we keep the correctAnswer argument
  }

  getStats() {
    let numberOfSameAnswers;

    let totalAnswers = this.answersStats.reduce((prev, current) => {
      return prev + current.count;
    }, 0);

    // TODO:
    if (this.userAnswer) {
      numberOfSameAnswers = this.answersStats.reduce((prev, current) => {
        if (this.userAnswer.value === current.value) {
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
}

export class MultipleChoiceStatsCalculator {
  constructor(
    private answersStats: AnswerStatistic[],
    private correctAnswer: string,
    private userAnswer: any
  ) {}

  getStats() {
    // TODO: check
    let numberOfAnswersPerChoice: any = {};

    let totalAnswers = this.answersStats.reduce((prev, current) => {
      return prev + current.count;
    }, 0);

    this.answersStats.map((answer) => {
      numberOfAnswersPerChoice[answer.value] = answer.count;
    });

    return {
      totalAnswers: totalAnswers,
      numberOfAnswersPerChoice: numberOfAnswersPerChoice,
    };
  }
}

export class MapPointGuessStatsCalculator {
  constructor(
    private answersStats: AnswerStatistic[],
    correctAnswer: any, // TODO: refactor
    private userAnswer: any
  ) {}

  getStats() {
    let betterThanCount = 0;
    let numberOfSameAnswers;
    let totalAnswers = this.answersStats.reduce((prev, current) => {
      return prev + current.count;
    }, 0);

    if (this.userAnswer) {
      betterThanCount = this.answersStats.reduce((prev, current) => {
        if (current.value > this.userAnswer.value.distance) {
          return prev + current.count;
        }
        return prev;
      }, 0);

      numberOfSameAnswers = this.answersStats.reduce((prev, current) => {
        // TODO: old code: if (this.userAnswer.value === current.value.distance) { <--- check is distance happens
        if (this.userAnswer.value === current.value) {
          return prev + current.count - 1;
        }
        return prev;
      }, 0);
    }

    return {
      betterThanCount: betterThanCount,
      betterThanPercentage: Math.floor((betterThanCount / totalAnswers) * 100),
      numberOfSameAnswers: numberOfSameAnswers,
      totalAnswers: totalAnswers,
    };
  }
}
