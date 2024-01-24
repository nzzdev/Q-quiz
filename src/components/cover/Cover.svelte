<script lang="ts">
  import type { Cover } from '@src/interfaces';

  export let element: Cover;
</script>

<div class="s-font-text">{element.title}</div>
<button class="s-font-text">Start Quiz</button>
