<script lang="ts">
  import CollapseText from '../atomic/CollapseText.svelte';

  export let introduction: string;

  let title: HTMLDivElement;
</script>

<CollapseText textHeight={title.offsetHeight}>
  <h3 class="s-font-text-s q-quiz-question-introduction">
    {introduction}
  </h3>
</CollapseText>

<style lang="scss">
  .q-quiz-question-introduction {
    margin: 0;
    margin-bottom: 8px;
  }
</style>
