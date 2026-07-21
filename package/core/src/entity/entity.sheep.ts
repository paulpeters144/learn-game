import { Entity } from '@package/ecs';
import type * as PIXI from 'pixi.js';

export class SheepEntity extends Entity {
  constructor(sprite: PIXI.Sprite, x: number, y: number) {
    super(sprite);

    this.ctr.scale.set(0.35, 0.35);
    this.ctr.position.set(x, y);
    sprite.anchor.set(0.5, 1.0);
  }
}
