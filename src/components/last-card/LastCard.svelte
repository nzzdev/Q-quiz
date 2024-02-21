<script lang="ts">
  import { onMount, getContext } from 'svelte';

  import key from '@src/services/key-service';
  import { ScoreService } from '@src/services/score-service';
  import { checkIsScoreQuestion } from '@src/helpers/utils';
  import type {
    LastCard,
    QuizBaseQuestion,
    QuizeScore,
    QuizStoreContext,
  } from '@src/interfaces';

  import QuestionIcon from '@src/resources/question.svg';

  import Divider from '../atomic/Divider.svelte';
  import ArticleRecommendations from '../quiz-base-elelement/ArticleRecommendations.svelte';

  export let element: LastCard;

  const { quizStore } = getContext(key) as QuizStoreContext;

  let score: QuizeScore;

  onMount(() => {
    const scoreService = new ScoreService();
    const questions = $quizStore.items
      .filter((item) => checkIsScoreQuestion(item.item.type))
      .map((item) => item.item as QuizBaseQuestion);
    score = scoreService.calculateScore(questions);
  });
</script>

<div
  class="q-quiz-element-container q-quiz__last-card s-color-primary-1"
  style="width: 100%;"
>
  <h3 class="s-q-item__title q-quiz-last-card-title">
    {#if element.isFinalScoreShown && score}
      <div class="s-font-text q-quiz-final-score">
        {score.lastCardTitle} Sie haben
        <span class="s-font-text s-font-text--strong"
          >{score.achievedScore} von {score.maxScore}</span
        >
        möglichen Punkten erzielt.
      </div>
    {:else}
      {element.title || ''}
    {/if}
  </h3>
  {#if element.text}
    <p class="s-font-text">{element.text}</p>
  {/if}
  {#if element.urlRecommendations && element.urlRecommendations.links.length > 0}
    <Divider />
    <ArticleRecommendations recommendations={element.urlRecommendations} />
    {#if !element.quizLink}
      <Divider />
    {/if}
  {/if}
  {#if element.quizLink}
    <Divider />
    <div
      class="s-color-gray-4 q-quiz-play-another-container q-quiz-play-another-container--separator"
    >
      <div class="s-font-note q-quiz-play-another-teaser">
        Als nächstes Quiz empfehlen wir:
      </div>
      {#if element.quizTitle}
        <div class="s-q-item__title q-quiz-play-another-title">
          {element.quizTitle}
        </div>
      {/if}
      <a href={element.quizLink}>
        <button
          class="q-quiz-button q-quiz-button__icon s-button s-button--big s-button--circular"
        >
          {@html QuestionIcon}
        </button>
      </a>
    </div>
    <Divider />
  {/if}
</div>

<style lang="scss">
  .q-quiz__last-card {
    padding: 20px;
    // TODO: checkout with design
    // border-radius: 8px;
    // background-color: white;
    // box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  }
</style>
