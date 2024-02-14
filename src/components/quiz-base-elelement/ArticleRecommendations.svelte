<script lang="ts">
  import type {
    ArticleRecommendations,
    Metadata,
    QuizStoreFn,
  } from '@src/interfaces';
  import key from '../../services/key-service';
  import { getContext } from 'svelte';
  const quizStore = getContext(key) as QuizStoreFn;

  export let recommendations: ArticleRecommendations[];

  async function getLDArticle(
    articleId: string,
    enricoProduct: string
  ): Promise<Metadata> {
    return await fetch(
      `${$quizStore.configuration.enrico.url}?product=${enricoProduct}&articleid=${articleId}`
    )
      .then(async (response) => await response.json())
      .then(async (json) => json.metadata);
  }
</script>

<div>
  {#each recommendations as recommendation}
    {#each $quizStore.configuration.enrico.products as enricoProduct}
      {#await getLDArticle(recommendation.articleId, enricoProduct) then metadata}
        <span class="s-font-text-s">{recommendation.text}</span>
        <a class="s-font-text-s" href={metadata.url} target="_blank"
          >{metadata.title}</a
        >
      {/await}
    {/each}
  {/each}
</div>
