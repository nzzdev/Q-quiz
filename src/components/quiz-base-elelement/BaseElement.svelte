<script lang="ts">
  import type { QuizBaseQuestion } from '@src/interfaces';

  import CollapseText from '../atomic/CollapseText.svelte';
  import NextButton from '../next-button/NextButton.svelte';
  import QuestionProgress from '../QuestionProgress.svelte';

  import Introduction from './Introduction.svelte';
  import Title from './Title.svelte';
  import Subtitle from './Subtitle.svelte';
  import Image from './Image.svelte';
  import ArticleRecommendations from './ArticleRecommendations.svelte';

  export let element: QuizBaseQuestion;
  export let isAnswered: boolean;

  let answerText: HTMLSpanElement;
</script>

<div class="question-container">
  {#if element.introduction}
    <div class="q-quiz-gap-column q-quiz-gap-row">
      <Introduction introduction={element.introduction} />
    </div>
  {/if}
  {#if element.image && element.image.url}
    <div class="q-quiz-gap-row">
      <Image image={element.image} />
    </div>
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
      <div class="q-quiz-gap-column q-quiz-gap-row">
        <CollapseText textHeight={answerText}>
          <div class="q-quiz-result-answer-text s-font-text-s">
            <span bind:this={answerText}>{element.answerText}</span>
          </div>
        </CollapseText>
      </div>
    {/if}
    {#if element.urlRecommendations && element.urlRecommendations.links.length > 0}
      <div class="q-quiz-gap-column q-quiz-gap-row">
        <ArticleRecommendations recommendations={element.urlRecommendations} />
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
