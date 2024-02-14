<script lang="ts">
  import { getContext } from 'svelte';

  import { containerWidthStore } from '@src/store/container.store';
  import { getImageUrls } from '@src/services/images-service';
  import type { QuizImage, QuizStoreFn } from '@src/interfaces';
  import key from '../../services/key-service';

  export let image: QuizImage;

  const quizStore = getContext(key) as QuizStoreFn;

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
