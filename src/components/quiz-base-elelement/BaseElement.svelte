<script lang="ts">
  import type { QuizBaseQuestion } from '@src/interfaces';

  import Subtitle from './Subtitle.svelte';
  import Title from './Title.svelte';
  import Introduction from './Introduction.svelte';
  import Image from './Image.svelte';
  import ArticleRecommendations from './ArticleRecommendations.svelte';
  import NextButton from '../next-button/NextButton.svelte';
  import QuestionProgress from '../QuestionProgress.svelte';

  export let element: QuizBaseQuestion;
  export let isAnswered: boolean;
</script>

<div class="question-container">
  {#if element.introduction}
    <div class="q-quiz-gap-column q-quiz-gap-row">
      <Introduction introduction={element.introduction} />
    </div>
  {/if}
  {#if element.image && element.image.url}
    <Image image={element.image} />
  {/if}
  {#if element.question}
    <div class="q-quiz-gap-column q-quiz-gap-row">
      <Title title={element.question} />
    </div>
  {/if}
  {#if element.questionSubTitle}
    <div class="q-quiz-gap-column q-quiz-gap-row">
      <Subtitle subtitle={element.questionSubTitle} />
    </div>
  {/if}
  <!-- Slot for quiz type element -->
  <div class="q-quiz-gap-column q-quiz-gap-row">
    <slot />
  </div>
  {#if isAnswered}
    {#if element.answerText}
      <div
        class="q-quiz-gap-column q-quiz-gap-row q-quiz-result-answer-text s-font-text-s"
      >
        {element.answerText}
      </div>
    {/if}
    {#if element.articleRecommendations}
      <div class="q-quiz-gap-column q-quiz-gap-row">
        <ArticleRecommendations
          recommendations={element.articleRecommendations}
        />
      </div>
    {/if}
  {/if}
  <!-- TODO: Find a better solution -->
  {#if isAnswered}
    <div class="q-quiz-gap-column q-quiz-gap-row">
      <NextButton isButtonWithIcon={true} />
    </div>
  {/if}
  <QuestionProgress isShowNextButton={!isAnswered} />
  <!-- /Find a better solution -->
</div>

<style lang="scss">
  @import '../../styles/variables';
  .question-container {
    padding-top: $gap;
    padding-bottom: $gap;
  }
</style>
