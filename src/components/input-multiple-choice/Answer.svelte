<script lang="ts">
  import { onMount } from 'svelte';
  import checkmark from '../../resources/checkmark.svg';
  import crossmaker from '../../resources/crossmark.svg';
  import { QuizElementType } from '@src/enums';

  import { StatisticCalculator } from '@src/services/statistic-calculator-service';
  import type { NumberOfAnswersPerChoice, Statistic } from '@src/interfaces';
  import StatisticView from './Statistic.svelte';

  export let id: string;
  export let answers: string[];
  export let userAnswer: string;
  export let correctAnswer: string;
  export let toolBaseUrl: string;

  let statistic: Statistic;

  onMount(() => {
    fetch(`${toolBaseUrl}/answers/${QuizElementType.MultipleChoice}/${id}`)
      .then((response) => response.json())
      .then(
        (answers: NumberOfAnswersPerChoice[]) =>
          (statistic = StatisticCalculator.multipleChoiceStats(answers))
      )
      .catch((error) => {
        console.log('error', error);
      });
  });

  $: getHighestAnswerCount = (): number => {
    if (!statistic || !statistic.numberOfAnswersPerChoice) {
      return 0;
    }
    return statistic.numberOfAnswersPerChoice.reduce(
      (highestAnswerCount: number, statisticAnswer) => {
        if (statisticAnswer.value > highestAnswerCount) {
          return statisticAnswer.value;
        }
        return highestAnswerCount;
      },
      0
    );
  };

  $: statisticAnswerCount = (answer: string): number => {
    const actualAnswers = statistic?.numberOfAnswersPerChoice?.find(
      (statisticAnswer) => statisticAnswer.key === answer
    );

    if (actualAnswers) {
      return actualAnswers.value;
    }
    return 0;
  };
</script>

<div class="q-quiz-result">
  <div class="q-quiz-result-visual q-quiz-result-visual--multiple-choice">
    {#each answers as answer}
      <div
        class:s-font-note--strong={answer === correctAnswer ||
          (answer === userAnswer && correctAnswer !== userAnswer)}
        class:s-color-positive={answer == correctAnswer}
        class:s-color-negative={answer === userAnswer &&
          correctAnswer !== userAnswer}
        class="q-quiz-result__answer s-font-note"
      >
        <div class="label">
          {#if answer == correctAnswer && correctAnswer === userAnswer}
            <div class="label__icon">{@html checkmark}</div>
          {:else if answer === userAnswer && correctAnswer !== userAnswer}
            <div class="label__icon">{@html crossmaker}</div>
          {/if}
          <div>{answer}</div>
          {#if answer == correctAnswer || (answer === userAnswer && correctAnswer !== userAnswer)}
            <div class="label__hint">
              {answer === correctAnswer
                ? 'korrekte Antwort'
                : 'falsche Antwort'}
            </div>
          {/if}
        </div>
        <StatisticView
          statisticAnswerCount={statisticAnswerCount(answer)}
          highestAnswerCount={getHighestAnswerCount()}
          totalAnswers={statistic?.totalAnswers || 0}
          disableGreyColor={answer == correctAnswer ||
            (answer === userAnswer && correctAnswer !== userAnswer)}
        />
      </div>
    {/each}
  </div>
  <p class="q-quiz-result-answer-text s-font-text-s"></p>
</div>

<style lang="scss">
  .q-quiz-result__answer {
    width: calc(100% - 40px);
    margin-top: 10px;

    span {
      margin-right: 5px;
    }
  }

  .label {
    display: flex;
    align-items: center;

    &__icon {
      width: 16px;
      height: 16px;
      margin-right: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__hint {
      margin-left: 5px;
    }
  }

  .q-quiz-result__answer__checkmark {
    position: relative;
    top: 3px;
    margin-right: 4px;
  }

  .q-quiz-result__multiple-choice-bar {
    width: 0;
    height: 16px;
    background: currentColor;
    position: relative;

    transition: width 0.15s ease-out;

    span {
      position: absolute;
      right: -40px;
      text-align: right;
      white-space: nowrap;
      &.q-quiz-result-mc-answer-is-zero {
        left: 0;
        right: auto;
        text-align: left;
      }
    }
  }

  .q-quiz-result-visual--multiple-choice {
    margin-bottom: 20px;
  }
</style>
