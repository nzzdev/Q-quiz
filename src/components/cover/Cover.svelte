<script lang="ts">
  import { getContext } from 'svelte';

  import key from '../../services/key-service';
  import type { Cover, QuizStoreContext } from '@src/interfaces';
  import { ColorDefaults } from '@src/constants';

  import Image from '../quiz-base-elelement/Image.svelte';
  import Button from '../atomic/Button.svelte';
  import nzzLogo from '@src/resources/nzz_logo.svg';

  export let element: Cover;

  const { quizStore } = getContext(key) as QuizStoreContext;

  $: coverColor = element.color || ColorDefaults.Cover.Color.Background;
</script>

<div
  class="cover q-quiz-element-container--is-active"
  style="--q-quiz-cover-color: {coverColor}"
>
  <div
    class:cover-layout-without-image={!element.image || !element.image.url}
    class="cover-theme q-quiz-gap-column q-quiz-gap-row__small"
  >
    <div class="nzz-logo">
      {@html nzzLogo}
    </div>
    <h4 class="s-font-title-l" style:color={ColorDefaults.Cover.Color.Text}>
      {element.themeTitle ? element.themeTitle : 'Quiz'}
    </h4>
  </div>
  {#if element.image && element.image.url}
    <div class="q-quiz-gap-row">
      <Image image={element.image} />
    </div>
  {/if}
  <h3
    class:cover-layout-without-image={!element.image || !element.image.url}
    class="cover-title q-quiz-gap-column q-quiz-gap-row s-font-text"
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

<style lang="scss">
  @import '../../styles/variables';
  .nzz-logo {
    display: flex;
    justify-content: center;

    :global(svg) {
      height: 20px;
    }
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
      padding-bottom: 150px;
    }
  }
</style>
