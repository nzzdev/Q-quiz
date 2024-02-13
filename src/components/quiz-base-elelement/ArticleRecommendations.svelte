<script lang="ts">
  import type { ArticleRecommendations, Metadata } from '@src/interfaces';
  import { quizStore } from '../store.svelte';

  export let recommendations: ArticleRecommendations[];

  async function getLDArticle(articleId: string): Promise<Metadata> {
    return await fetch(
      `${$quizStore.configuration.enrico.url}?product=${$quizStore.configuration.enrico.products}&articleid=${articleId}`
    )
      .then(async (response) => await response.json())
      .then(async (json) => json.metadata);
  }
</script>

<div>
  {#each recommendations as recommendation}
    {#await getLDArticle(recommendation.articleId) then metadata}
      <span class="s-font-text-s">{recommendation.text}</span>
      <a class="s-font-text-s" href={metadata.url} target="_blank"
        >{metadata.title}</a
      >
    {/await}
  {/each}
</div>
