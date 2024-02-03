<script lang="ts">
  import chevroRight from '../../resources/chevron-right.svg';
  import type { Cover } from '@src/interfaces';
  import { quizStore } from '@src/store/quiz.store';
  import Image from '../quiz-base-elelement/Image.svelte';

  export let element: Cover;
</script>

<div
  class="q-quiz-element-container q-quiz__cover s-color-primary-1 q-quiz-element-container--is-active"
  style="width: 100%;"
>
  {#if element.themeTitle || element.themeSubtitle}
    <div class="cover-theme">
      {#if element.themeTitle}
        <h3 class="s-font-title">
          {element.themeTitle}
        </h3>
      {/if}
      {#if element.themeSubtitle}
        <h4 class="s-font-title-s">
          {element.themeSubtitle}
        </h4>
      {/if}
    </div>
  {/if}
  {#if element.image && element.image.url}
    <Image image={element.image} />
  {:else}
    Default Image
  {/if}
  <h3 class="q-quiz__cover-title s-font-title">
    {#if element.title}{element.title}{/if}
  </h3>
  <div class="cover-button">
    <button
      class="q-quiz-button q-quiz-button__icon s-button"
      on:click={() => quizStore.stepForward()}
    >
      {@html chevroRight}
      <div class="s-font-note-s cover-button-text">Das Quiz starten</div>
    </button>
  </div>
</div>

<style lang="scss">
  .cover {
    &-theme {
      padding: 30px 0;
      text-align: center;
    }
    &-button {
      width: 90%;
      display: flex;
      justify-content: center;
      padding-bottom: 30px;

      &-text {
        color: white;
      }
    }
  }
  .q-quiz__cover {
    background-color: currentColor;
    text-align: center;

    opacity: 1;
    transition: opacity 0.1s ease-out;

    &.q-quiz-element-container--is-inactive {
      opacity: 0;
    }
  }

  .q-quiz__cover-title {
    margin-bottom: 30px;
    padding: 0 5px;
  }
</style>
