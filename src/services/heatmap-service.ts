export interface Radius {
  radius: number;
  blur: number;
}

export class SimpleHeat {
  private _ctx: CanvasRenderingContext2D;
  private _width: number;
  private _height: number;
  private circle: HTMLCanvasElement;
  // @ts-ignore
  private _r: number;
  // @ts-ignore
  private _grad: Uint8ClampedArray;

  public defaultRadius: number = 25;
  public defaultGradient: { [key: number]: string } = {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red',
  };

  constructor(
    private canvas: HTMLCanvasElement,
    private data: any,
    private radius: Radius,
    private max: any = 1,
    draw: any
  ) {
    this.canvas = canvas;

    this.circle = this._createCanvas();
    this._ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this._width = this.canvas.width;
    this._height = this.canvas.height;
  }

  add(point: any): this {
    this.data.push(point);
    return this;
  }

  clear(): this {
    this.data = [];
    return this;
  }

  blaRadius(r: number, blur: number = 15): this {
    blur = blur === undefined ? 15 : blur;

    // create a grayscale blurred circle image that we'll use for drawing points
    const circle = this._createCanvas();
    const ctx = circle.getContext('2d');
    const r2 = (this._r = r + blur);

    circle.width = circle.height = r2 * 2;

    if (ctx) {
      ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
      ctx.shadowBlur = blur;
      ctx.shadowColor = 'black';

      ctx.beginPath();
      ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }

    return this;
  }

  resize(): void {
    this._width = this.canvas.width;
    this._height = this.canvas.height;
  }

  gradient(grad: { [key: number]: string }): this {
    // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
    const canvas = this._createCanvas();
    const ctx = canvas.getContext('2d');

    canvas.width = 1;
    canvas.height = 256;

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);

      for (const index in grad) {
        gradient.addColorStop(+index, grad[index]);
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1, 256);

      this._grad = ctx.getImageData(0, 0, 1, 256).data;
    }
    return this;
  }

  draw(minOpacity?: number): this {
    if (!this.circle) {
      this.blaRadius(this.defaultRadius);
    }

    if (!this._grad) {
      this.gradient(this.defaultGradient);
    }

    var ctx = this._ctx;

    ctx.clearRect(0, 0, this._width, this._height);

    // draw a grayscale heatmap by putting a blurred circle at each data point
    for (var i = 0, len = this.data.length, p; i < len; i++) {
      p = this.data[i];
      ctx.globalAlpha = Math.min(
        Math.max(p[2] / this.max, minOpacity === undefined ? 0.05 : minOpacity),
        1
      );
      ctx.drawImage(this.circle, p[0] - this._r, p[1] - this._r);
    }

    // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
    var colored = ctx.getImageData(0, 0, this._width, this._height);
    this._colorize(colored.data, this._grad);
    ctx.putImageData(colored, 0, 0);

    return this;
  }

  private _colorize(
    pixels: Uint8ClampedArray,
    gradient: Uint8ClampedArray
  ): void {
    for (var i = 0, len = pixels.length, j; i < len; i += 4) {
      j = pixels[i + 3] * 4; // get gradient color from opacity value

      if (j) {
        pixels[i] = gradient[j];
        pixels[i + 1] = gradient[j + 1];
        pixels[i + 2] = gradient[j + 2];
      }
    }
  }

  private _createCanvas(): HTMLCanvasElement {
    if (typeof document !== 'undefined') {
      return document.createElement('canvas');
    } else {
      // create a new canvas instance in node.js
      // the canvas class needs to have a default constructor without any parameter
      return new (this.canvas.constructor as any)();
    }
  }
}

if (typeof module !== 'undefined') module.exports = SimpleHeat;
