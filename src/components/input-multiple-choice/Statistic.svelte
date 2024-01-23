<script lang="ts">
  // TODO: animation bar
  export let statisticAnswerCount: number;
  export let highestAnswerCount: number;
  export let totalAnswers: number;
  export let disableGreyColor: boolean = false;

  $: barWidth = (statisticAnswerCount / highestAnswerCount) * 100;
  $: precent = (statisticAnswerCount / totalAnswers) * 100;
</script>

<div
  class:statistic__column={barWidth > 0}
  class="statistic statistic__animation"
  style="--bar-width: {barWidth}%"
>
  {#if precent > 0}
    <div
      class:s-color-gray-4={!disableGreyColor}
      class="q-quiz-result__multiple-choice-bar s-color-gray-4"
    ></div>
  {/if}
  <div class="precent s-font-note-s s-font-note--tabularnums">
    {Math.round(precent)} %
  </div>
</div>

<style lang="scss">
  .statistic {
    width: 0;
    margin-bottom: 8px;

    transition: width 1.15s ease-out;

    &__animation {
      width: var(--bar-width);
    }
    &__column {
      display: grid;
      grid-template-columns: 100% 40px;
    }
  }

  .q-quiz-result__multiple-choice-bar {
    height: 16px;
    background: currentColor;
  }

  .precent {
    white-space: nowrap;
    text-align: right;
  }
</style>
