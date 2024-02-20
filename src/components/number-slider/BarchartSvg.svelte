<script lang="ts">
  import { getContext } from 'svelte';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { select } from 'd3-selection';
  import { max } from 'd3-array';

  import key from '@src/services/key-service';
  import { getPrecision } from '@src/helpers/utils';
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

  function buildChart(chartWidth: number) {
    try {
      let margin = {
        top: 0,
        right: 0,
        bottom: 80,
        left: 0,
      };
      let width = chartWidth - margin.left - margin.right;
      let height = 150 - margin.top - margin.bottom;

      let precision = getPrecision(data.step);

      let xDomain = [];
      for (
        let i = data.min;
        i <= data.max;
        i = parseFloat((i + data.step).toFixed(precision))
      ) {
        xDomain.push(i);
      }

      let xScale = scaleBand()
        .domain(xDomain.map(String))
        // we probably want to have this padding, its removed to have it easier on the client to calculate the position for the overlaying correct and users answer
        // .paddingInner(0.1)
        .range([0, width]);

      const maxYValue = Math.max(
        200 / statistics.length,
        max(statistics, (statistic) =>
          parseInt(statistic.value.toString(), 10)
        ) as number
      );

      let yScale = scaleLinear().domain([0, maxYValue]).range([height, 0]);

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
        .attr('y', height)
        .attr('dy', '1em');
      svg
        .append('line')
        .attr('class', 's-color-gray-6 q-quiz-answer-chart-min-line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', height + 2)
        .attr('y2', height + 8);

      svg
        .append('text')
        .text(data.max)
        .attr(
          'class',
          's-font-note-s s-font-note-s--light s-font-note--tabularnums'
        )
        .attr('text-anchor', 'end')
        .attr('x', width - 3)
        .attr('y', height)
        .attr('dy', '1em');
      svg
        .append('line')
        .attr('class', 's-color-gray-6 q-quiz-answer-chart-max-line')
        .attr('x1', width)
        .attr('x2', width)
        .attr('y1', height + 2)
        .attr('y2', height + 8);

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

      // correct answer marker
      if (correctAnswer) {
        svg
          .append('rect')
          .attr('class', 's-color-gray-8')
          .attr('fill', 'currentColor')
          .attr('x', String(xScale(correctAnswer.toString())))
          .attr('width', xScale.bandwidth())
          .attr('y', yScale(1))
          .attr('height', Math.max(1, height - yScale(1)));
        svg
          .append('line')
          .attr('class', 'q-quiz-answer-chart-line s-font-note s-color-gray-8')
          .attr('stroke-width', 4)
          .attr(
            'x1',
            String(
              (xScale(correctAnswer.toString()) || 0) + xScale.bandwidth() / 2
            )
          )
          .attr(
            'x2',
            String(
              (xScale(correctAnswer.toString()) || 0) + xScale.bandwidth() / 2
            )
          )
          .attr('dx', xScale.bandwidth() / 2)
          .attr('y1', yScale(1) + 5)
          .attr('y2', yScale(1) + 5 + 6);
        svg
          .append('text')
          .text('Korrekte Antwort')
          .attr('class', 's-color-gray-8 s-font-note q-quiz-marker-text')
          .attr(
            'x',
            String(
              (xScale(correctAnswer.toString()) || 0) + xScale.bandwidth() / 2
            )
          )
          .attr('dx', correctAnswer < data.max / 2 ? -2 : 0)
          .attr('y', yScale(1) + 5 + 8 + 12)
          .attr('text-anchor', correctAnswer < data.max / 2 ? 'start' : 'end');

        svg
          .append('text')
          .text(`${correctAnswer}`)
          .attr(
            'class',
            's-color-gray-8 s-font-note s-font-note--strong s-font-note--tabularnums q-quiz-marker-text'
          )
          .attr(
            'x',
            String(
              (xScale(correctAnswer.toString()) || 0) + xScale.bandwidth() / 2
            )
          )
          .attr('dx', correctAnswer < data.max / 2 ? -2 : 0)
          .attr('y', yScale(1) + 5 + 8 + 12 + 15)
          .attr('text-anchor', correctAnswer < data.max / 2 ? 'start' : 'end');
      }

      // user answer marker
      const maxValueOfUserAnswer = statistics.find(
        (statistic) => userAnswer === parseFloat(statistic.key)
      );

      svg
        .append('rect')
        .attr('class', 's-color-primary-7')
        .attr('fill', 'currentColor')
        .attr('x', String(xScale(userAnswer.toString())))
        .attr('width', xScale.bandwidth())
        .attr('y', yScale(1))
        .attr('height', Math.max(1, height - yScale(1)));

      svg
        .append('line')
        .attr('class', 'q-quiz-answer-chart-line s-font-note s-color-primary-7')
        .attr('stroke-width', 4)
        .attr(
          'x1',
          String((xScale(userAnswer.toString()) || 0) + xScale.bandwidth() / 2)
        )
        .attr(
          'x2',
          String((xScale(userAnswer.toString()) || 0) + xScale.bandwidth() / 2)
        )
        .attr('dx', xScale.bandwidth() / 2)
        .attr('y1', yScale(maxValueOfUserAnswer?.value || 1) - 2)
        .attr('y2', -11);

      svg
        .append('text')
        .text(labelText)
        .attr('class', 's-color-primary-7 s-font-note q-quiz-marker-text')
        .attr(
          'x',
          String((xScale(userAnswer.toString()) || 0) + xScale.bandwidth() / 2)
        )
        .attr('dx', userAnswer < data.max / 2 ? -2 : 0)
        .attr('y', -27)
        .attr('text-anchor', userAnswer < data.max / 2 ? 'start' : 'end');

      svg
        .append('text')
        .text(`${userAnswer}`)
        .attr(
          'class',
          's-color-primary-7 s-font-note s-font-note--strong s-font-note--tabularnums q-quiz-marker-text'
        )
        .attr(
          'x',
          String((xScale(userAnswer.toString()) || 0) + xScale.bandwidth() / 2)
        )
        .attr('dx', userAnswer < data.max / 2 ? -2 : 0)
        .attr('y', -13)
        // .attr('y', yScale(1) + 5 + 8 + 15 + 15)
        .attr('text-anchor', userAnswer < data.max / 2 ? 'start' : 'end');
    } catch (err) {
      console.error(err);
    }
  }
</script>

<div bind:this={element}></div>
