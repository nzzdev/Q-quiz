<script lang="ts">
  export let isCoverLeave: boolean;
</script>

<div class="s-font-text">Cover</div>
<button class="s-font-text" on:click={() => (isCoverLeave = true)}
  >Start Quiz</button
>
