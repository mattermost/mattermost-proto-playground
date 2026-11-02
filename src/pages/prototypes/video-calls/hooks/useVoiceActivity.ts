import { useEffect, useRef } from 'react';

/** RMS (0..1) of the microphone signal above which someone is speaking. */
const SPEAKING_RMS = 0.02;
/** Keeps the highlight on through the pauses between words. */
const HOLD_MS = 400;
/** How often the signal is sampled. */
const SAMPLE_MS = 50;

type AudioContextCtor = typeof AudioContext;

/**
 * Voice activity from a real microphone stream: reports `true` while the
 * signal is above a speaking threshold (with a short hold so it does not
 * flicker between words) and `false` otherwise. It calls `onChange` only when
 * the value changes, so a host that stores it re-renders on transitions, not
 * on every sample. Nothing runs without a stream; the audio context is closed
 * on cleanup.
 */
export function useVoiceActivity({
  stream,
  enabled,
  onChange,
}: {
  stream: MediaStream | null;
  enabled: boolean;
  onChange: (speaking: boolean) => void;
}) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!enabled || !stream) return;
    const Ctor: AudioContextCtor | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioContextCtor })
        .webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();
    void ctx.resume().catch(() => undefined);
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const samples = new Float32Array(analyser.fftSize);

    let lastVoice = 0;
    let speaking = false;
    const timer = window.setInterval(() => {
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (let i = 0; i < samples.length; i += 1)
        sum += samples[i] * samples[i];
      const rms = Math.sqrt(sum / samples.length);
      const now = performance.now();
      if (rms > SPEAKING_RMS) lastVoice = now;
      const next = now - lastVoice < HOLD_MS;
      if (next !== speaking) {
        speaking = next;
        onChangeRef.current(next);
      }
    }, SAMPLE_MS);

    return () => {
      window.clearInterval(timer);
      source.disconnect();
      void ctx.close().catch(() => undefined);
      if (speaking) onChangeRef.current(false);
    };
  }, [enabled, stream]);
}
