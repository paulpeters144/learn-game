import { Entity } from '@package/ecs';
import type * as PIXI from 'pixi.js';
import { Easing, tweenManager } from '../util/tween';

export class ShepherdEntity extends Entity {
  private startX: number;
  private carriedSheep: PIXI.Sprite | null = null;

  constructor(sprite: PIXI.Sprite, startX: number, startY: number) {
    super(sprite);

    this.startX = startX;

    this.ctr.scale.set(0.35, 0.35);
    this.ctr.position.set(startX, startY);
    sprite.anchor.set(0.5, 1.0);
  }

  public setCarriedSheep(sheepSprite: PIXI.Sprite): void {
    this.carriedSheep = sheepSprite;
    sheepSprite.anchor.set(0.5, 1.0);
    sheepSprite.scale.set(1.0, 1.0);
    sheepSprite.position.set(0, -30);
    this.ctr.addChild(sheepSprite);
  }

  public removeCarriedSheep(): void {
    if (this.carriedSheep) {
      this.ctr.removeChild(this.carriedSheep);
      this.carriedSheep = null;
    }
  }

  public walkOffScreen(onComplete?: () => void): void {
    const targetX = 750;
    tweenManager.to(
      this.ctr.position.x,
      targetX,
      800,
      Easing.QuadraticOut,
      (val) => {
        this.ctr.position.x = val;
      },
      onComplete,
    );
  }

  public walkBack(onComplete?: () => void): void {
    tweenManager.to(
      this.ctr.position.x,
      this.startX,
      800,
      Easing.QuadraticOut,
      (val) => {
        this.ctr.position.x = val;
      },
      onComplete,
    );
  }

  public shake(): void {
    const shakeAmount = 0.12;
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
