<script>
  export let question;

  $: answers = getAnswers(question);

  function getAnswers(question) {
    if (question.choices === undefined) {
      question.choices = [];
    }

    let answers = question.choices;
    if (question.answer) {
      answers = answers.concat(question.answer);
    }

    for (let i = answers.length; i; i--) {
      const randomIndex = Math.floor(Math.random() * i);
      const element = answers[i - 1];
      answers[i - 1] = answers[randomIndex];
      answers[randomIndex] = element;
    }
    return answers;
  }
</script>

<div class="q-quiz-input">
  {#each answers as answer}
    <button
      class="s-button s-button--secondary s-button--small q-quiz-answer-button"
      value={answer}
    >
      <span style="pointer-events: none;">{answer}</span>
    </button>
  {/each}
</div>
<div class="q-quiz-result state-hidden">
  <div class="q-quiz-result-visual q-quiz-result-visual--multiple-choice">
    {#each answers as answer}
      <div class="q-quiz-result__answer s-font-note">
        <span>{answer}</span>
        <div class="q-quiz-result__multiple-choice-bar" />
      </div>
    {/each}
  </div>
  <p class="q-quiz-result-answer-text s-font-text-s" />
</div>
