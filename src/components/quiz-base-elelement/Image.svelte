<script lang="ts">
  import { containerWidthStore } from '@src/store/container.store';

  import type { QuizImage, QuizStoreFn } from '@src/interfaces';
  import { getImageUrls } from '@src/services/images-service';
  import { getContext } from 'svelte';
  import key from '../../services/key-service';
  const quizStore = getContext(key) as QuizStoreFn;

  console.log('image key', key);

  export let image: QuizImage;

  $: images = getImageUrls(
    image,
    $containerWidthStore,
    $quizStore.configuration.imageServiceUrl
  );
</script>

<div>
  <img
    class="q-quiz-question-image"
    src={images.image2x}
    srcset="{images.image1x} 1x, {images.image2x} 2x, {images.image3x} 3x, {images.image4x} 4x"
    alt="Question Image"
    aria-hidden="true"
  />
</div>

<style lang="scss">
  .q-quiz-question-image {
    width: 100%;
  }
</style>
