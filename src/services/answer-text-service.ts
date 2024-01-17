import type { Statistic } from '@src/interfaces';

// TODO: move to svelte component
export function getAnswerTextElement(
  stats: Statistic,
  isCorrectAnswer: boolean,
  getDiffText: () => string
) {
  let statsTextHtml = '<span class="q-quiz-answer-stats">';
  const betterThanCount = stats?.betterThanCount;

  if (isCorrectAnswer) {
    statsTextHtml +=
      '<span class="s-font-text-s">Wir ziehen den Hut. Das ist nicht gut geschätzt, sondern exakt richtig.</span>';
  } else if (
    stats.betterThanCount &&
    stats.totalAnswers - stats.betterThanCount === 1
  ) {
    statsTextHtml += `<span class="s-font-text-s">
        Gratulation! So gut hat bis jetzt noch niemand geschätzt.`;

    if (stats.totalAnswers === 1) {
      statsTextHtml +=
        ' Etwas relativieren müssen wir das Lob allerdings: Sie waren so schnell, dass noch niemand vor Ihnen mitgemacht hat.';
    } else if (stats.totalAnswers === 2) {
      statsTextHtml +=
        ' Etwas relativieren müssen wir das Lob allerdings: Sie waren so schnell, dass erst eine andere Person mitgemacht hat.';
    } else if (stats.totalAnswers <= 11) {
      statsTextHtml += ` Etwas relativieren müssen wir das Lob allerdings: Sie waren so schnell, dass erst ${
        stats.totalAnswers - 1
      } andere mitgemacht haben.`;
    }
    statsTextHtml += '</span>';
  } else if (stats.betterThanPercentage && stats.betterThanPercentage > 90) {
    statsTextHtml += `<span class="s-font-text-s">
        Hervorragend. Nur ${
          100 - stats.betterThanPercentage
        } Prozent aller anderen haben noch besser geschätzt als Sie.
      </span>`;
  } else if (stats.betterThanPercentage && stats.betterThanPercentage > 20) {
    statsTextHtml += `<span class="s-font-text-s">
        Sie haben damit besser geschätzt als ${stats.betterThanPercentage} Prozent aller anderen.
      </span>`;
  } else if (
    stats.betterThanPercentage === 0 &&
    stats.numberOfSameAnswers === 0
  ) {
    statsTextHtml += `<span class="s-font-text-s">Niemand lag so weit daneben wie Sie.`;

    if (stats.totalAnswers === 2) {
      statsTextHtml +=
        ' Das klingt schlimmer, als es ist. Sie waren so schnell, dass erst eine andere Person mitgemacht hat. Ihre Schätzung ist also auch die zweitbeste.';
    } else if (stats.totalAnswers <= 11) {
      statsTextHtml += ` Das klingt schlimmer, als es ist. Sie waren so schnell, dass erst ${
        stats.totalAnswers - 1
      } andere mitgemacht haben.`;
    }
    statsTextHtml += '</span>';
  } else if (stats.betterThanPercentage === 0) {
    statsTextHtml += `<span class="s-font-text-s">
        Schlechter hat bisher noch niemand geschätzt.
      </span>`;
  } else if (
    stats.betterThanPercentage !== undefined &&
    stats.betterThanPercentage !== null
  ) {
    statsTextHtml += `<span class="s-font-text-s">
        Nur ${stats.betterThanPercentage} Prozent aller anderen lagen noch weiter daneben als Sie.
      </span>`;
  }
  statsTextHtml += '</span>';

  let textAnswerHtml = '';

  console.log('sadfdsaf', isCorrectAnswer, getDiffText);
  if (!isCorrectAnswer && getDiffText) {
    textAnswerHtml += ` ${getDiffText()}`;
    console.log('textAnswerHtml', textAnswerHtml);
  }

  textAnswerHtml += ` ${statsTextHtml}`;

  let element = document.createElement('span');
  element.innerHTML = textAnswerHtml;
  return element;
}
