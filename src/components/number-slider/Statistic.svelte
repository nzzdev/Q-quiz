<script lang="ts">
  import { onMount } from 'svelte';

  import { containerWidthStore } from '@src/store/container.store';
  import { QuizElementType } from '@src/enums';
  import type {
    NumberGuess,
    NumberOfAnswersPerChoice,
    SliderQuestion,
  } from '@src/interfaces';
  import Scale from '@src/services/scale';

  import BarchartSvg from './BarchartSvg.svelte';
  import StripplotSvg from './StripplotSvg.svelte';

  export let element: SliderQuestion;
  export let userAnswer: number;
  export let toolBaseUrl: string;

  let answers: NumberOfAnswersPerChoice[];
  let numberOfPossibleAnswers: number;
  let steppedValues: number[] = [];
  let stepWidth: number;
  let correctAnswerStyle: string = '';
  let userAnswerStyle: string = '';

  $: correctAnswer = (element as NumberGuess).answer;
  $: setup($containerWidthStore);

  onMount(() => {
    fetch(`${toolBaseUrl}/answers/${element.type}/${element.id}`)
      .then((response) => response.json())
      .then((results: NumberOfAnswersPerChoice[]) => {
        if (element.type === QuizElementType.NumberGuess) {
          answers = results as NumberOfAnswersPerChoice[];
        } else if (element.type === QuizElementType.NumberPoll) {
          answers = results as NumberOfAnswersPerChoice[];
        } else {
          new Error('Wrong type of question');
        }
        containerWidthStore;
        setup($containerWidthStore);
      })
      .catch((error) => {
        console.log('error', error);
      });
  });

  function setup(containerWidth: number) {
    numberOfPossibleAnswers = (element.max - element.min) / element.step;
    // initial steppedValue
    const factor = 100 / (element.max - element.min + 1);
    for (let i = element.min; i <= element.max; i += element.step) {
      steppedValues.push(factor * i);
    }
    stepWidth = containerWidth / steppedValues.length;

    // set position of marker
    let range = [];

    for (let i = 0; i < steppedValues.length; i++) {
      range.push(steppedValues[i] - 100 / steppedValues.length / 2);
    }
    let xScale = new Scale([element.min, element.max], range);
    if (element.type === QuizElementType.NumberGuess) {
      correctAnswerStyle = getAnswerPosition(correctAnswer, xScale);
    }
    userAnswerStyle = getAnswerPosition(userAnswer, xScale);
  }

  function getAnswerPosition(answer: number, xScale: Scale) {
    if (answer - element.min > (element.max - element.min) / 2) {
      let rightPos = (
        (xScale.range.length - xScale.getIndexOnScale(answer) - 1) * stepWidth +
        stepWidth / 2 +
        1
      ).toFixed(1);
      return `right: ${rightPos}px`;
    } else {
      let leftPos = (
        (xScale.getIndexOnScale(answer) + 1) * stepWidth -
        stepWidth / 2 +
        1
      ).toFixed(1);
      return `left: ${leftPos}px`;
    }
    return '';
  }

  // TODO:
  function getUnit(correctAnswer: number) {
    let unit = element.unit;
    if (
      correctAnswer === 1 &&
      element.unit_sinpular &&
      element.unit_sinpular !== ''
    ) {
      unit = element.unit_sinpular;
    }
    return unit;
  }
</script>

{#if answers}
  <div class="q-quiz-result__number-guess-visual q-quiz-result">
    {#if element.type === QuizElementType.NumberGuess}
      <div
        class:q-quiz-result__number-guess-visual__text--right={correctAnswerStyle.startsWith(
          'right'
        )}
        class="q-quiz-result__number-guess-visual__text q-quiz-result__number-guess-visual__text--bottom s-color-gray-8"
        style={correctAnswerStyle}
      >
        <div
          class="q-quiz-result__number-guess-visual__text__label s-font-note s-color-gray-8"
        >
          Korrekte Antwort
          <div class="s-font-note--strong">{correctAnswer}</div>
        </div>
        <div
          class:q-quiz-result__number-guess-visual__text__marker--few-answers={steppedValues.length <=
            100}
          class="q-quiz-result__number-guess-visual__text__marker"
          style="width: {steppedValues.length <= 100 ? stepWidth : 'unset'}px"
        ></div>
      </div>
    {/if}
    <div
      class:q-quiz-result__number-guess-visual__text--right={userAnswerStyle.startsWith(
        'right'
      )}
      class="q-quiz-result__number-guess-visual__text q-quiz-result__number-guess-visual__text--top s-color-primary-7"
      style="position: absolute; {userAnswerStyle}"
    >
      <div
        class="q-quiz-result__number-guess-visual__text__label s-font-note s-color-primary-7"
      >
        Ihre Schätzung
        <div class="s-font-note--strong s-font-note--tabularnums">
          {userAnswer}
        </div>
      </div>
      <div
        class:q-quiz-result__number-guess-visual__text__marker--few-answers={steppedValues.length <=
          100}
        class="q-quiz-result__number-guess-visual__text__marker"
        style="width: {steppedValues.length <= 100 ? stepWidth : 'unset'}px"
      ></div>
    </div>
    <div class="q-quiz-result__number-guess-visual__stats-graphic-container">
      {#if numberOfPossibleAnswers <= 100}
        <BarchartSvg data={element} statistics={answers} />
      {:else}
        <StripplotSvg data={element} statistics={answers} />
      {/if}
    </div>
    <p class="q-quiz-result-answer-text s-font-text-s"></p>
  </div>
{/if}
