<script lang="ts">
  import { QuizElementType } from '@src/enums';
  import type {
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
  import QuestionNumberSlider from './QuestionNumberSlider.svelte';
  import InputMapPointGuess from '../input-map-point-guess/Question.svelte';
  import QuestionInputMultipleChoice from '../input-multiple-choice/Question.svelte';

  export let element: MultipleChoice | MapPointGuess | NumberPoll | NumberGuess;
  export let containerWidth: number;
  export let mapConfiguration: MapConfiguration;
  export let enrico: Enrico;
  export let imageServiceUrl: string;
  export let toolBaseUrl: string;
  export let togglenNextButton: () => void;
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
{#if element.type === QuizElementType.NumberPoll}
  <QuestionNumberSlider question={element} />
{:else if element.type === QuizElementType.NumberGuess}
  <QuestionNumberSlider question={element} />
{:else if element.type === QuizElementType.MapPointGuess}
  <InputMapPointGuess {element} {mapConfiguration} {enrico} {toolBaseUrl} />
{:else if element.type === QuizElementType.MultipleChoice}
  <QuestionInputMultipleChoice {element} {toolBaseUrl} {togglenNextButton} />
{/if}
<!-- TODO: Result answer text-->
