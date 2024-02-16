<script lang="ts">
  import { getContext } from 'svelte';

  import { getImageUrls } from '@src/services/images-service';
  import type { QuizImage, QuizStoreContext } from '@src/interfaces';
  import key from '../../services/key-service';
  import { calculat16To9Height } from '@src/helpers/utils';

  export let image: QuizImage;

  const { quizStore, containerWidthStore } = getContext(
    key
  ) as QuizStoreContext;

  $: images = getImageUrls(
    image,
    $containerWidthStore,
    $quizStore.configuration.imageServiceUrl
  );
</script>

<div
  class="image-container"
  style:max-height="{calculat16To9Height($containerWidthStore)}px"
>
  <img
    class="q-quiz-question-image"
    src={images.image2x}
    srcset="{images.image1x} 1x, {images.image2x} 2x, {images.image3x} 3x, {images.image4x} 4x"
    alt="Question Image"
    aria-hidden="true"
  />
</div>

<style lang="scss">
  .image-container {
    width: 100%;
    overflow: hidden;
  }
  .q-quiz-question-image {
    width: 100%;
  }
</style>
