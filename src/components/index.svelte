<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  import { quizStore } from '@src/store/quiz.store';

  import type { QQuizSvelteProperties } from '@src/interfaces';
  import { containerWidthStore } from '@src/store/container.store';
  import { QuizElementType } from '@src/enums';

  import QuestionProgress from './QuestionProgress.svelte';
  import NextButton from './next-button/NextButton.svelte';

  import CoverComponent from './cover/Cover.svelte';
  import LastCardComponent from './last-card/LastCard.svelte';
  import MutliplieChoice from './input-multiple-choice/MultipleChoice.svelte';
  import NumberSlider from './number-slider/NumberSlider.svelte';
  import InputMapPoint from './input-map-point-guess/InputMapPoint.svelte';

  export let componentConfiguration: QQuizSvelteProperties;

  let containerWidth: number;

  $: containerWidthStore.set(containerWidth);
  $: indexAdditional = $quizStore.hasCover ? 0 : 1;

  onMount(() => {
    quizStore.initialize(componentConfiguration);
  });
</script>

<div bind:clientWidth={containerWidth}>
  {#if containerWidth}
    {#each $quizStore.items as element, index}
      {#if $quizStore.step === index + indexAdditional}
        {#if element.item.type === QuizElementType.Cover}
          <CoverComponent element={element.item} />
        {/if}
        <div in:fly={{ x: '100%', delay: 350 }} out:fly={{ x: '-100%' }}>
          <QuestionProgress />
          {#if element.item.type === QuizElementType.LastCard}
            <LastCardComponent element={element.item} />
          {:else if element.item.type === QuizElementType.MultipleChoice}
            <MutliplieChoice
              element={element.item}
              toolBaseUrl={$quizStore.configuration.toolBaseUrl}
            />
          {:else if element.item.type === QuizElementType.NumberGuess || element.item.type === QuizElementType.NumberPoll}
            <NumberSlider
              element={element.item}
              toolBaseUrl={$quizStore.configuration.toolBaseUrl}
            />
          {:else if element.item.type === QuizElementType.MapPointGuess}
            <InputMapPoint element={element.item} />
          {/if}
        </div>
      {/if}
    {/each}

    <NextButton isButtonWithIcon={true} defaultVisibility={false} />
  {/if}
</div>
