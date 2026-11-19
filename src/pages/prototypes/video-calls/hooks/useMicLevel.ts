import { useEffect, useRef, useState } from 'react';
import { useMediaStreamRequest } from './useLocalCamera';
import type { MediaStreamState } from './useLocalCamera';

export type UseMicStreamResult = Omit<MediaStreamState, 'retry'>;

const REDUCED_MOTION_LEVEL = 0.15;
const MIN_DELTA = 0.02;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Opt-in microphone stream for the pre-join meter. Audio only; nothing is
 * requested until `enabled`, and tracks are stopped on cleanup.
 */
export function useMicStream({
  enabled,
  deviceId,
}: {
  enabled: boolean;
  deviceId?: string;
}): UseMicStreamResult {
  const { stream, status, error } = useMediaStreamRequest({
    kind: 'audio',
    enabled,
    deviceId,
    disconnectedMessage: 'Microphone disconnected',
  });
  return { stream, status, error };
}

/**
 * Mic level 0..1 for meters. Reads a real stream via AnalyserNode when given
 * one, otherwise a smooth speech-like simulation, so the UI never needs to know.
 */
export function useMicLevel({
  stream,
  enabled,
  simulated,
}: {
  stream?: MediaStream | null;
  enabled: boolean;
  simulated?: boolean;
}): number {
  const [level, setLevel] = useState(0);
  const lastRef = useRef(0);

  useEffect(() => {
    const publish = (next: number) => {
      const v = Math.min(1, Math.max(0, next));
      if (
        Math.abs(v - lastRef.current) > MIN_DELTA ||
        (v === 0 && lastRef.current !== 0)
      ) {
        lastRef.current = v;
        setLevel(v);
      }
    };

    if (!enabled) {
      publish(0);
      return;
    }
    if (prefersReducedMotion()) {
      publish(REDUCED_MOTION_LEVEL);
      return;
    }

    let raf = 0;
    let cancelled = false;
    let ctx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;

    const hasAudio =
      !simulated && !!stream && stream.getAudioTracks().length > 0;
    const AudioCtor =
      typeof window !== 'undefined'
        ? (window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext)
        : undefined;

    if (hasAudio && stream && AudioCtor) {
      ctx = new AudioCtor();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const a = analyser;
      ctx.resume().catch(() => {});
      const tick = () => {
        if (cancelled) return;
        a.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const x = (data[i] - 128) / 128;
          sum += x * x;
        }
        publish(Math.sqrt(sum / data.length) * 3);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } else {
      // Sum of incommensurate sines gated by a slow "syllable" envelope.
      const phase = Math.random() * 1000;
      const start = performance.now();
      const tick = () => {
        if (cancelled) return;
        const t = (performance.now() - start) / 1000 + phase;
        const envelope = Math.max(
          0,
          Math.sin(t * 1.3) * 0.6 + Math.sin(t * 0.37 + 1) * 0.5,
        );
        const detail =
          0.5 + 0.25 * Math.sin(t * 7.1) + 0.25 * Math.sin(t * 11.7 + 2);
        publish(envelope * detail * 0.9);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      source?.disconnect();
      analyser?.disconnect();
      if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {});
    };
  }, [stream, enabled, simulated]);

  return level;
}
