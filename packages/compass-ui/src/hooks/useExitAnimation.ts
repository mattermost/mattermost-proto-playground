import { useEffect, useState } from 'react';

/**
 * Keeps a panel mounted through its exit animation. While `open` is true the
 * panel renders normally. When `open` flips false, the panel keeps rendering
 * for `durationMs` with `exiting: true` so an exit animation can play before
 * the DOM node is removed.
 */
export function useExitAnimation(open: boolean, durationMs: number) {
  const [rendered, setRendered] = useState(open);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      setExiting(false);
      return;
    }
    if (!rendered) return;
    setExiting(true);
    const t = window.setTimeout(() => {
      setRendered(false);
      setExiting(false);
    }, durationMs);
    return () => window.clearTimeout(t);
  }, [open, rendered, durationMs]);

  return { rendered, exiting };
}
