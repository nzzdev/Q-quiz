<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import chevroRight from '../../resources/chevron-right.svg';

  export let showArrowRight = false;
  export let backgroundColor = 'black';
  export let color = 'fff';

  const dispatch = createEventDispatcher();

  function action() {
    dispatch('action');
  }
</script>

<div class="button-container">
  <button
    class="button s-button"
    on:click={action}
    style:background-color={backgroundColor}
  >
    <div class="s-font-note-s button-text" style:color><slot /></div>
    {#if showArrowRight}
      <div class="button-icon" style:color>
        {@html chevroRight}
      </div>
    {/if}
  </button>
</div>

<style lang="scss">
  .button-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding-bottom: 30px;
  }
  .button {
    width: 90%;

    &-icon {
      margin-top: 4px;
    }

    &-text {
      color: white;
    }
  }
</style>
