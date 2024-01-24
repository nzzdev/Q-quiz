<script lang="ts">
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { select } from 'd3-selection';
  import { max } from 'd3-array';

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

  function buildChart(chartWidth: number) {
    try {
      let margin = {
        top: 0,
        right: 0,
        bottom: 30,
        left: 0,
      };
      let width = chartWidth - margin.left - margin.right;
      let height = 90 - margin.top - margin.bottom;

      // let precision = getPrecision(data.step);

      let xDomain = [];
      for (
        let i = data.min;
        i <= data.max;
        i = parseFloat((i + data.step).toFixed(10))
      ) {
        xDomain.push(i);
      }

      let xScale = scaleBand()
        .domain(xDomain.map(String))
        // we probably want to have this padding, its removed to have it easier on the client to calculate the position for the overlaying correct and users answer
        // .paddingInner(0.1)
        .range([0, width]);

      let yScale = scaleLinear()
        .domain([
          0,
          Math.max(
            200 / statistics.length,
            max(statistics, (statistic) =>
              parseInt(statistic.value.toString(), 10)
            ) as number
          ),
        ])
        .range([height, 0]);

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

      let bars = svg
        .selectAll('.bar')
        .data(statistics)
        .enter()
        .append('rect')
        .attr('class', 's-color-gray-4')
        .attr('fill', 'currentColor')
        .attr('x', (statistic) => String(xScale(statistic.key.toString())))
        .attr('width', xScale.bandwidth())
        .attr('y', (statistic) => yScale(statistic.value))
        .attr('height', function (statistic) {
          return Math.max(1, height - yScale(statistic.value));
        });
    } catch (err) {
      console.log(err);
    }
  }
</script>

<div bind:this={element}></div>
