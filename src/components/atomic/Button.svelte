<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { ColorDefaults } from '@src/constants';
  import type { ButtonColorStyle } from '@src/interfaces';

  import chevroRight from '../../resources/chevron-right.svg';

  export let showArrowRight = false;
  export let colorStyle: ButtonColorStyle = ColorDefaults.Button.Color;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();

  function action(event: Event) {
    dispatch('action', { event });
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
  @import '../../styles/variables';
  .button-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .button {
    display: flex;
    align-items: safe;
    width: 100%;
    padding: 12px;
    cursor: pointer;
    background-color: var(--q-quiz-button-bg-color);

    &:hover {
      opacity: 1;
      background-color: var(--q-quiz-button-hover-color);
    }

    &:disabled,
    &:disabled:hover {
      background-color: var(--q-quiz-button-disabled-color);
      border-color: #848484;
      cursor: not-allowed;
    }

    &-icon {
      margin-top: 7px;
    }

    &-text {
      font-weight: 400;
    }
  }
</style>
