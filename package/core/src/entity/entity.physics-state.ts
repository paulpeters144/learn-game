import { Entity } from '@package/ecs';
import * as PIXI from 'pixi.js';

export class PhysicsStateEntity extends Entity {
  public velocityY = 0;
  public isGrounded = false;

  constructor() {
    const ctr = new PIXI.Container();
    ctr.visible = false;
    super(ctr);
  }
}
