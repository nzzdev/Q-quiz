<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import chevroRight from '../../resources/chevron-right.svg';
  import { ColorDefaults } from '@src/constants';
  import type { ButtonColorStyle } from '@src/interfaces';

  export let showArrowRight = false;
  export let colorStyle: ButtonColorStyle = ColorDefaults.Button.Color;
  export let disabled: boolean = false;

  $: console.log(disabled);
  const dispatch = createEventDispatcher();

  function action() {
    dispatch('action');
  }
</script>

<div class="button-container">
  <button
    class="button s-button"
    style="--q-quiz-button-bg-color: {colorStyle.Background}; --q-quiz-button-hover-color: {colorStyle.Hover}; --q-quiz-button-disabled-color: {colorStyle.Disabled};"
    on:click={action}
    {disabled}
  >
    <div class="s-font-note-s button-text" style:color={colorStyle.Text}>
      <slot />
    </div>
    {#if showArrowRight}
      <div class="button-icon" style:color={colorStyle.Text}>
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
  .button__disabled {
    background-color: var(--q-quiz-button-disabled-color);
    cursor: not-allowed;
  }
  .button {
    width: 100%;
    cursor: pointer;
    background-color: var(--q-quiz-button-bg-color);

    &:hover {
      opacity: 1;
      background-color: var(--q-quiz-button-hover-color);
    }

    &-icon {
      margin-top: 4px;
    }

    &-text {
      font-weight: 400;
    }
  }
</style>
