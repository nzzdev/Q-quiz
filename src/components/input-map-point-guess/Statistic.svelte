<script lang="ts">
  import L, { Marker } from 'leaflet';
  import { onMount } from 'svelte';

  import type {
    MapPointGuess,
    NumberOfAnswersPerChoice,
    Statistic,
    StatisticView,
  } from '@src/interfaces';
  import { QuizElementType } from '@src/enums';

  import { StatisticCalculator } from '@src/services/statistic-calculator-service';
  import AnswerText from '../AnswerText.svelte';

  export let element: MapPointGuess;
  export let userAnswer: Marker<any>;
  export let toolBaseUrl: string;

  let distance: number;
  let isCorrectAnswer: boolean;
  let statistic: Statistic;

  onMount(() => {
    const correctLatLng = new L.LatLng(
      element.answer.geometry.coordinates[1],
      element.answer.geometry.coordinates[0]
    );
    distance = Math.floor(userAnswer.getLatLng().distanceTo(correctLatLng));
    isCorrectAnswer = distance === 0;
    fetch(
      `${toolBaseUrl}/answers/${QuizElementType.MapPointGuess}/${element.id}`
    )
      .then((response) => response.json())
      .then((answers: NumberOfAnswersPerChoice[]) => {
        statistic = StatisticCalculator.mapPointGuess(answers, distance);
      })
      .catch((error) => {
        console.log('error', error);
      });
  });

  function getDistanceText(distance: number) {
    if (distance > 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    } else {
      return `${distance} m`;
    }
  }
</script>

<p class="q-quiz-result-answer-text s-font-text-s">
  {#if statistic}
    <AnswerText {statistic} {isCorrectAnswer} />
  {/if}
  {#if distance !== undefined}
    <p>Ihre Schätzung liegt um {getDistanceText(distance)} daneben.</p>
  {/if}
</p>
