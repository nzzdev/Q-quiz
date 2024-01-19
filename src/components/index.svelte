<script lang="ts">
  import type { QQuizSvelteProperties } from '@src/interfaces';
  import QuestionProgress from './QuestionProgress.svelte';
  import Question from './question/Question.svelte';
  import NextButton from './NextButton.svelte';

  export let componentConfiguration: QQuizSvelteProperties;

  let containerWidth;
  let questionStep = 0;
  let togglenNextButton = () => {};

  $: item = componentConfiguration.item;
  $: imageServiceUrl = componentConfiguration.imageServiceUrl;
  $: enrico = componentConfiguration.enrico;
  $: mapConfiguration = componentConfiguration.mapConfigurtaion;
  $: toolBaseUrl = componentConfiguration.toolBaseUrl;
  $: isMultiQuiz = item.questionCount > 1;
  $: hasCover = item.hasCover;
  $: numberQuestions = item.questionCount;
</script>

<div bind:clientWidth={containerWidth}>
  {#if containerWidth}
    <QuestionProgress
      bind:questionStep
      {hasCover}
      {isMultiQuiz}
      {numberQuestions}
    />

    {#each item.questions as question, index}
      {#if questionStep === index}
        <Question
          element={question}
          {containerWidth}
          {imageServiceUrl}
          {enrico}
          {mapConfiguration}
          {toolBaseUrl}
          {togglenNextButton}
        />
      {/if}
    {/each}
    <NextButton
      bind:questionStep
      bind:togglenNextButton
      {hasCover}
      {numberQuestions}
      isButtonWithIcon={true}
      defaultVisibility={false}
    />
  {/if}
</div>
