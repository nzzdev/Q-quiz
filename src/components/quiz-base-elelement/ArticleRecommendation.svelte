<script lang="ts">
  import { getContext } from 'svelte';
  import { dayjs } from '@nzz/et-utils-date';

  import type { Metadata, QuizStoreContext } from '@src/interfaces';
  import { ImageSizeFomat } from '@src/enums';
  import key from '@src/services/key-service';
  import { EventTrackingService } from '@src/services/event-tracking';

  import Image from './Image.svelte';

  export let url: string;
  export let text: string;
  export let metadata: Metadata | undefined = undefined;

  console.log('metadata', metadata);

  const { quizStore, containerWidthStore } = getContext(
    key
  ) as QuizStoreContext;
  $: isSmall = $containerWidthStore < 500 ? true : false;

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
        <Image
          image={{
            width: metadata?.teaserImage.width,
            height: metadata?.teaserImage.height,
            url: metadata?.teaserImage.url,
          }}
          format={isSmall
            ? ImageSizeFomat.FORMAT_16_9
            : ImageSizeFomat.FORMAT_1_1}
        />
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
      flex: 0 0 100px;

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
