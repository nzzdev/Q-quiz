<script lang="ts">
  import type { QuizBaseQuestion } from '@src/interfaces';

  import Subtitle from './Subtitle.svelte';
  import Title from './Title.svelte';
  import Introduction from './Introduction.svelte';
  import Image from './Image.svelte';
  import ArticleRecommendations from './ArticleRecommendations.svelte';

  export let element: QuizBaseQuestion;
  export let isAnswered: boolean;
</script>

{#if element.introduction}
  <Introduction introduction={element.introduction} />
{/if}
{#if element.image && element.image.url}
  <Image image={element.image} />
{/if}
{#if element.question}
  <Title title={element.question} />
{/if}
{#if element.questionSubTitle}
  <Subtitle subtitle={element.questionSubTitle} />
{/if}

<!-- Slot for quiz type element -->
<slot />
{#if isAnswered}
  {#if element.answerText}
    <div class="q-quiz-result-answer-text s-font-text-s">
      {element.answerText}
    </div>
  {/if}
  {#if element.articleRecommendations}
    <ArticleRecommendations recommendations={element.articleRecommendations} />
  {/if}
{/if}
