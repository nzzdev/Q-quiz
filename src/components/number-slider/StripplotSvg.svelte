<script lang="ts">
  import { max } from 'd3-array';
  import { scaleLinear } from 'd3-scale';
  import { select } from 'd3-selection';

  import { containerWidthStore } from '@src/store/container.store';
  import type {
    NumberOfAnswersPerChoice,
    SliderQuestion,
  } from '@src/interfaces';

  export let data: SliderQuestion;
  export let statistics: NumberOfAnswersPerChoice[];

  let element: HTMLDivElement;

  $: if (element) {
    buildChart($containerWidthStore);
  }

  function buildChart(plotWidth: number) {
    if (!plotWidth) return;
    let margin = { top: 0, right: 0, bottom: 30, left: 0 },
      width = plotWidth - margin.left - margin.right,
      height = 90 - margin.top - margin.bottom;

    const maxValue = max(statistics, (d) => d.value) as number;
    let xScale = scaleLinear().domain([data.min, data.max]).range([0, width]);
    let yScale = scaleLinear().domain([0, maxValue]).range([height, 0]);

    element.innerHTML = '';
    let svg = select(element)
      .append('svg')
      .datum(statistics)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', margin.top)
      .attr('width', width)
      .attr('height', 60)
      .attr('fill', 'transparent');

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
      .attr('y1', margin.top + height + 2)
      .attr('y2', margin.top + height + 8);

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
      .attr('y1', margin.top + height + 2)
      .attr('y2', margin.top + height + 8);

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
  }
</script>

<div bind:this={element}></div>
