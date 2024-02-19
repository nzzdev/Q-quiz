<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import L, { Marker } from 'leaflet';

  import type {
    MapPointGuess,
    MapPointGuessStatistic,
    Statistic,
    QuizStoreContext,
  } from '@src/interfaces';
  import { QuizElementType } from '@src/enums';

  import { StatisticCalculator } from '@src/services/statistic-calculator-service';
  import AnswerText from '../AnswerText.svelte';
  import Heatmap from '../Heatmap.svelte';
  import key from '../../services/key-service';

  const { quizStore } = getContext(key) as QuizStoreContext;

  export let element: MapPointGuess;
  export let userAnswer: Marker<any>;
  export let map: L.Map;

  let distance: number;
  let isCorrectAnswer: boolean;
  let statistic: Statistic;
  let data: MapPointGuessStatistic[];

  onMount(() => {
    const correctLatLng = new L.LatLng(
      element.answer.geometry.coordinates[1],
      element.answer.geometry.coordinates[0]
    );
    distance = Math.floor(userAnswer.getLatLng().distanceTo(correctLatLng));
    isCorrectAnswer = distance === 0;
    fetch(
      `${$quizStore.configuration.toolBaseUrl}/answers/${QuizElementType.MapPointGuess}/${element.id}`
    )
      .then((response) => response.json())
      .then((answers: MapPointGuessStatistic[]) => {
        data = answers;
        statistic = StatisticCalculator.mapPointGuess(answers, distance);
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
    <Heatmap {map} {data} />
  {/if}
  {#if distance !== undefined}
    <p>Ihre Schätzung liegt um {getDistanceText(distance)} daneben.</p>
  {/if}
</p>
