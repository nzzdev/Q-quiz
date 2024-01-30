<script lang="ts">
  import type { Cover } from '@src/interfaces';
  import { quizStore } from '@src/store/quiz.store';

  export let element: Cover;
</script>

<div
  class="q-quiz-element-container q-quiz__cover s-color-primary-1 q-quiz-element-container--is-active"
  style="width: 100%;"
>
  <h3 class="q-quiz__cover-title s-font-title">
    {#if element.title}{element.title}{/if}
  </h3>
  <button
    class="q-quiz-button q-quiz-button__icon s-button s-button--big s-button--circular"
    on:click={() => quizStore.stepForward()}
  >
    <!-- does not really work with max width/height -->
    <svg
      class="s-button__icon"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fill-rule="evenodd">
        <path
          fill="currentColor"
          d="M9.8 22.4l1.4 1.4L21 14l-9.8-9.8-1.4 1.4 8.4 8.4z"
        ></path>
      </g>
    </svg>
  </button>
  <div class="s-font-note-s">Das Quiz starten</div>
</div>

<style lang="scss">
  .q-quiz__cover {
    background-color: currentColor;
    text-align: center;
    padding: 50px 0 60px 0;

    opacity: 1;
    transition: opacity 0.1s ease-out;

    &.q-quiz-element-container--is-inactive {
      opacity: 0;
    }
  }

  .q-quiz__cover-title {
    margin-bottom: 30px;
    padding: 0 5px;
  }
</style>
