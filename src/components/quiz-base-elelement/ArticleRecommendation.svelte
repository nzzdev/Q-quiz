<script lang="ts">
  import { getContext } from 'svelte';
  import { createFromToLabel, dayjs, Formats } from '@nzz/et-utils-date';

  import type {
    ArticleRecommendations,
    Metadata,
    QuizStoreContext,
  } from '@src/interfaces';
  import key from '../../services/key-service';
  import { EventTrackingService } from '@src/services/event-tracking';

  export let url: string;
  export let text: string;
  export let metadata: Metadata | undefined = undefined;

  console.log('metadata', metadata);

  const { quizStore, containerWidthStore } = getContext(
    key
  ) as QuizStoreContext;
  const isSmall = $containerWidthStore < 500 ? true : false;

  function trackEvent(link: string, event: Event) {
    const detail = EventTrackingService.getDetails(
      $quizStore.items,
      $quizStore.qItemId,
      event
    );
    const step = $quizStore.step;

    EventTrackingService.trackClickLink(
      detail.title,
      link,
      step,
      detail.element
    );
  }
</script>

<a
  class="reccomendation-link s-font-text-s"
  on:click={(event) => trackEvent(url, event)}
  href={url}
  target="_blank"
>
  <div
    class:reccomendation-link-container--small={isSmall}
    class="reccomendation-link-container"
  >
    {#if metadata?.teaserImage}
      <div
        class:reccomendation-link-teaser--small={isSmall}
        class="reccomendation-link-teaser"
      >
        <!-- svelte-ignore a11y-missing-attribute -->
        <img src={metadata?.teaserImage.url} />
      </div>
    {/if}

    <div>
      <div>
        {text}
      </div>
      <div class="q-metadata s-font-note-s">
        {#if metadata?.authorLine}
          <div>{metadata?.authorLine}</div>
        {/if}
        {#if metadata?.publicationDate}
          <div>{dayjs(metadata?.publicationDate).format('DD.MM.YYYY')}</div>
        {/if}
      </div>
    </div>
  </div>
</a>

<style lang="scss">
  @import '../../styles/variables.scss';
  .reccomendation-link {
    text-decoration: none;

    &-container {
      display: flex;
      gap: 15px;

      &--small {
        flex-direction: column;
      }
    }

    &-teaser {
      width: 55%;

      &--small {
        width: 100%;
      }

      img {
        width: 100%;
      }
    }

    .q-metadata {
      display: flex;
      gap: 10px;
      color: $darkerGray;
    }
  }
</style>
