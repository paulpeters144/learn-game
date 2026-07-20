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
    const mappings: { texIdx: number; scaleMul: number }[] = [
      { texIdx: 0, scaleMul: 1.0 },
      { texIdx: 1, scaleMul: 1.0 },
      { texIdx: 2, scaleMul: 1.0 },
      { texIdx: 3, scaleMul: 0.85 },
      { texIdx: 3, scaleMul: 1.0 },
      { texIdx: 4, scaleMul: 1.0 },
      { texIdx: 5, scaleMul: 1.0 },
      { texIdx: 6, scaleMul: 1.0 },
      { texIdx: 7, scaleMul: 0.85 },
      { texIdx: 7, scaleMul: 1.0 },
      { texIdx: 8, scaleMul: 1.0 },
      { texIdx: 9, scaleMul: 1.0 },
    ];

    if (stage < 1 || stage > mappings.length) return;

    const mapping = mappings[stage - 1];
    this.currentStage = stage;
    this.sprite.texture = this.textures[mapping.texIdx];
    this.sprite.visible = true;

    const targetScale = this.baseScale * mapping.scaleMul;

    this.ctr.scale.set(0, 0);
    tweenManager.to(0, targetScale, 500, Easing.QuadraticOut, (val) => {
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
