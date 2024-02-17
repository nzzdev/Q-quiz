<script lang="ts">
  import { getContext } from 'svelte';

  import { ImageSizeFomat } from '@src/enums';
  import { getImageUrls } from '@src/services/images-service';
  import type { QuizImage, QuizStoreContext } from '@src/interfaces';
  import key from '@src/services/key-service';

  export let image: QuizImage;
  export let format: ImageSizeFomat = ImageSizeFomat.FORMAT_16_9;

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
  class:image-container--format-1-1={format === ImageSizeFomat.FORMAT_1_1}
  class="image-container"
>
  <img
    class:q-quiz-question-image--format-1-1={format ===
      ImageSizeFomat.FORMAT_1_1}
    class="q-quiz-question-image"
    src={images.image2x}
    srcset="{images.image1x} 1x, {images.image2x} 2x, {images.image3x} 3x, {images.image4x} 4x"
    alt="Question Image"
    aria-hidden="true"
  />
</div>

<style lang="scss">
  .image-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
    overflow: hidden;

    &--format-1-1 {
      padding-bottom: 100%;
    }
  }
  .q-quiz-question-image {
    position: absolute;
    top: 50%;
    left: 0; /* 16:9 Aspect Ratio */
    transform: translateY(-50%); /* 16:9 Aspect Ratio */
    width: 100%;
    height: auto; /* 16:9 Aspect Ratio */

    &--format-1-1 {
      left: 50%;
      transform: translate(-50%, -50%);
      height: 100%;
      object-fit: cover;
    }
  }
</style>
