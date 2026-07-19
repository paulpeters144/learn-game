import { Entity } from '@package/ecs';
import type * as PIXI from 'pixi.js';
import { Easing, tweenManager } from '../util/tween';

export interface PathPoint {
  x: number;
  y: number;
}

export class DonkeyEntity extends Entity {
  private path: PathPoint[];

  constructor(sprite: PIXI.Sprite, path: PathPoint[]) {
    super(sprite);

    // Scale down the donkey sprite appropriately to fit on the path
    this.ctr.scale.set(0.4, 0.4);

    this.path = path;

    // Set anchor so shake rotates around the bottom center
    sprite.anchor.set(0.5, 1.0);

    // Start at the first point in the path
    if (this.path.length > 0) {
      this.ctr.position.set(this.path[0].x, this.path[0].y);
    }
  }

  public setProgress(percentage: number): void {
    if (this.path.length === 0) return;

    // Assuming percentage goes from 0 to 1 over the course of the questions
    const targetIndex = Math.round(percentage * (this.path.length - 1));
    const targetPoint = this.path[Math.min(targetIndex, this.path.length - 1)];

    console.log('setProgress called', percentage, 'targetPoint:', targetPoint);

    const startX = this.ctr.position.x;
    const startY = this.ctr.position.y;
    const deltaX = targetPoint.x - startX;
    const deltaY = targetPoint.y - startY;

    // Animate both X and Y using a 0-1 interpolation
    tweenManager.to(0, 1, 1000, Easing.QuadraticOut, (val) => {
      this.ctr.position.x = startX + deltaX * val;
      this.ctr.position.y = startY + deltaY * val;
    });
  }

  public shake(): void {
    console.log('shake called');
    const shakeAmount = 0.15;
    const startRot = this.ctr.rotation;

    tweenManager.to(
      startRot,
      -shakeAmount,
      100,
      Easing.QuadraticInOut,
      (val) => {
        this.ctr.rotation = val;
      },
      () => {
        tweenManager.to(
          -shakeAmount,
          shakeAmount,
          200,
          Easing.QuadraticInOut,
          (val) => {
            this.ctr.rotation = val;
          },
          () => {
            tweenManager.to(shakeAmount, 0, 100, Easing.QuadraticInOut, (val) => {
              this.ctr.rotation = val;
            });
          },
        );
      },
    );
  }
}
