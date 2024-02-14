<script lang="ts">
  import { ColorDefaults } from '@src/constants';

  import type { QuizStoreFn } from '@src/interfaces';
  import NextButton from './next-button/NextButton.svelte';
  import key from '../services/key-service';
  import { getContext } from 'svelte';
  import { svelteStore } from './store.svelte';
  const quizStore = getContext(key) as QuizStoreFn;

  export let isShowNextButton = true;
</script>

<nav
  class:q-quiz-header--is-empty={$svelteStore.hasCover &&
    $svelteStore.step === 0}
  class="q-quiz-container q-quiz-header {$svelteStore.isMultiQuiz
    ? 'q-quiz-multi-header'
    : 'q-quiz-single-header'}"
>
  {#if $svelteStore.isMultiQuiz}
    <div class="question-state s-font-note-s">
      {#if $svelteStore.step > $svelteStore.numberQuestions}
        Fertig!
      {:else if $svelteStore.step === $svelteStore.numberQuestions}
        letzte Frage
      {:else}
        Frage {$svelteStore.step} / {$svelteStore.numberQuestions}
      {/if}
    </div>
    {#if isShowNextButton}
      <div class="next-button">
        <NextButton />
      </div>
    {/if}
  {/if}
</nav>

<style lang="scss">
  @import '../styles/variables.scss';
  .question-state {
    color: $darkerGray;
  }
  .q-quiz-header {
    opacity: 1;
    transition: opacity 0.2s ease-in;
  }
  .q-quiz-header--is-empty {
    border-bottom-color: transparent;
    height: 0;
    margin: 0;
    padding: 0;
    opacity: 0;
  }
  .q-quiz-multi-header {
    display: flex;

    justify-content: space-between;
    align-items: center;
  }
</style>
