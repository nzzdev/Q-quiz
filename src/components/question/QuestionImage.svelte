<script lang="ts">
  import type { QuizImage } from '@src/interfaces';
  import { getImageUrls } from '@src/services/images-service';

  export let image: QuizImage;
  export let containerWidth: number;
  export let imageServiceUrl: string;

  $: images = getImageUrls(image, containerWidth, imageServiceUrl);
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
