<script lang="ts">
  import { quizStores, storeUuid } from '@src/store/quiz.store';
  import { containerWidthStore } from '@src/store/container.store';

  import type { QuizImage } from '@src/interfaces';
  import { getImageUrls } from '@src/services/images-service';

  export let image: QuizImage;

  const quizStore = quizStores[storeUuid];

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
