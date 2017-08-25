import * as helpers from './helpers.js'

export function getAnswerTextElement(stats, isCorrectAnswer, getDiffText) {
  let statsTextHtml = '<span class="q-quiz-answer-stats">'

  if (isCorrectAnswer) {
    statsTextHtml += '<span class="s-font-text-s">Wir ziehen den Hut. Das ist nicht gut geschätzt, sondern exakt richtig.</span>'

  } else if (stats.totalAnswers - stats.betterThanCount === 1) {
    statsTextHtml += `<span class="s-font-text-s">
      Gratulation! So gut hat bis jetzt noch niemand geschätzt.`

    if (stats.totalAnswers === 1) {
      statsTextHtml += ' Etwas relativieren müssen wir das Lob allerdings: Sie waren so schnell, dass noch niemand vor Ihnen mitgemacht hat.'
    } else if (stats.totalAnswers === 2) {
      statsTextHtml += ' Etwas relativieren müssen wir das Lob allerdings: Sie waren so schnell, dass erst eine andere Person mitgemacht hat.'
    } else if (stats.totalAnswers <= 11) {
      statsTextHtml += ` Etwas relativieren müssen wir das Lob allerdings: Sie waren so schnell, dass erst ${stats.totalAnswers - 1} andere mitgemacht haben.`
    }
    statsTextHtml += '</span>';

  } else if (stats.betterThanPercentage > 90) {
    statsTextHtml += `<span class="s-font-text-s">
      Hervorragend. Nur ${100 - stats.betterThanPercentage} Prozent aller anderen haben noch besser geschätzt als Sie.
    </span>`

  } else if (stats.betterThanPercentage > 20) {
    statsTextHtml += `<span class="s-font-text-s">
      Sie haben damit besser geschätzt als ${stats.betterThanPercentage} Prozent aller anderen.
    </span>`

  } else if (stats.betterThanPercentage === 0 && stats.numberOfSameAnswers === 0) {
    statsTextHtml += `<span class="s-font-text-s">Niemand lag so weit daneben wie Sie.`

    if (stats.totalAnswers === 2) {
      statsTextHtml += ' Das klingt schlimmer als es ist. Sie waren so schnell, dass erst eine andere Person mitgemacht hat. Ihre Schätzung ist also auch die Zweitbeste.'
    } else if (stats.totalAnswers <= 11) {
      statsTextHtml += ` Das klingt schlimmer als es ist. Sie waren so schnell, dass erst ${stats.totalAnswers - 1} andere mitgemacht haben.`
    } else {
      statsTextHtml += ' Dürfen wir Ihnen, damit das nicht mehr vorkommt, ein <a href="https://abo.nzz.ch">NZZ-Abo</a> empfehlen?'
    }
    statsTextHtml += '</span>'

  } else if (stats.betterThanPercentage === 0) {
    statsTextHtml += `<span class="s-font-text-s">
      Schlechter hat bisher noch niemand geschätzt.
    </span>`

  } else if (stats.betterThanPercentage !==  undefined && stats.betterThanPercentage !== null) {
    console.log('better than percentage: ' + stats.betterThanPercentage);
    statsTextHtml += `<span class="s-font-text-s">
      Nur ${stats.betterThanPercentage} Prozent aller anderen lagen noch weiter daneben als Sie.
    </span>`
  }
  statsTextHtml += '</span>'


  let textAnswerHtml = ''

  if (!isCorrectAnswer && getDiffText) {
    textAnswerHtml += ` ${getDiffText()}`
  }

  textAnswerHtml += ` ${statsTextHtml}`

  let element = document.createElement('span')
  element.innerHTML = textAnswerHtml
  return element
}

function getRecommendationsElement(articleRecommendations) {
  let recommendationsElement = document.createElement('p');
  recommendationsElement.classList.add('s-font-text-s');
  let recommendationsHtml = '';
  if (articleRecommendations && articleRecommendations.length) {
    
    let punctuation = ['!', '?', '.'];

    helpers.loadAdditionalArticles(articleRecommendations.map(r => r.articleId))
      .then(articles => {
        articles.forEach((article, index) => {
          let recommendationText = '';
          if (articleRecommendations[index].text && articleRecommendations[index].text.length && articleRecommendations[index].text.length > 0) {
            recommendationText = articleRecommendations[index].text + ' ';
          }
          recommendationsHtml += `
            <span>${recommendationText}<a href="${article.webUrl}">${article.title}</a>${punctuation.indexOf(article.title.slice(-1)) === -1 ? '.' : ''} </span>
          `;
        })
      })
      .then(() => {
        recommendationsElement.innerHTML = recommendationsHtml
      })
  }
  return recommendationsElement
}

function getFinalScoreElement(finalScore) {
  let finalScoreElement = document.createElement('div');
  let finalScoreHTML = '';
  if (finalScore.multipleChoice.numberQuestions > 0) {
    finalScoreHTML += `<span>Sie haben ${finalScore.multipleChoice.sumCorrect} von ${finalScore.multipleChoice.numberQuestions} Fragen richtig beantwortet. </span>`;
  }
  if (finalScore.numberGuess.numberAnswers > 0) {
    finalScoreHTML += `<span>Bei den Schätzfragen lagen Sie durchschnittlich um ${finalScore.numberGuess.sumDiffPercentage / finalScore.numberGuess.numberAnswers}% daneben. </span>`;
  } 
  if (finalScore.mapPointGuess.numberAnswers > 0) {
    let avgDistance = finalScore.mapPointGuess.sumDistance / finalScore.mapPointGuess.numberAnswers;
    let distanceText = getDistanceText(avgDistance);
    finalScoreHTML += `<span>Bei den Ortsschätzfragen lagen Sie durchschnittlich um ${distanceText} daneben.</span>`;
  } 
  finalScoreElement.innerHTML = finalScoreHTML;
  return finalScoreElement;
}

export function getDistanceText(distance) {
  if (distance > 1000) {
    return `${(distance / 1000).toFixed(1)} km`;
  } else {
    return `${distance} m`;
  }
}

export function renderAdditionalInformationForLastCard(element, finalScore, articleRecommendations) {
  let articleRecommendationsContainer = element.querySelector('.q-quiz-article-recommendations');
  let articleRecommendationsElement = getRecommendationsElement(articleRecommendations);
  articleRecommendationsContainer.appendChild(articleRecommendationsElement);

  if (finalScore.isFinalScoreShown) {
    let finalScoreContainer = element.querySelector('.q-quiz-final-score');
    let finalScoreElement = getFinalScoreElement(finalScore);
    finalScoreContainer.appendChild(finalScoreElement);
  }
}

export function renderAdditionalInformationForQuestion(element, correctAnswer) {
    let detailedAnswer = element.querySelector('.q-quiz-result .q-quiz-result-answer-text');
    let detailedAnswerSpan = document.createElement('span');
    detailedAnswerSpan.classList.add('s-font-text-s');
    if (correctAnswer.answerText) {
      detailedAnswerSpan.innerHTML = correctAnswer.answerText;
    }
    detailedAnswer.appendChild(detailedAnswerSpan);

    let articleRecommendationsElement = getRecommendationsElement(correctAnswer.articleRecommendations);
    detailedAnswer.parentNode.insertBefore(articleRecommendationsElement, detailedAnswer.nextSibling);

    let nextQuestionButton = element.querySelector('button.q-quiz-button.q-quiz-button--horizontal.q-quiz-button--right');
    nextQuestionButton.classList.remove('state-hidden');
  }
