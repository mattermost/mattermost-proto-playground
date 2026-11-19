import { useEffect, useState } from 'react';

/**
 * True while the browser has already granted microphone access, so a mic check
 * needs no prompt and no "Check my microphone" button. Only queries (never
 * prompts). Browsers without a 'microphone' permission name stay false and the
 * button covers them.
 */
export function useMicPermissionGranted(enabled: boolean): boolean {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (!enabled || !navigator.permissions?.query) return;
    let status: PermissionStatus | null = null;
    let cancelled = false;
    const sync = () => setGranted(status?.state === 'granted');
    navigator.permissions
      .query({ name: 'microphone' as PermissionName })
      .then((result) => {
        if (cancelled) return;
        status = result;
        sync();
        result.addEventListener('change', sync);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      status?.removeEventListener('change', sync);
    };
  }, [enabled]);

  return enabled && granted;
}
