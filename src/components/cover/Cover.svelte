<script lang="ts">
  import type { Cover } from '@src/interfaces';
  import { ColorDefaults } from '@src/constants';
  import { quizStores } from '@src/store/quiz.store';

  import Image from '../quiz-base-elelement/Image.svelte';
  import Button from '../atomic/Button.svelte';

  export let element: Cover;

  const quizStore = quizStores.main;

  $: coverColor = element.color || ColorDefaults.Cover.Color.Background;
</script>

<div
  class="cover q-quiz-element-container--is-active"
  style="--q-quiz-cover-color: {coverColor}"
>
  {#if element.themeLogo || element.themeTitle}
    <div class="cover-theme q-quiz-gap-column q-quiz-gap-row">
      {#if element.themeLogo}
        <div class="nzz-title">
          <h3 class="s-font-title" style:color={ColorDefaults.Cover.Color.Text}>
            {element.themeLogo}
          </h3>
        </div>
      {/if}
      {#if element.themeTitle}
        <h4 class="s-font-text" style:color={ColorDefaults.Cover.Color.Text}>
          {element.themeTitle}
        </h4>
      {/if}
    </div>
  {/if}
  {#if element.image && element.image.url}
    <div class="q-quiz-gap-row">
      <Image image={element.image} />
    </div>
  {/if}
  <div class:cover-layout-without-image={!element.image || !element.image.url}>
    <h3
      class="cover-title q-quiz-gap-column q-quiz-gap-row s-font-title"
      style:color={ColorDefaults.Cover.Color.Text}
    >
      {#if element.title}{element.title}{/if}
    </h3>
    <div class="q-quiz-gap-column">
      <Button
        showArrowRight={true}
        on:action={() => quizStore.stepForward()}
        colorStyle={ColorDefaults.Cover.Button.Color}>Das Quiz starten</Button
      >
    </div>
  </div>
</div>

<style lang="scss">
  @import '../../styles/variables';
  .nzz-title {
    height: 16px;
  }
  .cover {
    width: 100%;
    padding-top: $gap;
    padding-bottom: $gap;
    background-color: currentColor;
    text-align: center;

    color: var(--q-quiz-cover-color);

    &-title {
      font-size: 22px;
      line-height: 30px;
    }

    &-theme {
      text-align: center;
    }

    &-layout-without-image {
      padding-top: 150px;
      padding-bottom: 150px;
    }
  }
</style>
