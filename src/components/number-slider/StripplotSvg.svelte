<script lang="ts">
  import { getContext } from 'svelte';
  import { max } from 'd3-array';
  import { scaleLinear } from 'd3-scale';
  import { select } from 'd3-selection';

  import key from '@src/services/key-service';
  import type {
    NumberOfAnswersPerChoice,
    SliderQuestion,
    QuizStoreContext,
  } from '@src/interfaces';

  export let data: SliderQuestion;
  export let statistics: NumberOfAnswersPerChoice[];
  export let correctAnswer: number;
  export let userAnswer: number;
  export let labelText: string;

  const { containerWidthStore } = getContext(key) as QuizStoreContext;

  let element: HTMLDivElement;

  $: if (element) {
    buildChart($containerWidthStore);
  }

  function buildChart(plotWidth: number) {
    if (!plotWidth) return;
    let margin = { top: 0, right: 0, bottom: 80, left: 0 },
      width = plotWidth - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

    const maxValue = max(statistics, (d) => d.value) as number;
    let xScale = scaleLinear().domain([data.min, data.max]).range([0, width]);
    element.innerHTML = '';
    let svg = select(element)
      .append('svg')
      .datum(statistics)
      .attr('width', width + margin.left + margin.right + 1)
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', [0, 0, width + 1, height])
      .attr('style', 'max-width: 100%; height: auto;')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    svg
      .append('text')
      .text(data.min)
      .attr(
        'class',
        's-font-note-s s-font-note-s--light s-font-note--tabularnums'
      )
      .attr('text-anchor', 'start')
      .attr('x', 3)
      .attr('y', margin.top + 60)
      .attr('dy', '1em');
    svg
      .append('line')
      .attr('class', 's-color-gray-6 q-quiz-answer-chart-min-line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', margin.top + 60 + 2)
      .attr('y2', margin.top + 60 + 8);

    svg
      .append('text')
      .text(data.max)
      .attr(
        'class',
        's-font-note-s s-font-note-s--light s-font-note--tabularnums'
      )
      .attr('text-anchor', 'end')
      .attr('x', width - 3)
      .attr('y', margin.top + 60)
      .attr('dy', '1em');
    svg
      .append('line')
      .attr('class', 's-color-gray-6 q-quiz-answer-chart-max-line')
      .attr('x1', width)
      .attr('x2', width)
      .attr('y1', margin.top + 60 + 2)
      .attr('y2', margin.top + 60 + 8);

    let lines = svg
      .selectAll('line.q-quiz-answer-chart-line')
      .data(statistics)
      .enter()
      .append('line')
      .attr('class', 'q-quiz-answer-chart-line s-color-gray-8')
      .attr('style', (d) => {
        return `opacity: ${0.1 * d.value > 0.9 ? 0.9 : 0.1 * d.value}`;
      })
      .attr('x1', (d) => xScale(parseFloat(d.key)))
      .attr('x2', (d) => xScale(parseFloat(d.key)))
      .attr('y1', margin.top)
      .attr('y2', margin.top + 60);

    // correct answer marker
    if (correctAnswer) {
      svg
        .append('line')
        .attr('class', 'q-quiz-answer-chart-line-marker s-color-gray-8')
        .attr('stroke-width', 4)
        .attr('x1', xScale(correctAnswer))
        .attr('x2', xScale(correctAnswer))
        .attr('y1', margin.top)
        .attr('y2', margin.top + 60);

      svg
        .append('line')
        .attr('class', 'q-quiz-answer-chart-line s-font-note s-color-gray-8')
        .attr('stroke-width', 4)
        .attr('x1', xScale(correctAnswer))
        .attr('x2', xScale(correctAnswer))
        .attr('y1', margin.top + 63)
        .attr('y2', margin.top + 70);

      svg
        .append('text')
        .text('Korrekte Antwort')
        .attr('class', 's-color-gray-8 s-font-note q-quiz-marker-text')
        .attr('x', xScale(correctAnswer))
        .attr('dx', correctAnswer < data.max / 2 ? -2 : 0)
        .attr('y', margin.top + 85)
        .attr('text-anchor', correctAnswer < data.max / 2 ? 'start' : 'end');

      svg
        .append('text')
        .text(`${correctAnswer}`)
        .attr(
          'class',
          's-color-gray-8 s-font-note s-font-note--strong s-font-note--tabularnums q-quiz-marker-text'
        )
        .attr('x', xScale(correctAnswer))
        .attr('dx', correctAnswer < data.max / 2 ? -2 : 0)
        .attr('y', margin.top + 100)
        .attr('text-anchor', correctAnswer < data.max / 2 ? 'start' : 'end');
    }

    // user answer marker
    svg
      .append('line')
      .attr('class', 'q-quiz-answer-chart-line-marker s-color-primary-7')
      .attr('stroke-width', 4)
      .attr('x1', xScale(userAnswer))
      .attr('x2', xScale(userAnswer))
      .attr('y1', margin.top)
      .attr('y2', margin.top + 60);

    svg
      .append('line')
      .attr('class', 'q-quiz-answer-chart-line s-color-primary-7')
      .attr('stroke-width', 4)
      .attr('x1', xScale(userAnswer))
      .attr('x2', xScale(userAnswer))
      .attr('y1', margin.top - 3)
      .attr('y2', margin.top - 10);

    svg
      .append('text')
      .text(labelText)
      .attr('class', 's-font-note s-color-primary-7 q-quiz-marker-text')
      .attr('x', xScale(userAnswer))
      .attr('dx', userAnswer < data.max / 2 ? -2 : 0)
      .attr('y', margin.top - 15)
      .attr('text-anchor', userAnswer < data.max / 2 ? 'start' : 'end');

    svg
      .append('text')
      .text(`${userAnswer}`)
      .attr(
        'class',
        's-font-note s-font-note--strong s-font-note--tabularnums s-color-primary-7 q-quiz-marker-text'
      )
      .attr('x', xScale(userAnswer))
      .attr('dx', userAnswer < data.max / 2 ? -2 : 0)
      .attr('y', margin.top - 30)
      .attr('text-anchor', userAnswer < data.max / 2 ? 'start' : 'end');
  }
</script>

<div bind:this={element}></div>

<style lang="scss">
</style>
