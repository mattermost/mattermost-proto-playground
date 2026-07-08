import { useLayoutEffect, useState, type RefObject } from 'react';

export interface FixedMenuPosition {
  top: number;
  left?: number;
  right?: number;
  minWidth: number;
}

export interface FixedMenuPositionOptions {
  gap?: number;
  align?: 'start' | 'end';
  /** Ensures the menu is at least this wide even when the anchor is narrower. */
  minWidthFloor?: number;
  /** Bumps layout when the anchor target changes while `open` stays true. */
  repositionKey?: string | number | null;
  /** When true, opens above the anchor (uses translateY(-100%) on the menu). */
  preferAbove?: boolean;
}

/**
 * Positions a menu with `position: fixed` relative to an anchor, updating on
 * scroll/resize so it is not clipped by overflow-hidden ancestors.
 */
export function useFixedMenuPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  options: FixedMenuPositionOptions = {},
): FixedMenuPosition | null {
  const { gap = 4, align = 'start', minWidthFloor = 0, repositionKey, preferAbove = false } =
    options;
  const [position, setPosition] = useState<FixedMenuPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    let frame = 0;
    let attempts = 0;

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return false;
      const rect = anchor.getBoundingClientRect();
      const width = Math.max(rect.width, minWidthFloor);
      setPosition(
        align === 'end'
          ? {
              top: preferAbove ? rect.top - gap : rect.bottom + gap,
              right: window.innerWidth - rect.right,
              minWidth: width,
            }
          : {
              top: preferAbove ? rect.top - gap : rect.bottom + gap,
              left: rect.left,
              minWidth: width,
            },
      );
      return true;
    };

    const tryUpdate = () => {
      if (update()) return;
      if (attempts < 8) {
        attempts += 1;
        frame = requestAnimationFrame(tryUpdate);
      }
    };

    tryUpdate();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef, gap, align, minWidthFloor, repositionKey, preferAbove]);

  return position;
}
