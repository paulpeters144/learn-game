import * as PIXI from 'pixi.js';
export class Entity {
  public readonly id: string;
  public readonly ctr: PIXI.Container;

  public get rect(): PIXI.Rectangle {
    return new PIXI.Rectangle(this.ctr.x, this.ctr.y, this.ctr.width, this.ctr.height);
  }

  public get moveRect(): PIXI.Rectangle {
    const heightBuffer = this.ctr.height / 1.5;
    const widthBuffer = this.ctr.width / 1.5;
    return new PIXI.Rectangle(
      this.ctr.x + widthBuffer / 2,
      this.ctr.y + heightBuffer,
      this.ctr.width - widthBuffer,
      this.ctr.height - heightBuffer,
    );
  }

  constructor(ctr: PIXI.Container) {
    this.ctr = ctr;
    const max = 1_000_000_000;
    const num = Math.floor(Math.random() * max);
    this.id = Math.floor(num).toString();
  }
}
