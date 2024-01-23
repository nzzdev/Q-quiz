export default class Scale {
  constructor(private domain: number[], public range: number[]) {}

  public getValueOnScale(value: number) {
    let indexOnScale = this.getIndexOnScale(value);
    if (indexOnScale) {
      return this.range[indexOnScale];
    }
    return [];
  }

  public getIndexOnScale(value: number) {
    let ratio =
      (this.range[this.range.length - 1] - this.range[0]) /
      (this.domain[1] - this.domain[0]);
    let result = this.range[0] + ratio * (value - this.domain[0]);

    let indexOnScale = 0;
    this.range.forEach((possibleValue, index) => {
      if (
        result >= possibleValue &&
        this.range[index + 1] &&
        result < this.range[index + 1]
      ) {
        indexOnScale = index;
      } else if (result >= possibleValue && index === this.range.length - 1) {
        indexOnScale = index;
      }
    });

    return indexOnScale;
  }
}
