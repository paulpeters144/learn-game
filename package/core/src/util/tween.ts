export type EasingFunction = (t: number) => number;

export const Easing = {
  Linear: (t: number) => t,
  QuadraticOut: (t: number) => t * (2 - t),
  QuadraticInOut: (t: number) => {
    let t2 = t * 2;
    if (t2 < 1) return 0.5 * t2 * t2;
    return -0.5 * (--t2 * (t2 - 2) - 1);
  },
};

type TweenCallback = (value: number) => void;

interface TweenData {
  startTime: number;
  duration: number;
  startValue: number;
  endValue: number;
  easing: EasingFunction;
  onUpdate: TweenCallback;
  onComplete?: () => void;
}

class TweenManager {
  private tweens: TweenData[] = [];

  public to(
    startValue: number,
    endValue: number,
    duration: number,
    easing: EasingFunction,
    onUpdate: TweenCallback,
    onComplete?: () => void,
    delay = 0,
  ) {
    this.tweens.push({
      startTime: performance.now() + delay,
      duration,
      startValue,
      endValue,
      easing,
      onUpdate,
      onComplete,
    });
  }

  public update(now: number) {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const t = this.tweens[i];
      if (now < t.startTime) continue;

      const elapsed = now - t.startTime;

      if (elapsed >= t.duration) {
        t.onUpdate(t.endValue);
        if (t.onComplete) t.onComplete();
        this.tweens.splice(i, 1);
      } else {
        const progress = t.easing(elapsed / t.duration);
        const currentValue = t.startValue + (t.endValue - t.startValue) * progress;
        t.onUpdate(currentValue);
      }
    }
  }

  public clear() {
    this.tweens = [];
  }
}

export const tweenManager = new TweenManager();
