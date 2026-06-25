import { useEffect, useState } from 'react';

// --duration-quick is 150ms; keep in sync if that token changes.
export const POPOVER_TRANSITION_MS = 150;

/**
 * Keeps a popover mounted for the duration of its exit animation so the close
 * transition can play before React unmounts the node. See CLAUDE.md:
 * "Animation: popover panel open/close".
 */
export function usePopoverTransition(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), POPOVER_TRANSITION_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  return { mounted, visible };
}
