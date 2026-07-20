import { Entity } from '@package/ecs';
import * as PIXI from 'pixi.js';
import { Easing, tweenManager } from '../util/tween';

interface Droplet {
  gfx: PIXI.Graphics;
  startY: number;
  endY: number;
}

export class WaterEntity extends Entity {
  private droplets: Droplet[] = [];

  constructor() {
    const ctr = new PIXI.Container();
    ctr.visible = false;
    super(ctr);
  }

  public pour(props: { x: number; y: number; count?: number }): void {
    const { x, y, count = 14 } = props;
    this.cleanup();
    this.ctr.visible = true;

    for (let i = 0; i < count; i++) {
      const size = 2.5 + Math.random() * 3.5;
      const gfx = new PIXI.Graphics();
      gfx.circle(0, 0, size).fill({ color: 0x3498db, alpha: 0.75 });

      const offsetX = (Math.random() - 0.5) * 70;
      const startY = y - 160 - Math.random() * 40;
      const endY = y + 5;

      gfx.position.set(x + offsetX, startY);
      gfx.alpha = 0.8;
      this.ctr.addChild(gfx);

      this.droplets.push({ gfx, startY, endY });

      const delay = Math.random() * 250;
      const duration = 500 + Math.random() * 300;

      tweenManager.to(
        0,
        1,
        duration,
        Easing.Linear,
        (val) => {
          gfx.position.y = startY + (endY - startY) * val;
          gfx.alpha = 0.8 * (1 - val * 0.6);
        },
        undefined,
        delay,
      );
    }
  }

  private cleanup(): void {
    for (const d of this.droplets) {
      this.ctr.removeChild(d.gfx);
      d.gfx.destroy();
    }
    this.droplets = [];
    this.ctr.visible = false;
  }
}
