<script lang="ts">
  import type { Cover } from '@src/interfaces';
  import { quizStore } from '@src/store/quiz.store';

  import Image from '../quiz-base-elelement/Image.svelte';
  import Button from '../atomic/Button.svelte';
  import { ColorDefaults } from '@src/constants';

  export let element: Cover;

  $: coverColor = element.color || ColorDefaults.Cover.Color.Background;
</script>

<div
  class="q-quiz__cover q-quiz-element-container--is-active"
  style="--q-quiz-cover-color: {coverColor}"
>
  {#if element.themeTitle || element.themeSubtitle}
    <div class="cover-theme">
      {#if element.themeTitle}
        <div class="nzz-title">
          <h3 class="s-font-title" style:color={ColorDefaults.Cover.Color.Text}>
            {element.themeTitle}
          </h3>
        </div>
      {/if}
      {#if element.themeSubtitle}
        <h4 class="s-font-title-s" style:color={ColorDefaults.Cover.Color.Text}>
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
  <h3
    class="quiz-title s-font-title"
    style:color={ColorDefaults.Cover.Color.Background}
  >
    {#if element.title}{element.title}{/if}
  </h3>
  <div class="cover-button">
    <Button
      showArrowRight={true}
      on:action={() => quizStore.stepForward()}
      colorStyle={ColorDefaults.Cover.Button.Color}>Das Quiz starten</Button
    >
  </div>
</div>

<style lang="scss">
  .nzz-title {
    height: 16px;
  }
  .cover {
    &-theme {
      padding: 25px 0;
      text-align: center;
    }

    &-button {
      padding: 0 25px;
    }
  }
  .q-quiz__cover {
    width: 100%;
    background-color: currentColor;
    text-align: center;

    color: var(--q-quiz-cover-color);
    opacity: 1;
    transition: opacity 0.1s ease-out;

    &.q-quiz-element-container--is-inactive {
      opacity: 0;
    }
  }

  .quiz-title {
    padding: 25px 0;
    font-size: 22px;
    line-height: 30px;
  }
</style>
