<script lang="ts">
  import { getContext } from 'svelte';

  import { getImageUrls } from '@src/services/images-service';
  import type { QuizImage, QuizStoreContext } from '@src/interfaces';
  import key from '../../services/key-service';

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

<div class="image-container">
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
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
    overflow: hidden;
  }
  .q-quiz-question-image {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    height: auto;
  }
</style>
