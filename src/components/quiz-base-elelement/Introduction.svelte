<script lang="ts">
  import CollapseText from '../atomic/CollapseText.svelte';

  export let introduction: string;

  let title: HTMLSpanElement;
</script>

<CollapseText textHeight={title}>
  <div bind:this={title} class="s-font-text-s q-quiz-question-introduction">
    {introduction}
  </div>
</CollapseText>

<style lang="scss">
  .q-quiz-question-introduction {
    margin: 0;
    margin-bottom: 8px;
  }
</style>
