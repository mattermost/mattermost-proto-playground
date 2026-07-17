// Lightweight phone-sound synthesis using Web Audio API.
// DTMF, ringback, and hangup tones — no bundled assets.

type DtmfKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '*' | '#';

const DTMF_FREQS: Record<DtmfKey, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function isDtmfKey(k: string): k is DtmfKey {
  return k in DTMF_FREQS;
}

export function playDtmf(key: string, durationMs = 120) {
  if (!isDtmfKey(key)) return;
  const c = getCtx();
  const [f1, f2] = DTMF_FREQS[key];
  const now = c.currentTime;
  const dur = durationMs / 1000;

  const gain = c.createGain();
  gain.connect(masterGain!);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(1, now + 0.005);
  gain.gain.setValueAtTime(1, now + dur - 0.02);
  gain.gain.linearRampToValueAtTime(0, now + dur);

  [f1, f2].forEach((freq) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  });
}

let ringbackNodes: { oscA: OscillatorNode; oscB: OscillatorNode; gain: GainNode } | null = null;
let ringbackTimer: number | null = null;

export function startRingback() {
  if (ringbackNodes) return;
  const c = getCtx();
  const gain = c.createGain();
  gain.gain.value = 0;
  gain.connect(masterGain!);

  const oscA = c.createOscillator();
  const oscB = c.createOscillator();
  oscA.type = 'sine';
  oscB.type = 'sine';
  oscA.frequency.value = 440;
  oscB.frequency.value = 480;
  oscA.connect(gain);
  oscB.connect(gain);
  oscA.start();
  oscB.start();
  ringbackNodes = { oscA, oscB, gain };

  // US ringback cadence: 2s on, 4s off.
  const cycle = () => {
    if (!ringbackNodes) return;
    const t = c.currentTime;
    ringbackNodes.gain.gain.cancelScheduledValues(t);
    ringbackNodes.gain.gain.setValueAtTime(0, t);
    ringbackNodes.gain.gain.linearRampToValueAtTime(1, t + 0.02);
    ringbackNodes.gain.gain.setValueAtTime(1, t + 2);
    ringbackNodes.gain.gain.linearRampToValueAtTime(0, t + 2.02);
  };
  cycle();
  ringbackTimer = window.setInterval(cycle, 6000);
}

export function stopRingback() {
  if (ringbackTimer != null) {
    clearInterval(ringbackTimer);
    ringbackTimer = null;
  }
  if (ringbackNodes) {
    const c = getCtx();
    const { oscA, oscB, gain } = ringbackNodes;
    const t = c.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.03);
    oscA.stop(t + 0.05);
    oscB.stop(t + 0.05);
    ringbackNodes = null;
  }
}

export function playHangupClick() {
  const c = getCtx();
  const now = c.currentTime;
  const gain = c.createGain();
  gain.connect(masterGain!);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.7, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.13);
}
