import { Window } from 'happy-dom';
import { select as d3Select } from 'd3-selection';
import {
  scaleBand as d3ScaleBand,
  scaleLinear as d3ScaleLinear,
} from 'd3-scale';
import { max as d3Max } from 'd3-array';

import type { AnswerStatistic, NumberElement } from '@src/interfaces';
import { getPrecision } from './utils';

const styleClasses = {
  text: 's-font-note-s s-font-note-s--light s-font-note--tabularnums',
  minLine: 's-color-gray-6 q-quiz-answer-chart-min-line',
  maxLine: 's-color-gray-6 q-quiz-answer-chart-max-line',
};

// TODO: refactor to svelte component
function getStripplotSvg(
  data: NumberElement,
  statistics: AnswerStatistic[],
  plotWidth: number
) {
  return new Promise((resolve, reject) => {
    // in order to work with jsdom like that let jsdom version at 9.5
    // should be rebuilt and upgraded in the future
    const window = new Window();
    if (!statistics) {
      reject('stats is undefined');
      return;
    }

    let margin = { top: 0, right: 0, bottom: 30, left: 0 },
      width = plotWidth - margin.left - margin.right,
      height = 90 - margin.top - margin.bottom;

    let xScale = d3ScaleLinear().domain([data.min, data.max]).range([0, width]);

    d3ScaleLinear()
      .domain([0, d3Max(statistics, (d) => d.count) as number])
      .range([height, 0]);

    let element = window.document.createElement('div');

    // TODO:
    // @ts-ignore
    let svg = d3Select(element)
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
      .attr('class', styleClasses.text)
      .attr('text-anchor', 'start')
      .attr('x', 3)
      .attr('y', margin.top + 60)
      .attr('dy', '1em');
    svg
      .append('line')
      .attr('class', styleClasses.minLine)
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', margin.top + height + 2)
      .attr('y2', margin.top + height + 8);

    svg
      .append('text')
      .text(data.max)
      .attr('class', styleClasses.text)
      .attr('text-anchor', 'end')
      .attr('x', width - 3)
      .attr('y', margin.top + 60)
      .attr('dy', '1em');
    svg
      .append('line')
      .attr('class', styleClasses.maxLine)
      .attr('x1', width)
      .attr('x2', width)
      .attr('y1', margin.top + height + 2)
      .attr('y2', margin.top + height + 8);

    svg
      .selectAll('line.q-quiz-answer-chart-line')
      .data(statistics)
      .enter()
      .append('line')
      .attr('class', 'q-quiz-answer-chart-line s-color-gray-8')
      .attr('style', (statistic: AnswerStatistic) => {
        return `opacity: ${
          0.1 * statistic.count > 0.9 ? 0.9 : 0.1 * statistic.count
        }`;
      })
      .attr('x1', (statistic: AnswerStatistic) => xScale(statistic.value))
      .attr('x2', (statistic: AnswerStatistic) => xScale(statistic.value))
      .attr('y1', margin.top)
      .attr('y2', margin.top + 60);

    resolve(element.innerHTML);
  });
}

function getBarchartSvg(
  data: NumberElement,
  statistics: AnswerStatistic[],
  chartWidth: number
) {
  return new Promise((resolve, reject) => {
    const window = new Window();
    if (!statistics) {
      reject('stats is undefined');
      return;
    }

    let margin = { top: 0, right: 0, bottom: 30, left: 0 },
      width = chartWidth - margin.left - margin.right,
      height = 90 - margin.top - margin.bottom;

    let precision = getPrecision(data.step);

    let xDomain = [];
    // TODO: refactor
    for (
      let i = data.min;
      i <= data.max;
      i = parseFloat((i + data.step).toFixed(precision))
    ) {
      xDomain.push(i.toString());
    }

    let xScale = d3ScaleBand()
      .domain(xDomain)
      // we probably want to have this padding, its removed to have it easier on the client to calculate the position for the overlaying correct and users answer
      // .paddingInner(0.1)
      .range([0, width]);

    let yScale = d3ScaleLinear()
      .domain([
        0,
        Math.max(
          200 / statistics.length,
          d3Max(statistics, (d) => d.count) as number
        ),
      ])
      .range([height, 0]);

    let element = window.document.createElement('div');

    // TODO:
    // @ts-ignore
    let svg = d3Select(element)
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
      .attr('class', styleClasses.text)
      .attr('text-anchor', 'start')
      .attr('x', 3)
      .attr('y', margin.top + 60)
      .attr('dy', '1em');
    svg
      .append('line')
      .attr('class', styleClasses.minLine)
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', margin.top + height + 2)
      .attr('y2', margin.top + height + 8);

    svg
      .append('text')
      .text(data.max)
      .attr('class', styleClasses.text)
      .attr('text-anchor', 'end')
      .attr('x', width - 3)
      .attr('y', margin.top + 60)
      .attr('dy', '1em');
    svg
      .append('line')
      .attr('class', styleClasses.maxLine)
      .attr('x1', width)
      .attr('x2', width)
      .attr('y1', margin.top + height + 2)
      .attr('y2', margin.top + height + 8);

    svg
      .selectAll('.bar')
      .data(statistics)
      .enter()
      .append('rect')
      .attr('class', 's-color-gray-4')
      .attr('fill', 'currentColor')
      .attr('x', (statistic) => xScale(statistic.value.toString()) as number)
      .attr('width', xScale.bandwidth())
      .attr('y', function (d) {
        return yScale(d.count);
      })
      .attr('height', function (d) {
        return Math.max(1, height - yScale(d.count));
      });

    resolve(element.innerHTML);
  });
}

module.exports = {
  getBarchartSvg: getBarchartSvg,
  getStripplotSvg: getStripplotSvg,
};
