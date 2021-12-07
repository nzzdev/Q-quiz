<script>
  export let isMultiQuiz;
  export let hasCover;
  export let numberQuestions;

  $: multiHeaderClassAttribute = isMultiQuiz
    ? "q-quiz-multi-header"
    : "q-quiz-single-header";
  $: headerClassAttribute = hasCover ? "q-quiz-header--is-empty" : "";
  $: buttonClassAttribute = hasCover ? "q-quiz-button--hidden" : "";
</script>

<header
  class="q-quiz-header s-color-gray-4 {multiHeaderClassAttribute} {headerClassAttribute}"
>
  {#if isMultiQuiz}
    <div class="q-quiz-header__title s-font-note-s">
      {#if !hasCover}
        Frage 1 / {numberQuestions}
      {/if}
    </div>
    <button
      class="q-quiz-button q-quiz-button--horizontal s-font-note-s {buttonClassAttribute}"
    >
      <div class="q-quiz-button__content">
        <span class="s-color-primary-7">nächste Frage</span>
      </div>
    </button>
  {/if}
</header>
