import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

interface Offset {
  x: number;
  y: number;
}

interface Corner {
  right: boolean;
  bottom: boolean;
}

/** Elements that keep their own press behaviour (buttons, menus, popovers). */
const NO_DRAG =
  'button, a, input, textarea, select, [role="menu"], [role="menuitem"], [role="menuitemradio"], [class*="widget-frame__popovers"]';

/** The channel chrome the widget floats over; dragging is clamped to it. */
const BOUNDS = '[class*="channel-shell"]:not([class*="channel-shell__"])';

const SNAP_MS = 300;

/**
 * Drag the call widget anywhere inside the channel UI; on release it snaps to
 * the nearest corner, the same distance from both edges in every corner (the
 * distance of its default bottom-left spot). Moves it with the CSS `translate`
 * property so the widget's own enter / exit `transform` animations keep
 * working. The chosen corner is remembered, so when the card changes height
 * between phases it stays pinned to that corner. Presses on buttons, menus and
 * popovers are left alone.
 */
export function useWidgetDrag(ref: RefObject<HTMLElement | null>) {
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const corner = useRef<Corner | null>(null);
  const offsetRef = useRef(offset);
  offsetRef.current = offset;
  const snapTimer = useRef<number>(0);
  const drag = useRef<{
    id: number;
    startX: number;
    startY: number;
    origin: Offset;
    min: Offset;
    max: Offset;
  } | null>(null);

  /** Where the widget sits with no offset, the shell box, and the corner inset. */
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return null;
    const bounds = (
      el.closest(BOUNDS) ?? document.body
    ).getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const { x, y } = offsetRef.current;
    const base = { left: rect.left - x, top: rect.top - y };
    // The default (bottom-left) resting spot defines the inset for all corners.
    const inset = Math.max(0, base.left - bounds.left);
    return { bounds, rect, base, inset };
  }, [ref]);

  const offsetFor = useCallback(
    (c: Corner): Offset | null => {
      const m = measure();
      if (!m) return null;
      const left = c.right
        ? m.bounds.right - m.rect.width - m.inset
        : m.bounds.left + m.inset;
      const top = c.bottom
        ? m.bounds.bottom - m.rect.height - m.inset
        : m.bounds.top + m.inset;
      return { x: left - m.base.left, y: top - m.base.top };
    },
    [measure],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const el = ref.current;
      const target = e.target as HTMLElement;
      if (!el || e.button !== 0 || target.closest(NO_DRAG)) return;
      const m = measure();
      if (!m) return;
      window.clearTimeout(snapTimer.current);
      setSnapping(false);
      drag.current = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        origin: offsetRef.current,
        min: {
          x: m.bounds.left + m.inset - m.base.left,
          y: m.bounds.top + m.inset - m.base.top,
        },
        max: {
          x: m.bounds.right - m.inset - m.rect.width - m.base.left,
          y: m.bounds.bottom - m.inset - m.rect.height - m.base.top,
        },
      };
      el.setPointerCapture(e.pointerId);
      setDragging(true);
      e.preventDefault();
    },
    [ref, measure],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const clamp = (v: number, lo: number, hi: number) =>
      Math.min(hi, Math.max(lo, v));
    setOffset({
      x: clamp(d.origin.x + e.clientX - d.startX, d.min.x, d.max.x),
      y: clamp(d.origin.y + e.clientY - d.startY, d.min.y, d.max.y),
    });
  }, []);

  const end = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;
      const el = ref.current;
      if (el?.hasPointerCapture(d.id)) el.releasePointerCapture(d.id);
      setDragging(false);

      // Snap to the corner nearest the widget's centre.
      const m = measure();
      if (!m) return;
      const cx = m.rect.left + m.rect.width / 2;
      const cy = m.rect.top + m.rect.height / 2;
      const next: Corner = {
        right: cx > m.bounds.left + m.bounds.width / 2,
        bottom: cy > m.bounds.top + m.bounds.height / 2,
      };
      const target = offsetFor(next);
      if (!target) return;
      corner.current = next;
      setSnapping(true);
      setOffset(target);
      window.clearTimeout(snapTimer.current);
      snapTimer.current = window.setTimeout(() => setSnapping(false), SNAP_MS);
    },
    [ref, measure, offsetFor],
  );

  // Keep the chosen corner pinned when the card or the shell changes size
  // (phase changes, window resize).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const repin = () => {
      if (!corner.current || drag.current) return;
      const target = offsetFor(corner.current);
      if (!target) return;
      const cur = offsetRef.current;
      if (
        Math.abs(target.x - cur.x) > 0.5 ||
        Math.abs(target.y - cur.y) > 0.5
      ) {
        setOffset(target);
      }
    };
    const ro = new ResizeObserver(repin);
    ro.observe(el);
    const bounds = el.closest(BOUNDS);
    if (bounds) ro.observe(bounds);
    window.addEventListener('resize', repin);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', repin);
      window.clearTimeout(snapTimer.current);
    };
  }, [ref, offsetFor]);

  const style: CSSProperties = {
    translate: `${offset.x}px ${offset.y}px`,
  };

  return {
    dragging,
    snapping,
    style,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}
