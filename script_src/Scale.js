export default class Scale {

  constructor(domain, range) {
    this.domain = domain;
    this.range = range;
  }

  getValueOnScale(value) {
    return this.range[this.getIndexOnScale(value)]
  }

  getIndexOnScale(value) {
    let ratio = (this.range[this.range.length - 1] - this.range[0]) / (this.domain[1] - this.domain[0]);
    let result = this.range[0] + ratio * (value - this.domain[0]);

    let indexOnScale;
    this.range.forEach((possibleValue, index) => {
      if (result >= possibleValue && this.range[index + 1] && result < this.range[index + 1]) {
        indexOnScale = index;
      } else if (result >= possibleValue && index === this.range.length - 1) {
        indexOnScale = index;
      }
    })

    return indexOnScale;
  }

}
