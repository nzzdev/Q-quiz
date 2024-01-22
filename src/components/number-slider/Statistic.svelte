<script lang="ts">
  import { QuizElementType } from '@src/enums';
  import type {
    NumberGuess,
    NumberOfAnswersPerChoice,
    NumberPoll,
    SliderQuestion,
    Statistic,
  } from '@src/interfaces';
  import { StatisticCalculator } from '@src/services/statistic-calculator-service';
  import { onMount } from 'svelte';
  import BarchartSvg from './BarchartSvg.svelte';
  import StripplotSvg from './StripplotSvg.svelte';

  export let element: SliderQuestion;
  export let userAnswer: number;
  export let toolBaseUrl: string;

  let answers: NumberOfAnswersPerChoice[];
  let numberOfPossibleAnswers: number;

  onMount(() => {
    fetch(`${toolBaseUrl}/answers/${element.type}/${element.id}`)
      .then((response) => response.json())
      .then((results: NumberOfAnswersPerChoice[]) => {
        if (element.type === QuizElementType.NumberGuess) {
          const numberGuessElement = element as NumberGuess;
          const statistic = StatisticCalculator.numberGuess(
            results,
            numberGuessElement.answer,
            userAnswer
          );
          answers = results as NumberOfAnswersPerChoice[];
        } else if (element.type === QuizElementType.NumberPoll) {
          const statistic = StatisticCalculator.numberPoll(answers, userAnswer);
          answers = results as NumberOfAnswersPerChoice[];
        } else {
          new Error('Wrong type of question');
        }
        numberOfPossibleAnswers = (element.max - element.min) / element.step;
      })
      .catch((error) => {
        console.log('error', error);
      });
  });
</script>

<!-- {#if numberOfPossibleAnswers <= 100} -->
{#if answers}
  <BarchartSvg data={element} statistics={answers} chartWidth={500} />
{/if}
<!-- {:else} -->
<!-- <StripplotSvg data={element} statistics={answers} plotWidth={500} />
{/if} -->
