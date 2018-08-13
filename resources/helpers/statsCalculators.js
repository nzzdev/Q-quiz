class NumberGuessStatsCalculator {
  constructor(answersStats, correctAnswer, userAnswer) {
    this.answersStats = answersStats;
    this.correctAnswer = correctAnswer;
    this.userAnswer = userAnswer;
  }

  getStats() {
    let betterThanCount;
    let numberOfSameAnswers;
    let diffPercentage;

    let totalAnswers = this.answersStats.reduce((prev, current) => {
      return prev + current.count;
    }, 0);

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
      totalAnswers: totalAnswers
    };
  }
}

class MultipleChoiceStatsCalculator {
  constructor(answersStats, correctAnswer, userAnswer) {
    this.answersStats = answersStats;
    this.correctAnswer = correctAnswer;
    this.userAnswer = userAnswer;
  }

  getStats() {
    let numberOfAnswersPerChoice = {};

    let totalAnswers = this.answersStats.reduce((prev, current) => {
      return prev + current.count;
    }, 0);

    this.answersStats.map(answer => {
      numberOfAnswersPerChoice[answer.value] = answer.count;
    });

    return {
      totalAnswers: totalAnswers,
      numberOfAnswersPerChoice: numberOfAnswersPerChoice
    };
  }
}

class MapPointGuessStatsCalculator {
  constructor(answersStats, correctAnswer, userAnswer) {
    this.answersStats = answersStats;
    this.correctAnswer = correctAnswer;
    this.userAnswer = userAnswer;
  }

  getStats() {
    let betterThanCount;
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
        if (this.userAnswer.value === current.value.distance) {
          return prev + current.count - 1;
        }
        return prev;
      }, 0);
    }

    return {
      betterThanCount: betterThanCount,
      betterThanPercentage: Math.floor((betterThanCount / totalAnswers) * 100),
      numberOfSameAnswers: numberOfSameAnswers,
      totalAnswers: totalAnswers
    };
  }
}

module.exports = {
  numberGuess: NumberGuessStatsCalculator,
  multipleChoice: MultipleChoiceStatsCalculator,
  mapPointGuess: MapPointGuessStatsCalculator
};
