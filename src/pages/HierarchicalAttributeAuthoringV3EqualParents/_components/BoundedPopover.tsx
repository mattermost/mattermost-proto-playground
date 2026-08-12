import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import { usePopoverDismiss } from '@/hooks/usePopoverDismiss';
import styles from './BoundedPopover.module.scss';

const EDGE = 8;
const GAP = 6;
/** Below this, a flipped panel is useless — close instead of squashing it. */
const MIN_USABLE_HEIGHT = 120;

interface Placement {
  top: number;
  left: number;
  maxHeight: number;
  above: boolean;
}

export interface BoundedPopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  /**
   * The region the panel must stay inside — normally the page's scroll area, so
   * the panel can never float over the page header. When the anchor scrolls out
   * of this region the panel closes rather than detaching from its trigger.
   */
  boundaryRef?: RefObject<HTMLElement | null>;
  /** Accessible name for the panel. */
  label: string;
  width?: number;
  /** Ceiling for the panel; the real height also respects available space. */
  maxHeight?: number;
  align?: 'start' | 'end';
  children: ReactNode;
}

function boundaryRect(el: HTMLElement | null): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  if (!el) {
    return {
      top: EDGE,
      bottom: window.innerHeight - EDGE,
      left: EDGE,
      right: window.innerWidth - EDGE,
    };
  }
  const r = el.getBoundingClientRect();
  return {
    top: Math.max(r.top, EDGE) + EDGE,
    bottom: Math.min(r.bottom, window.innerHeight) - EDGE,
    left: Math.max(r.left, EDGE),
    right: Math.min(r.right, window.innerWidth - EDGE),
  };
}

/**
 * Popover panel that stays inside a boundary element (F7).
 *
 * Three fixes over the shared `FixedPopoverMenu` for this surface:
 *  1. It is clamped to a boundary — the page's scroll region — so it cannot
 *     float over the page header once the trigger scrolls up behind it.
 *  2. It closes when its trigger leaves that region, instead of hovering next to
 *     nothing.
 *  3. Its height is the real available space (flipping above when that is
 *     roomier) with the content scrolling inside, so a pane can never clip its
 *     own helper text mid-sentence — three parents or thirty.
 */
export default function BoundedPopover({
  open,
  onClose,
  anchorRef,
  boundaryRef,
  label,
  width = 340,
  maxHeight = 460,
  align = 'start',
  children,
}: BoundedPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const surfaces = useRef([anchorRef, panelRef]);

  usePopoverDismiss(open, onClose, surfaces.current);

  const measure = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const bounds = boundaryRect(boundaryRef?.current ?? null);

    // Trigger scrolled out of the region it belongs to — let it go.
    if (rect.bottom < bounds.top || rect.top > bounds.bottom) {
      setPlacement(null);
      onClose();
      return;
    }

    const spaceBelow = bounds.bottom - (rect.bottom + GAP);
    const spaceAbove = rect.top - GAP - bounds.top;
    const above = spaceBelow < MIN_USABLE_HEIGHT && spaceAbove > spaceBelow;
    const available = Math.max(above ? spaceAbove : spaceBelow, 0);
    const height = Math.min(maxHeight, available);

    const rawLeft = align === 'end' ? rect.right - width : rect.left;
    const left = Math.min(
      Math.max(rawLeft, bounds.left),
      Math.max(bounds.right - width, bounds.left),
    );

    setPlacement({
      top: above ? rect.top - GAP - height : rect.bottom + GAP,
      left,
      maxHeight: height,
      above,
    });
  }, [align, anchorRef, boundaryRef, maxHeight, onClose, width]);

  useLayoutEffect(() => {
    if (!open) {
      setPlacement(null);
      return;
    }
    measure();
  }, [open, measure]);

  // `mounted` is a dep so the ResizeObserver attaches on the pass AFTER the
  // panel first renders — content that grows (a third parent row) re-measures.
  const mounted = placement != null;
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    let observer: ResizeObserver | undefined;
    if (mounted && typeof ResizeObserver !== 'undefined' && panelRef.current) {
      observer = new ResizeObserver(measure);
      observer.observe(panelRef.current);
    }
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [open, measure, mounted]);

  if (!open || placement == null) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      className={[
        styles['bounded-popover'],
        placement.above ? styles['bounded-popover--above'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        top: placement.top,
        left: placement.left,
        width,
        maxHeight: placement.maxHeight,
      }}
    >
      <div className={styles['bounded-popover__scroll']}>
        <Scrollbars
          alwaysVisible
          style={{ maxHeight: placement.maxHeight }}
        >
          <div className={styles['bounded-popover__inner']}>{children}</div>
        </Scrollbars>
      </div>
    </div>,
    document.body,
  );
}
