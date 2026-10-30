import {
  useCallback,
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

/** Elements that keep their own press behaviour (buttons, menus, popovers). */
const NO_DRAG =
  'button, a, input, textarea, select, [role="menu"], [role="menuitem"], [role="menuitemradio"], [class*="widget-frame__popovers"]';

/** The channel chrome the widget floats over; dragging is clamped to it. */
const BOUNDS = '[class*="channel-shell"]:not([class*="channel-shell__"])';

/**
 * Drag the call widget anywhere inside the channel UI. Moves it with the CSS
 * `translate` property (so the widget's own enter / exit `transform`
 * animations keep working) and clamps it to the shell so it can't be lost off
 * screen. Presses on buttons, menus and popovers are left alone.
 */
export function useWidgetDrag(ref: RefObject<HTMLElement | null>) {
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{
    id: number;
    startX: number;
    startY: number;
    origin: Offset;
    min: Offset;
    max: Offset;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const el = ref.current;
      const target = e.target as HTMLElement;
      if (!el || e.button !== 0 || target.closest(NO_DRAG)) return;

      const bounds = (
        el.closest(BOUNDS) ?? document.body
      ).getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      // Where the widget would sit with no offset applied.
      const base = { left: rect.left - offset.x, top: rect.top - offset.y };
      drag.current = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        origin: offset,
        min: { x: bounds.left - base.left, y: bounds.top - base.top },
        max: {
          x: bounds.right - base.left - rect.width,
          y: bounds.bottom - base.top - rect.height,
        },
      };
      el.setPointerCapture(e.pointerId);
      setDragging(true);
      e.preventDefault();
    },
    [ref, offset],
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
      if (ref.current?.hasPointerCapture(d.id)) {
        ref.current.releasePointerCapture(d.id);
      }
      setDragging(false);
    },
    [ref],
  );

  const style: CSSProperties = {
    translate: `${offset.x}px ${offset.y}px`,
  };

  return {
    dragging,
    style,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}
