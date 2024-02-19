<script lang="ts">
  export let actualStep: number;
  export let totalSteps: number;
  export let hasScore: boolean;
  export let isJumpAnswer: boolean = false;
</script>

{#if actualStep === totalSteps}
  {#if hasScore}
    zur Auswertung
  {:else}
    Thema vertiefen
  {/if}
{:else if isJumpAnswer}
  Frage überspringen
{:else}
  nächste Frage
{/if}
