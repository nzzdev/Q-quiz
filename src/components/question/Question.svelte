<script lang="ts">
  import { QuizElementType } from '@src/enums';
  import type {
    DBAnswerData,
    DBAnswerMapPointGuessValue,
    Enrico,
    MapConfiguration,
    MapPointGuess,
    MultipleChoice,
    NumberGuess,
    NumberPoll,
  } from '@src/interfaces';

  import QuestionSubtitle from './QuestionSubtitle.svelte';
  import QuestionTitle from './QuestionTitle.svelte';
  import QuestionIntroduction from './QuestionIntroduction.svelte';
  import QuestionImage from './QuestionImage.svelte';
  import QuestionNumberSlider from '../number-slider/Question.svelte';
  import InputMapPointGuess from '../input-map-point-guess/Question.svelte';
  import QuestionInputMultipleChoice from '../input-multiple-choice/Question.svelte';

  export let qItemId: string;
  export let element: MultipleChoice | MapPointGuess | NumberPoll | NumberGuess;
  export let containerWidth: number;
  export let mapConfiguration: MapConfiguration;
  export let enrico: Enrico;
  export let imageServiceUrl: string;
  export let toolBaseUrl: string;
  export let togglenNextButton: () => void;

  function saveAnswer(value: DBAnswerMapPointGuessValue | string) {
    const data: DBAnswerData = {
      itemId: qItemId,
      questionId: element.id,
      type: element.type,
      value,
    };
    fetch(`${toolBaseUrl}/answer`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => {
      console.log('response', response);
    });
  }
</script>

{#if element.introduction}
  <QuestionIntroduction introduction={element.introduction} />
{/if}
{#if element.image && element.image.url}
  <QuestionImage image={element.image} {containerWidth} {imageServiceUrl} />
{/if}
{#if element.question}
  <QuestionTitle title={element.question} />
{/if}
{#if element.type === QuizElementType.NumberPoll}
  <QuestionSubtitle subtitle={element.questionSubTitle} />
{/if}
{#if element.type === QuizElementType.NumberPoll || element.type === QuizElementType.NumberGuess}
  <QuestionNumberSlider {element} {toolBaseUrl} {containerWidth} />
{:else if element.type === QuizElementType.MapPointGuess}
  <InputMapPointGuess
    {element}
    {mapConfiguration}
    {enrico}
    {toolBaseUrl}
    {saveAnswer}
  />
{:else if element.type === QuizElementType.MultipleChoice}
  <QuestionInputMultipleChoice
    {element}
    {toolBaseUrl}
    {togglenNextButton}
    {saveAnswer}
  />
{/if}
<!-- TODO: Result answer text-->
