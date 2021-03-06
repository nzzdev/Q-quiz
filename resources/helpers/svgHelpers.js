
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const getPrecision = require("../../resources/helpers/utils.js").getPrecision;

let d3 = {
  scaleLinear: require("d3-scale").scaleLinear,
  scaleBand: require("d3-scale").scaleBand,
  max: require("d3-array").max,
  select: require("d3-selection").select,
};

function getStripplotSvg(data, stats, plotWidth) {
  return new Promise((resolve, reject) => {
    // in order to work with jsdom like that let jsdom version at 9.5
    // should be rebuilt and upgraded in the future
    const dom = new JSDOM("");
    if (!stats) {
      reject("stats is undefined");
      return;
    }

    let margin = { top: 0, right: 0, bottom: 30, left: 0 },
      width = plotWidth - margin.left - margin.right,
      height = 90 - margin.top - margin.bottom;

    let xScale = d3
      .scaleLinear()
      .domain([data.min, data.max])
      .range([0, width]);

    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(stats, (d) => parseInt(d.count))])
      .range([height, 0]);

    let element = dom.window.document.createElement("div");

    let svg = d3
      .select(element)
      .append("svg")
      .datum(stats)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", margin.top)
      .attr("width", width)
      .attr("height", 60)
      .attr("fill", "transparent");

    svg
      .append("text")
      .text(data.min)
      .attr(
        "class",
        "s-font-note-s s-font-note-s--light s-font-note--tabularnums"
      )
      .attr("text-anchor", "start")
      .attr("x", 3)
      .attr("y", margin.top + 60)
      .attr("dy", "1em");
    svg
      .append("line")
      .attr("class", "s-color-gray-6 q-quiz-answer-chart-min-line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", margin.top + height + 2)
      .attr("y2", margin.top + height + 8);

    svg
      .append("text")
      .text(data.max)
      .attr(
        "class",
        "s-font-note-s s-font-note-s--light s-font-note--tabularnums"
      )
      .attr("text-anchor", "end")
      .attr("x", width - 3)
      .attr("y", margin.top + 60)
      .attr("dy", "1em");
    svg
      .append("line")
      .attr("class", "s-color-gray-6 q-quiz-answer-chart-max-line")
      .attr("x1", width)
      .attr("x2", width)
      .attr("y1", margin.top + height + 2)
      .attr("y2", margin.top + height + 8);

    let lines = svg
      .selectAll("line.q-quiz-answer-chart-line")
      .data(stats)
      .enter()
      .append("line")
      .attr("class", "q-quiz-answer-chart-line s-color-gray-8")
      .attr("style", (d) => {
        return `opacity: ${0.1 * d.count > 0.9 ? 0.9 : 0.1 * d.count}`;
      })
      .attr("x1", (d) => xScale(d.value))
      .attr("x2", (d) => xScale(d.value))
      .attr("y1", margin.top)
      .attr("y2", margin.top + 60);

    resolve(element.innerHTML);
  });
}

function getBarchartSvg(data, stats, chartWidth) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM("");
    if (!stats) {
      reject("stats is undefined");
      return;
    }

    let margin = { top: 0, right: 0, bottom: 30, left: 0 },
      width = chartWidth - margin.left - margin.right,
      height = 90 - margin.top - margin.bottom;

    let precision = getPrecision(data.step);

    let xDomain = [];
    for (
      let i = data.min;
      i <= data.max;
      i = parseFloat((i + data.step).toFixed(precision))
    ) {
      xDomain.push(i);
    }

    let xScale = d3
      .scaleBand()
      .domain(xDomain)
      // we probably want to have this padding, its removed to have it easier on the client to calculate the position for the overlaying correct and users answer
      // .paddingInner(0.1)
      .range([0, width]);

    let yScale = d3
      .scaleLinear()
      .domain([
        0,
        Math.max(
          200 / stats.length,
          d3.max(stats, (d) => parseInt(d.count))
        ),
      ])
      .range([height, 0]);

    let element = dom.window.document.createElement("div");

    let svg = d3
      .select(element)
      .append("svg")
      .datum(stats)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", margin.top)
      .attr("width", width)
      .attr("height", 60)
      .attr("fill", "transparent");

    svg
      .append("text")
      .text(data.min)
      .attr(
        "class",
        "s-font-note-s s-font-note-s--light s-font-note--tabularnums"
      )
      .attr("text-anchor", "start")
      .attr("x", 3)
      .attr("y", margin.top + 60)
      .attr("dy", "1em");
    svg
      .append("line")
      .attr("class", "s-color-gray-6 q-quiz-answer-chart-min-line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", margin.top + height + 2)
      .attr("y2", margin.top + height + 8);

    svg
      .append("text")
      .text(data.max)
      .attr(
        "class",
        "s-font-note-s s-font-note-s--light s-font-note--tabularnums"
      )
      .attr("text-anchor", "end")
      .attr("x", width - 3)
      .attr("y", margin.top + 60)
      .attr("dy", "1em");
    svg
      .append("line")
      .attr("class", "s-color-gray-6 q-quiz-answer-chart-max-line")
      .attr("x1", width)
      .attr("x2", width)
      .attr("y1", margin.top + height + 2)
      .attr("y2", margin.top + height + 8);

    let bars = svg
      .selectAll(".bar")
      .data(stats)
      .enter()
      .append("rect")
      .attr("class", "s-color-gray-4")
      .attr("fill", "currentColor")
      .attr("x", function (d) {
        return xScale(d.value);
      })
      .attr("width", xScale.bandwidth())
      .attr("y", function (d) {
        return yScale(d.count);
      })
      .attr("height", function (d) {
        return Math.max(1, height - yScale(d.count));
      });

    resolve(element.innerHTML);
  });
}

module.exports = {
  getBarchartSvg: getBarchartSvg,
  getStripplotSvg: getStripplotSvg,
};
