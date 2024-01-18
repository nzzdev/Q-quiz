<script lang="ts">
  // TODO: acutal code doesn't work for map point guess -> check number guess
  import type { Statistic } from '@src/interfaces';

  export let statistic: Statistic;
  export let isCorrectAnswer: boolean;
</script>

<span class="q-quiz-answer-stats">
  {#if isCorrectAnswer}
    <span class="s-font-text-s"
      >Wir ziehen den Hut. Das ist nicht gut geschätzt, sondern exakt richtig.</span
    >
  {:else if statistic.betterThanCount && statistic.totalAnswers - statistic.betterThanCount === 1}
    <span class="s-font-text-s">
      Gratulation! So gut hat bis jetzt noch niemand geschätzt.
      {#if statistic.totalAnswers === 1}
        Etwas relativieren müssen wir das Lob allerdings: Sie waren so schnell,
        dass noch niemand vor Ihnen mitgemacht hat.
      {:else if statistic.totalAnswers === 2}
        Etwas relativieren müssen wir das Lob allerdings: Sie waren so schnell,
        dass erst eine andere Person mitgemacht hat.
      {:else if statistic.totalAnswers <= 11}
        Etwas relativieren müssen wir das Lob allerdings: Sie waren so schnell,
        dass erst {statistic.totalAnswers - 1} andere mitgemacht haben.`{/if}
    </span>
  {:else if statistic.betterThanPercentage && statistic.betterThanPercentage > 90}
    <span class="s-font-text-s">
      Hervorragend. Nur {100 - statistic.betterThanPercentage} Prozent aller anderen
      haben noch besser geschätzt als Sie.
    </span>
  {:else if statistic.betterThanPercentage && statistic.betterThanPercentage > 20}
    <span class="s-font-text-s"
      >Sie haben damit besser geschätzt als {statistic.betterThanPercentage} Prozent
      aller anderen.</span
    >
  {:else if statistic.betterThanPercentage === 0 && statistic.numberOfSameAnswers === 0}<span
      class="s-font-text-s"
      >Niemand lag so weit daneben wie Sie.
      {#if statistic.totalAnswers === 2}
        Das klingt schlimmer, als es ist. Sie waren so schnell, dass erst eine
        andere Person mitgemacht hat. Ihre Schätzung ist also auch die
        zweitbeste.
      {:else if statistic.totalAnswers <= 11}
        Das klingt schlimmer, als es ist. Sie waren so schnell, dass erst {statistic.totalAnswers -
          1} andere mitgemacht haben.
      {/if}
    </span>
  {:else if statistic.betterThanPercentage === 0}
    <span class="s-font-text-s"
      >Schlechter hat bisher noch niemand geschätzt.</span
    >
  {:else if statistic.betterThanPercentage !== undefined && statistic.betterThanPercentage !== null}
    <span class="s-font-text-s"
      >Nur {statistic.betterThanPercentage} Prozent aller anderen lagen noch weiter
      daneben als Sie.</span
    >
  {/if}
</span>
