<script lang="ts">
  export let actualStep: number;
  export let totalSteps: number;
  export let hasScore: boolean;
</script>

{#if actualStep === totalSteps}
  {#if hasScore}
    zur Auswertung
  {:else}
    Thema vertiefen
  {/if}
{:else}
  nächste Frage anzeigen
{/if}
