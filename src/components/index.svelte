<script lang="ts">
  import type { QQuizSvelteProperties } from '@src/interfaces';
  import QuestionProgress from './QuestionProgress.svelte';
  import Question from './question/Question.svelte';

  export let componentConfiguration: QQuizSvelteProperties;

  let containerWidth;
  let questionStep = 0;
  $: item = componentConfiguration.item;
  $: imageServiceUrl = componentConfiguration.imageServiceUrl;
  $: enrico = componentConfiguration.enrico;
  $: mapConfiguration = componentConfiguration.mapConfigurtaion;

  console.log(componentConfiguration);
</script>

<div bind:clientWidth={containerWidth}>
  {#if containerWidth}
    <QuestionProgress
      bind:questionStep
      hasCover={item.hasCover}
      isMultiQuiz={item.questionCount > 1}
      numberQuestions={item.questionCount}
    />

    {#each item.questions as question, index}
      {#if questionStep === index}
        <Question
          element={question}
          {containerWidth}
          {imageServiceUrl}
          {enrico}
          {mapConfiguration}
        />
      {/if}
    {/each}
  {/if}
</div>
