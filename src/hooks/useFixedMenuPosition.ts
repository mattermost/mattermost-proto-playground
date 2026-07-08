import { useLayoutEffect, useState, type RefObject } from 'react';

const VIEWPORT_MARGIN = 8;

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
  /** Measured after mount to flip above the anchor when the viewport clips below. */
  menuRef?: RefObject<HTMLElement | null>;
}

function resolveTop(
  anchorRect: DOMRect,
  menuHeight: number,
  gap: number,
): number {
  const belowTop = anchorRect.bottom + gap;
  const aboveTop = anchorRect.top - gap - menuHeight;
  const spaceBelow =
    window.innerHeight - VIEWPORT_MARGIN - belowTop;
  const spaceAbove = anchorRect.top - gap - VIEWPORT_MARGIN;

  if (menuHeight <= 0 || menuHeight <= spaceBelow) {
    return belowTop;
  }

  if (menuHeight <= spaceAbove) {
    return aboveTop;
  }

  return spaceAbove > spaceBelow
    ? Math.max(VIEWPORT_MARGIN, aboveTop)
    : belowTop;
}

/**
 * Positions a menu with `position: fixed` relative to an anchor, updating on
 * scroll/resize so it is not clipped by overflow-hidden ancestors or the
 * viewport edge.
 */
export function useFixedMenuPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  options: FixedMenuPositionOptions = {},
): FixedMenuPosition | null {
  const { gap = 4, align = 'start', minWidthFloor = 0, menuRef } = options;
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
      const menuHeight = menuRef?.current?.offsetHeight ?? 0;
      const top = resolveTop(rect, menuHeight, gap);

      setPosition(
        align === 'end'
          ? {
              top,
              right: window.innerWidth - rect.right,
              minWidth: width,
            }
          : {
              top,
              left: rect.left,
              minWidth: width,
            },
      );
    };

    update();

    let resizeObserver: ResizeObserver | undefined;
    const observeMenu = () => {
      const menu = menuRef?.current;
      if (!menu || typeof ResizeObserver === 'undefined') {
        return;
      }
      resizeObserver?.disconnect();
      resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(menu);
    };

    const remeasureFrame = requestAnimationFrame(() => {
      update();
      observeMenu();
    });

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(remeasureFrame);
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef, menuRef, gap, align, minWidthFloor]);

  return position;
}
