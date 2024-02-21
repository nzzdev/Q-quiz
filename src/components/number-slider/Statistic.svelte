<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import Scale from '@src/services/scale';
  import key from '@src/services/key-service';
  import type {
    NumberGuess,
    NumberOfAnswersPerChoice,
    SliderQuestion,
    QuizStoreContext,
  } from '@src/interfaces';
  import { QuizElementType } from '@src/enums';

  import BarchartSvg from './BarchartSvg.svelte';
  import StripplotSvg from './StripplotSvg.svelte';

  export let element: SliderQuestion;
  export let userAnswer: number;
  export let toolBaseUrl: string;
  //TODO: remove
  export let log: string;

  const { containerWidthStore } = getContext(key) as QuizStoreContext;

  let answers: NumberOfAnswersPerChoice[];
  let numberOfPossibleAnswers: number;
  let steppedValues: number[] = [];
  let stepWidth: number;
  let correctAnswerStyle: string = '';
  let userAnswerStyle: string = '';
  let labelText = 'Ihre Antwort';

  $: correctAnswer = (element as NumberGuess).answer;
  $: setup($containerWidthStore);

  onMount(() => {
    if (element.type === QuizElementType.NumberPoll) {
      labelText = 'Ihre Schätzung';
    }

    //TODO: remove
    log += 'statistic\n';
    fetch(`${toolBaseUrl}/answers/${element.type}/${element.id}`)
      .then((response) => response.json())
      .then((results: NumberOfAnswersPerChoice[]) => {
        //TODO: remove
        log += 'request success\n';
        if (element.type === QuizElementType.NumberGuess) {
          answers = results;
        } else if (element.type === QuizElementType.NumberPoll) {
          answers = results;
        } else {
          new Error('Wrong type of question');
        }
        //TODO: remove
        log += 'setup\n';
        setup($containerWidthStore);
        //TODO: remove
        log += '/setup\n';
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
  }
</script>

{#if answers}
  <div class="q-quiz-result__number-guess-visual q-quiz-result">
    {#if numberOfPossibleAnswers <= 100}
      <BarchartSvg
        data={element}
        statistics={answers}
        {correctAnswer}
        {userAnswer}
        {labelText}
      />
    {:else}
      <StripplotSvg
        data={element}
        statistics={answers}
        {correctAnswer}
        {userAnswer}
        {labelText}
      />
    {/if}
    <p class="q-quiz-result-answer-text s-font-text-s"></p>
  </div>
{/if}

<style lang="scss">
  $q-quiz-result__number-guess-visual__stats-graphic-height: 60px;
  $q-quiz-result__number-guess-visual__stats-graphic-top: 55px;

  .q-quiz-result__number-guess-visual__text__marker--few-answers {
    height: 3px;
    top: $q-quiz-result__number-guess-visual__stats-graphic-top + 57px;

    transform: translateX(-50%);
  }

  .q-quiz-result__number-guess-visual__text__marker {
    position: relative;

    display: block;
    width: 3px;
    height: $q-quiz-result__number-guess-visual__stats-graphic-height;
    background: currentColor;
    position: absolute;
    top: $q-quiz-result__number-guess-visual__stats-graphic-top;
    left: -1px;

    // contains the small line towards the correct answer / user answer line
    &::before {
      content: '';
      display: block;
      position: absolute;
      width: 1px;
      height: 8px;
      background-color: currentColor;
      top: -16px;
      left: 50%;
    }
  }
</style>
