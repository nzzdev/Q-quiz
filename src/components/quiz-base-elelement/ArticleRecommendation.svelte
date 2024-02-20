<script lang="ts">
  import { getContext } from 'svelte';
  import { dayjs } from '@nzz/et-utils-date';

  import { EventTrackingService } from '@src/services/event-tracking';
  import key from '@src/services/key-service';
  import type { Metadata, QuizStoreContext } from '@src/interfaces';
  import { ImageSizeFomat } from '@src/enums';

  import Image from './Image.svelte';

  export let url: string;
  export let text: string;
  export let metadata: Metadata | undefined = undefined;

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
      <h2 class="reccomendation-link-text">
        {text}
      </h2>
      <div class="reccomendation-link-meta-info">
        <div>
          {#if metadata?.authorLine}
            <span class="reccomendation-link-meta-info-item"
              >{metadata?.authorLine}</span
            >
          {/if}
          {#if metadata?.publicationDate}
            <time class=""
              >{dayjs(metadata?.publicationDate).format('DD.MM.YYYY')}</time
            >
          {/if}
          <!-- TODO: check up by webit -->
          <!-- <span
              data-tooltip="Lesezeit 6 min"
              class="metainfo__item metainfo__item--reading-time"
              ><svg
                version="1.1"
                viewBox="0 0 24 24"
                class="reading-time__icon nzz-icons--small nzz-icons--icon nzz-icons--fill"
                ><path
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  d="M11.77 7.39v5.62l3.8 1.32"
                ></path><circle
                  stroke="currentColor"
                  fill="none"
                  cx="12"
                  cy="12"
                  r="8.5"
                  stroke-linecap="round"
                ></circle></svg
              > <span>6 min</span></span
            > -->
        </div>
        <!---->
      </div>
    </div>
  </div>
</a>

<style lang="scss">
  @import '../../styles/variables.scss';
  .reccomendation-link {
    text-decoration: none;
    opacity: 1;

    &:hover {
      .reccomendation-link-text {
        opacity: 0.6;
      }
    }

    &-container {
      display: flex;
      gap: 15px;

      &--small {
        flex-direction: column;
      }
    }

    &-text {
      font-family: nzz-serif, Georgia;
      font-weight: 400;
      font-size: 1.125rem;
      line-height: 1.33;
    }

    &-meta-info {
      display: flex;
      flex-grow: 1;
      flex-wrap: wrap;
      line-height: 1rem;
      color: $darkerGray;
      font-family: nzz-sans-serif, Arial;
      font-size: 0.75rem;
    }

    &-meta-info-item {
      display: inline;
      margin-right: 8px;
      max-width: 100%;
      padding: 0;
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
