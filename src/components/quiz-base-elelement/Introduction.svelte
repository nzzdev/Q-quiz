<script lang="ts">
  import CollapseText from '../atomic/CollapseText.svelte';

  export let introduction: string;

  let title: HTMLSpanElement;
</script>

<CollapseText textHeight={title}>
  <h3 class="s-font-text-s q-quiz-question-introduction">
    <span bind:this={title}>{introduction}</span>
  </h3>
</CollapseText>

<style lang="scss">
  .q-quiz-question-introduction {
    margin: 0;
    margin-bottom: 8px;
  }
</style>
