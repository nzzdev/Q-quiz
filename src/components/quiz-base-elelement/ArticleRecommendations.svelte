<script lang="ts">
  import { getContext } from 'svelte';

  import key from '@src/services/key-service';
  import type {
    UrlRecommendations,
    Metadata,
    QuizStoreContext,
  } from '@src/interfaces';

  import Divider from '../atomic/Divider.svelte';
  import ArticleRecommendation from './ArticleRecommendation.svelte';

  export let recommendations: UrlRecommendations;

  const { quizStore } = getContext(key) as QuizStoreContext;

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
  <div class="more-themes s-font-title">
    Mehr zum Thema {#if recommendations.themaAddText}{recommendations.themaAddText}{/if}
  </div>
  <div class="links">
    {#each recommendations.links as link, idx}
      {#each $quizStore.configuration.enrico.products as enricoProduct}
        {#if link.url.startsWith('ld.')}
          {#await getLDArticle(link.url, enricoProduct) then metadata}
            <ArticleRecommendation
              url={metadata.url}
              text={metadata.title}
              {metadata}
            />
          {/await}
        {:else}
          <ArticleRecommendation url={link.url} text={link.text} />
        {/if}
      {/each}
      {#if idx < recommendations.links.length - 1}
        <Divider />
      {/if}
    {/each}
  </div>
</div>

<style lang="scss">
  @import '../../styles/variables.scss';
  .more-themes {
    margin-bottom: 10px;
  }
  .links {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
</style>
