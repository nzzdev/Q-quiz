<script lang="ts">
  import { QuizElementType } from '@src/enums';
  import type {
    DBAnswerData,
    DBAnswerMapPointGuessValue,
    QuizBaseQuestion,
  } from '@src/interfaces';

  import Subtitle from './Subtitle.svelte';
  import Title from './Title.svelte';
  import Introduction from './Introduction.svelte';
  import Image from './Image.svelte';

  export let element: QuizBaseQuestion;

  // let isAnswered = false;

  // function closeQuestion(value: DBAnswerMapPointGuessValue | string) {
  //   const data: DBAnswerData = {
  //     itemId: qItemId,
  //     questionId: element.id,
  //     type: element.type,
  //     value,
  //   };
  //   fetch(`${toolBaseUrl}/answer`, {
  //     method: 'POST',
  //     headers: {
  //       'content-type': 'application/json',
  //     },
  //     body: JSON.stringify(data),
  //   }).then((response) => {
  //     if (response.ok) {
  //       isAnswered = true;
  //     }
  //     console.log('response', response);
  //   });
  // }
</script>

{#if element.introduction}
  <Introduction introduction={element.introduction} />
{/if}
{#if element.image && element.image.url}
  <Image image={element.image} />
{/if}
{#if element.question}
  <Title title={element.question} />
{/if}
{#if element.questionSubTitle}
  <Subtitle subtitle={element.questionSubTitle} />
{/if}

<!-- Slot for quiz type element -->
<slot />
{#if element.answerText}
  <div class="q-quiz-result-answer-text s-font-text-s">
    {element.answerText}
  </div>
{/if}
<!-- TODO: Result answer text-->
