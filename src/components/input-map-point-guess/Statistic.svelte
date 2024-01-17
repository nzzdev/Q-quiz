<script lang="ts">
  import L, { Marker } from 'leaflet';
  import { onMount } from 'svelte';

  import type { MapPointGuess } from '@src/interfaces';
  import { QuizElementType } from '@src/enums';

  import { getAnswerTextElement } from '@src/services/answer-text-service';
  import { StatisticCalculator } from '@src/services/statistic-calculator-service';

  export let element: MapPointGuess;
  export let userAnswer: Marker<any>;
  export let toolBaseUrl: string;

  let distance: number;
  let textElement: HTMLSpanElement;
  let isCorrectAnswer: boolean;

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
      .then((answers) => {
        const statistic = StatisticCalculator.mapPointGuess(answers, distance);
        console.log('statistic', statistic);
        console.log(textElement);
        textElement = getAnswerTextElement(statistic, distance === 0, diffText);
        console.log('textElement', textElement);
      })
      .catch((error) => {
        console.log('error', error);
      });
  });

  const diffText = () => {
    let answer = element.answer;

    console.log('distance', distance);
    if (distance !== undefined) {
      let distanceText = getDistanceText(distance);
      console.log('distanceText', distanceText);
      return ` Ihre Schätzung liegt um ${distanceText} daneben.`;
    }
    return '';
  };

  function getDistanceText(distance: number) {
    if (distance > 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    } else {
      return `${distance} m`;
    }
  }
</script>

<p class="q-quiz-result-answer-text s-font-text-s">
  {#if textElement}
    <span bind:this={textElement}> </span>
  {/if}
</p>
