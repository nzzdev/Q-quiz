<script lang="ts">
  import Divider from './atomic/Divider.svelte';
  export let title: string;
</script>

<div class="layout-header q-quiz-gap-column">
  <div class="layout-header-text s-font-note-s">{title}</div>
  <Divider />
</div>

<style lang="scss">
  @import '../styles/variables.scss';
  .layout-header {
    text-align: center;
    padding-top: $borderinnerPadding;

    &-text {
      font-weight: 400;
    }
  }
</style>
