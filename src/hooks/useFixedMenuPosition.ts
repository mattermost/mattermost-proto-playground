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
  const { gap = 4, align = 'start', minWidthFloor = 0 } = options;
  const [position, setPosition] = useState<FixedMenuPosition | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPosition(null);
      return;
    }

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const width = Math.max(rect.width, minWidthFloor);
      setPosition(
        align === 'end'
          ? {
              top: rect.bottom + gap,
              right: window.innerWidth - rect.right,
              minWidth: width,
            }
          : {
              top: rect.bottom + gap,
              left: rect.left,
              minWidth: width,
            },
      );
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef, gap, align, minWidthFloor]);

  return position;
}
