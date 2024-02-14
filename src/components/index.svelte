<script lang="ts">
  import { getContext, onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

  import key from '../services/key-service';
  import { quizStoreClass } from '@src/store/quiz.store';

  import type {
    QQuizSvelteProperties,
    QuizStoreContext,
  } from '@src/interfaces';
  import { containerWidthStore } from '@src/store/container.store';
  import { questionContainerStoreClass } from '@src/store/htmlContainer.store';
  import { QuizElementType } from '@src/enums';

  import CoverComponent from './cover/Cover.svelte';
  import LastCardComponent from './last-card/LastCard.svelte';
  import MutliplieChoice from './input-multiple-choice/MultipleChoice.svelte';
  import NumberSlider from './number-slider/NumberSlider.svelte';
  import InputMapPoint from './input-map-point-guess/InputMapPoint.svelte';

  export let componentConfiguration: QQuizSvelteProperties;

  setContext(key, {
    quizStore: quizStoreClass(),
    questionContainerStore: writable<HTMLDivElement>(undefined),
  });

  const { quizStore, questionContainerStore } = getContext(
    key
  ) as QuizStoreContext;

  let containerWidth: number;
  let questionContainer: HTMLDivElement | undefined = undefined;
  // setContext(key, {
  //   questionContainer: writable<HTMLDivElement>(questionContainer),
  // });

  $: containerWidthStore.set(containerWidth);
  $: indexAdditional = $quizStore.hasCover ? 0 : 1;

  onMount(() => {
    quizStore.initialize(componentConfiguration);
    questionContainerStore.set(questionContainer);
  });
</script>

<div bind:this={questionContainer} bind:clientWidth={containerWidth}>
  {#if containerWidth}
    {#each $quizStore.items as element, index}
      {#if $quizStore.step === index + indexAdditional}
        {#if element.item.type === QuizElementType.Cover}
          <CoverComponent element={element.item} />
        {/if}
        <div
          id="q-quiz-elements"
          in:fly={{ x: '100%', delay: 380 }}
          out:fly={{ x: '-100%' }}
        >
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
  {/if}
</div>

<style lang="scss">
  @import '../styles/variables.scss';
  #q-quiz-elements {
    background-color: $questionBackground;
  }
</style>
