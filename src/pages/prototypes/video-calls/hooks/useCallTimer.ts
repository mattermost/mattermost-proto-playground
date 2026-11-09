import { useEffect, useState } from 'react';

export interface UseCallTimerResult {
  seconds: number;
  /** `m:ss` under an hour, `h:mm:ss` after. */
  label: string;
}

/** `m:ss` under an hour, `h:mm:ss` after. Shared by the timer and the chat's call post. */
export function formatCallDuration(totalSeconds: number): string {
  const total = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Elapsed call time derived from a start timestamp, so it survives remounts. */
export function useCallTimer(startedAt: number | null): UseCallTimerResult {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const seconds =
    startedAt === null ? 0 : Math.max(0, Math.floor((now - startedAt) / 1000));
  return { seconds, label: formatCallDuration(seconds) };
}
