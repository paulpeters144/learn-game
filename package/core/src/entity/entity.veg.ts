import { Entity } from '@package/ecs';
import * as PIXI from 'pixi.js';
import { Easing, tweenManager } from '../util/tween';

export class VegEntity extends Entity {
  private readonly sprite: PIXI.Sprite;
  private readonly textures: PIXI.Texture[];
  private currentStage = 0;
  private readonly baseScale: number;

  constructor(textures: PIXI.Texture[], props: { x: number; y: number; scale?: number }) {
    const sprite = new PIXI.Sprite();
    sprite.anchor.set(0.5, 1.0);
    sprite.visible = false;
    super(sprite);

    this.sprite = sprite;
    this.textures = textures;
    this.baseScale = props.scale ?? 1;
    this.ctr.position.set(props.x, props.y);
    this.ctr.scale.set(this.baseScale, this.baseScale);
  }

  public growToStage(stage: number): void {
    if (stage < 1 || stage > this.textures.length) return;

    this.currentStage = stage;
    this.sprite.texture = this.textures[stage - 1];
    this.sprite.visible = true;

    // Scale-in animation: pop from small to full size
    this.ctr.scale.set(0, 0);
    tweenManager.to(0, this.baseScale, 500, Easing.QuadraticOut, (val) => {
      this.ctr.scale.set(val, val);
    });
  }

  public wilt(): void {
    if (!this.sprite.visible) return;

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

  public getStage(): number {
    return this.currentStage;
  }
}
