<script lang="ts">
  import type { QQuizSvelteProperties } from '@src/interfaces';
  import QuestionProgress from './QuestionProgress.svelte';
  import Question from './question/Question.svelte';
  import NextButton from './NextButton.svelte';
  import Cover from './cover/Cover.svelte';
  import LastCard from './last-card/LastCard.svelte';

  export let componentConfiguration: QQuizSvelteProperties;

  let containerWidth;
  let questionStep = 0;
  let isCoverLeave = false;
  let isLastCardActive = false;
  let togglenNextButton = () => {};

  $: item = componentConfiguration.item;
  $: imageServiceUrl = componentConfiguration.imageServiceUrl;
  $: enrico = componentConfiguration.enrico;
  $: mapConfiguration = componentConfiguration.mapConfigurtaion;
  $: toolBaseUrl = componentConfiguration.toolBaseUrl;
  $: isMultiQuiz = item.questionCount > 1;
  $: hasCover = item.hasCover;
  $: numberQuestions = item.questionCount;

  function toggleLastCardView() {
    isLastCardActive = !isLastCardActive;
  }
</script>

<div bind:clientWidth={containerWidth}>
  {#if containerWidth}
    {#if hasCover && !isCoverLeave}<Cover bind:isCoverLeave />{/if}

    <QuestionProgress
      bind:questionStep
      {hasCover}
      {isMultiQuiz}
      {numberQuestions}
    />

    {#if !hasCover || isCoverLeave}
      {#each item.questions as question, index}
        {#if questionStep === index}
          <Question
            qItemId={componentConfiguration.id}
            element={question}
            {containerWidth}
            {imageServiceUrl}
            {enrico}
            {mapConfiguration}
            {toolBaseUrl}
            {togglenNextButton}
            {toggleLastCardView}
          />
        {/if}
      {/each}
    {/if}
    {#if isLastCardActive}
      <LastCard />
    {/if}
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
