<script lang="ts">
  import type { QQuizSvelteProperties } from '@src/interfaces';
  import QuestionProgress from './QuestionProgress.svelte';
  import { element } from 'svelte/internal';

  export let componentConfiguration: QQuizSvelteProperties;

  let questionStep = 0;
  $: item = componentConfiguration.item;

  console.log(componentConfiguration);
</script>

<div>
  <QuestionProgress
    bind:questionStep
    hasCover={item.hasCover}
    isMultiQuiz={item.questionCount > 1}
    numberQuestions={item.questionCount}
  />

  {#each item.questions as question, index}
    {#if questionStep === index}
      <div class="s-font-title">
        <div>{question.question}</div>
      </div>
    {/if}
  {/each}
</div>
