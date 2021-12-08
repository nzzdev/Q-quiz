<script>
  import Header from "./Header.svelte";
  import Question from "./question/Question.svelte";

  export let item;
  export let quizContainerId;
  export let imageServiceUrl;

  $: elementWidth = getElementWidth(item.elementCount);
  $: isMultiQuiz = item.elementCount > 1;
  $: quizContainerClassAttribute = getQuizContainerClassAttribute(isMultiQuiz);
  $: lastCardActiveStateAttribute = getLastCardActiveStateAttribute(
    isMultiQuiz,
    item.hasLastCard
  );
  $: lastCardDisplay = getLastCardDisplay(lastCardActiveStateAttribute);
  $: quizLinkClass = getQuizLinkClass();

  function getElementWidth(elementCount) {
    return elementCount > 0 ? 100 / elementCount : 0;
  }

  function getQuizContainerClassAttribute(isMultiQuiz) {
    return isMultiQuiz ? "q-quiz-multi-container" : "q-quiz-single-container";
  }

  function getLastCardActiveStateAttribute(isMultiQuiz, hasLastCard) {
    return !isMultiQuiz && hasLastCard
      ? "q-quiz-element-container--is-active"
      : "q-quiz-element-container--is-inactive";
  }

  function getLastCardDisplay(lastCardActiveStateAttribute) {
    // if last card is not active add "display: none" so that it does not increase
    // height until styles are loaded
    return lastCardActiveStateAttribute ===
      "q-quiz-element-container--is-inactive"
      ? "display: none;"
      : "";
  }

  function getQuizLinkClass(item) {
    if (item.hasLastCard && (item.isFinalScoreShown || item.lastCard.text)) {
      return "q-quiz-play-another-container q-quiz-play-another-container--separator";
    } else {
      return "q-quiz-play-another-container";
    }
  }
</script>

<div
  class="s-q-item q-quiz s-color-gray-4"
  id={quizContainerId}
  style="opacity: 0;"
  data-track-id="quiz"
  data-track-component-id={item._id}
>
  <Header
    {isMultiQuiz}
    hasCover={item.hasCover}
    numberQuestions={item.questions.length}
  />
  <div
    class="{quizContainerClassAttribute} s-color-gray-4"
    style="width:{item.elementCount * 100}%;"
  >
    {#if item.hasCover}
      <div
        class="q-quiz-element-container q-quiz__cover s-color-primary-1 q-quiz-element-container--is-active"
        style="width: {elementWidth}%;"
      >
        <h3 class="q-quiz__cover-title s-font-title">
          {#if item.cover.title}{item.cover.title}{/if}
        </h3>
        <button
          class="q-quiz-button q-quiz-button__icon s-button s-button--big s-button--circular"
        >
          <!-- does not really work with max width/height -->
          <svg
            class="s-button__icon"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" fill-rule="evenodd">
              <path
                fill="currentColor"
                d="M9.8 22.4l1.4 1.4L21 14l-9.8-9.8-1.4 1.4 8.4 8.4z"
              />
            </g>
          </svg>
        </button>
        <div class="s-font-note-s">Das Quiz starten</div>
      </div>
    {/if}
    {#each item.questions as question, index}
      {#if !isMultiQuiz || (!item.hasCover && index === 0)}
        <div
          class="q-quiz-element-container q-quiz-element-container--is-active"
          style="width: {elementWidth}%;"
        >
          <Question {question} {width} {imageServiceUrl} />
        </div>
      {:else}
        <div
          class="q-quiz-element-container q-quiz-element-container--is-inactive"
          style="width: {elementWidth}%; display: none;"
        >
          <Question {question} {width} {imageServiceUrl} />
        </div>
      {/if}
    {/each}
    {#if item.hasLastCard}
      <div
        class="q-quiz-element-container q-quiz__last-card s-color-primary-1 {lastCardActiveStateAttribute}"
        style="width: {elementWidth}%; {lastCardDisplay}"
      >
        <h3 class="s-q-item__title q-quiz-last-card-title">
          {item.lastCard.title || ""}
        </h3>
        {#if item.isFinalScoreShown}
          <p class="s-font-text-s q-quiz-final-score" />
        {/if}
        {#if item.lastCard.text}
          <p class="s-font-text-s">{item.lastCard.text}</p>
        {/if}
        <div class="q-quiz-article-recommendations" />
        {#if item.lastCard.quizLink}
          <div class="s-color-gray-4 {quizLinkClass}">
            <div class="s-font-note q-quiz-play-another-teaser">
              Als nächstes Quiz empfehlen wir:
            </div>
            {#if item.lastCard.quizTitle}
              <div class="s-q-item__title q-quiz-play-another-title">
                {item.lastCard.quizTitle}
              </div>
            {/if}
            <a href={item.lastCard.quizLink}>
              <button
                class="q-quiz-button q-quiz-button__icon s-button s-button--big s-button--circular"
              >
                <svg
                  class="s-button__icon"
                  viewBox="0 0 28 28"
                  width="28"
                  height="28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.488 21.49A13.428 13.428 0 0 1 0 13.695C0 6.131 6.267 0 13.998 0c7.73 0 13.997 6.131 13.997 13.694 0 7.564-6.267 13.695-13.997 13.695-2.706 0-5.232-.751-7.373-2.051L1.383 28l1.105-6.51zm10.322-5.043c0-.771.096-1.385.287-1.842.192-.457.542-.908 1.052-1.35.509-.444.848-.805 1.017-1.083.169-.278.253-.571.253-.88 0-.93-.439-1.396-1.317-1.396-.416 0-.75.126-1 .376s-.382.596-.393 1.037h-2.448c.01-1.052.358-1.875 1.042-2.47.684-.595 1.617-.892 2.8-.892 1.192 0 2.118.282 2.777.847.659.564.988 1.361.988 2.391 0 .468-.107.91-.321 1.326-.214.415-.588.877-1.123 1.383l-.684.636c-.428.402-.672.873-.734 1.413l-.034.504H12.81zm-.244 2.535c0-.368.128-.673.384-.912.256-.24.584-.36.983-.36.4 0 .728.12.984.36s.384.544.384.912c0 .364-.125.664-.376.9-.25.238-.58.356-.992.356-.41 0-.741-.118-.992-.355a1.186 1.186 0 0 1-.375-.9z"
                    fill="currentColor"
                    fill-rule="evenodd"
                  />
                </svg>
              </button>
            </a>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
