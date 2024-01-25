<script lang="ts">
  import type { Cover } from '@src/interfaces';
  import { quizStore } from '@src/store/quiz.store';

  export let element: Cover;
</script>

<div class="s-font-text">{element.title}</div>
<button class="s-font-text" on:click={() => quizStore.stepForward()}
  >Start Quiz</button
>
