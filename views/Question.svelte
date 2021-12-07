<script>
  import MultipleChoice from "./MultipleChoice.svelte";
  import NumberGuess from "./NumberGuess.svelte";
  import NumberPoll from "./NumberPoll.svelte";
  import MapPointGuess from "./MapPointGuess.svelte";

  export let question;
  export let width;
  export let imageServiceUrl;

  $: isMultipleChoice = question.type === "multipleChoice";
  $: isNumberGuess = question.type === "numberGuess";
  $: isNumberPoll = question.type === "numberPoll";
  $: isMapPointGuess = question.type === "mapPointGuess";
</script>

{#if question.introduction}<h3
    class="s-font-text-s q-quiz-question-introduction"
  >
    {question.introduction}
  </h3>{/if}
{#if question.image && question.image.key}
  {#if width}
    <picture
      style="position:relative; display:block; padding-bottom:{(question.image
        .height /
        question.image.width) *
        100}%;"
    >
      <source
        type="image/webp"
        srcset="{question.image.urls.webp1x} 1x, {question.image.urls
          .webp2x} 2x"
      />
      <source
        srcset="{question.image.urls.image1x} 1x, {question.image.urls
          .image2x} 2x"
      />
      <img
        class="q-quiz-question-image q-quiz-question-image--responsive"
        src={question.image.urls.image1x}
      />
    </picture>
  {:else}
    <picture
      class="q-quiz-question-image"
      data-imageServiceUrl={imageServiceUrl}
      data-imageKey={question.image.key}
      style="position:relative; display: block; padding-bottom: {(question.image
        .height /
        question.image.width) *
        100}%;"
    />
  {/if}
{/if}
{#if question.question}<h3 class="s-q-item__title q-quiz-question-title">
    {question.question}
  </h3>{/if}
{#if question.questionSubTitle}<p
    class="s-font-text-s"
    style="font-style:italic"
  >
    {question.questionSubTitle}
  </p>{/if}
<div>
  {#if isMultipleChoice}
    <MultipleChoice {question} />
  {/if}
  {#if isNumberGuess}
    <NumberGuess {question} />
  {/if}
  {#if isNumberPoll}
    <NumberPoll {question} />
  {/if}
  {#if isMapPointGuess}
    <MapPointGuess {question} />
  {/if}
  <div class="s-q-item__footer">
    {#if question.notes}
      <div class="s-q-item__footer__notes">
        {question.notes}
      </div>
    {/if}
  </div>
  <button
    class="q-quiz-button q-quiz-button--horizontal q-quiz-button--right s-font-note-s state-hidden"
  >
    <div class="q-quiz-button__content">
      <span>nächste Frage</span>
      <div
        class="q-quiz-button__icon q-quiz-button__icon s-button s-button--small s-button--circular "
      >
        <svg
          class="s-button__icon"
          viewBox="0 0 28 28"
          width="16"
          heigth="16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" fill-rule="evenodd">
            <path
              fill="currentColor"
              d="M9.8 22.4l1.4 1.4L21 14l-9.8-9.8-1.4 1.4 8.4 8.4z"
            />
          </g>
        </svg>
      </div>
    </div>
  </button>
</div>
