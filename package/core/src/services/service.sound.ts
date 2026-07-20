import type { IEventBus, SfxId } from '../util/event-bus';

export interface ISoundManager {
  play: (id: SfxId) => void;
  dispose: () => void;
}

const note = (
  ctx: AudioContext,
  freq: number,
  start: number,
  len: number,
  type: OscillatorType,
  vol: number,
  dest: AudioNode,
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + len * 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, start + len);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + len);
};

const noiseBurst = (ctx: AudioContext, start: number, len: number, vol: number, dest: AudioNode) => {
  const bufSize = ctx.sampleRate * len;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 800;
  bandpass.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + len * 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + len);

  src.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(dest);
  src.start(start);
  src.stop(start + len);
};

export const createSoundManager = (eventBus: IEventBus): ISoundManager => {
  let ctx: AudioContext | null = null;

  const getCtx = (): AudioContext | null => {
    if (ctx) return ctx;
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
    return ctx;
  };

  const playClick = (c: AudioContext) => {
    const now = c.currentTime;
    note(c, 800, now, 0.06, 'sine', 0.25, c.destination);
  };

  const playCorrect = (c: AudioContext) => {
    const now = c.currentTime;
    note(c, 523, now, 0.12, 'sine', 0.25, c.destination);
    note(c, 659, now + 0.1, 0.18, 'sine', 0.25, c.destination);
  };

  const playWrong = (c: AudioContext) => {
    const now = c.currentTime;
    note(c, 300, now, 0.15, 'square', 0.15, c.destination);
    note(c, 150, now + 0.12, 0.2, 'square', 0.12, c.destination);
  };

  const playWalk = (c: AudioContext) => {
    const now = c.currentTime;
    noiseBurst(c, now, 0.06, 0.15, c.destination);
    noiseBurst(c, now + 0.12, 0.06, 0.15, c.destination);
  };

  const playWater = (c: AudioContext) => {
    const now = c.currentTime;
    const duration = 0.5;
    const bufSize = c.sampleRate * duration;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const src = c.createBufferSource();
    src.buffer = buf;

    const bandpass = c.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1200;
    bandpass.Q.value = 0.3;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    src.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(c.destination);
    src.start(now);
    src.stop(now + duration);
  };

  const playGrow = (c: AudioContext) => {
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  };

  const playWilt = (c: AudioContext) => {
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  };

  const playBray = (c: AudioContext) => {
    const now = c.currentTime;

    const lfo = c.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 14;
    const lfoDepth = c.createGain();
    lfoDepth.gain.value = 0;
    lfo.connect(lfoDepth);

    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    lfoDepth.connect(osc.frequency);

    osc.frequency.setValueAtTime(280, now);
    osc.frequency.linearRampToValueAtTime(550, now + 0.15);
    osc.frequency.linearRampToValueAtTime(280, now + 0.22);
    osc.frequency.linearRampToValueAtTime(350, now + 0.28);
    osc.frequency.linearRampToValueAtTime(140, now + 0.75);

    lfoDepth.gain.setValueAtTime(3, now);
    lfoDepth.gain.linearRampToValueAtTime(25, now + 0.25);
    lfoDepth.gain.linearRampToValueAtTime(65, now + 0.45);
    lfoDepth.gain.linearRampToValueAtTime(90, now + 0.65);
    lfoDepth.gain.linearRampToValueAtTime(30, now + 0.85);

    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.8;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
    gain.gain.setValueAtTime(0.22, now + 0.15);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.22);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.28);
    gain.gain.setValueAtTime(0.18, now + 0.45);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);

    osc.start(now);
    osc.stop(now + 1.0);
    lfo.start(now);
    lfo.stop(now + 1.0);
  };

  const playVictory = (c: AudioContext) => {
    const now = c.currentTime;

    const masterGain = c.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.35, now + 0.12);
    masterGain.gain.setValueAtTime(0.35, now + 2.4);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);

    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -24;
    comp.knee.value = 30;
    comp.ratio.value = 12;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;
    masterGain.connect(comp);
    comp.connect(c.destination);

    const delay = c.createDelay(0.5);
    delay.delayTime.value = 0.12;
    const delayGain = c.createGain();
    delayGain.gain.value = 0.25;
    const delayFeed = c.createGain();
    delayFeed.gain.value = 0.18;
    delay.connect(delayGain);
    delayGain.connect(masterGain);
    delayGain.connect(delayFeed);
    delayFeed.connect(delay);

    const fn = (freq: number, start: number, len: number, vol = 0.25) => {
      const o1 = c.createOscillator();
      o1.type = 'triangle';
      o1.frequency.value = freq;
      const g1 = c.createGain();
      g1.gain.setValueAtTime(0, start);
      g1.gain.linearRampToValueAtTime(vol * 0.7, start + 0.03);
      g1.gain.exponentialRampToValueAtTime(0.001, start + len);
      o1.connect(g1);
      g1.connect(masterGain);
      g1.connect(delay);
      o1.start(start);
      o1.stop(start + len);

      const o2 = c.createOscillator();
      o2.type = 'triangle';
      o2.frequency.value = freq * 1.007;
      const g2 = c.createGain();
      g2.gain.setValueAtTime(0, start);
      g2.gain.linearRampToValueAtTime(vol * 0.3, start + 0.03);
      g2.gain.exponentialRampToValueAtTime(0.001, start + len);
      o2.connect(g2);
      g2.connect(masterGain);
      g2.connect(delay);
      o2.start(start);
      o2.stop(start + len);
    };

    fn(130.81, now, 2.2, 0.35);
    fn(261.63, now + 0.06, 2.0, 0.18);
    fn(329.63, now + 0.09, 2.0, 0.16);
    fn(392.0, now + 0.12, 2.0, 0.14);

    fn(174.61, now + 0.5, 0.35, 0.28);
    fn(349.23, now + 0.56, 0.45, 0.15);
    fn(440.0, now + 0.59, 0.45, 0.14);
    fn(523.25, now + 0.62, 0.45, 0.13);

    fn(196.0, now + 0.85, 0.35, 0.28);
    fn(392.0, now + 0.91, 0.4, 0.15);
    fn(493.88, now + 0.94, 0.4, 0.14);
    fn(587.33, now + 0.97, 0.4, 0.13);

    fn(130.81, now + 1.15, 1.3, 0.38);
    fn(261.63, now + 1.22, 1.4, 0.2);
    fn(329.63, now + 1.24, 1.4, 0.18);
    fn(392.0, now + 1.26, 1.4, 0.16);
    fn(523.25, now + 1.28, 1.4, 0.14);

    fn(523.25, now + 1.3, 0.22, 0.24);
    fn(659.25, now + 1.46, 0.22, 0.24);
    fn(783.99, now + 1.62, 0.22, 0.24);
    fn(1046.5, now + 1.78, 0.5, 0.3);

    fn(987.77, now + 1.88, 0.14, 0.14);
    fn(783.99, now + 1.96, 0.14, 0.14);
    fn(659.25, now + 2.04, 0.14, 0.14);

    const cymLen = 1.8;
    const cymBuf = c.createBuffer(1, Math.floor(c.sampleRate * cymLen), c.sampleRate);
    const cymData = cymBuf.getChannelData(0);
    for (let i = 0; i < cymData.length; i++) cymData[i] = Math.random() * 2 - 1;
    const cymSrc = c.createBufferSource();
    cymSrc.buffer = cymBuf;
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 4000;
    const cymGain = c.createGain();
    cymGain.gain.setValueAtTime(0, now);
    cymGain.gain.linearRampToValueAtTime(0.07, now + 1.6);
    cymGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6 + cymLen);
    cymSrc.connect(hp);
    hp.connect(cymGain);
    cymGain.connect(masterGain);
    cymSrc.start(now + 1.6);
    cymSrc.stop(now + 1.6 + cymLen);
  };

  const play = (id: SfxId) => {
    const c = getCtx();
    if (!c) return;

    if (c.state === 'suspended') {
      c.resume();
    }

    switch (id) {
      case 'click':
        playClick(c);
        break;
      case 'correct':
        playCorrect(c);
        break;
      case 'wrong':
        playWrong(c);
        break;
      case 'walk':
        playWalk(c);
        break;
      case 'water':
        playWater(c);
        break;
      case 'grow':
        playGrow(c);
        break;
      case 'wilt':
        playWilt(c);
        break;
      case 'victory':
        playVictory(c);
        break;
      case 'bray':
        playBray(c);
        break;
    }
  };

  eventBus.on('sfx:play', (payload) => {
    play(payload.id);
  });

  return {
    play,
    dispose: () => {
      if (ctx) {
        ctx.close();
        ctx = null;
      }
    },
  };
};
