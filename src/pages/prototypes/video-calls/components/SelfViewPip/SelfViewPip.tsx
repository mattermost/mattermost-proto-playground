import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import CloseIcon from '@mattermost/compass-icons/components/close';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import styles from './SelfViewPip.module.scss';

export type SelfViewPipCorner =
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type SelfViewPipSize = 'default' | 'compact';

export interface SelfViewPipLabels {
  /** Accessible name of the floating self view (includes the keyboard hint). */
  region?: string;
  hide?: string;
  show?: string;
}

export interface SelfViewPipProps {
  /** The self video tile (or any content). Unmounted while hidden so video stops decoding. */
  children: ReactNode;
  /** Controlled corner. Omit to let the component own it (starts at `defaultCorner`). */
  corner?: SelfViewPipCorner;
  defaultCorner?: SelfViewPipCorner;
  onCornerChange?: (corner: SelfViewPipCorner) => void;
  /** Controlled hidden state (collapsed to a "Show self view" chip). */
  hidden?: boolean;
  defaultHidden?: boolean;
  onHiddenChange?: (hidden: boolean) => void;
  /** `default` = 240 wide (desktop stage), `compact` = 112 wide (mobile). */
  size?: SelfViewPipSize;
  /**
   * Render inline, filling the parent (no float, drag or hide control). The
   * element tree around `children` is identical to the floating one, so a
   * host can switch between docked and floating without remounting the video.
   */
  docked?: boolean;
  labels?: SelfViewPipLabels;
  className?: string;
  /** Root element (e.g. for layout animation by the host). */
  ref?: Ref<HTMLDivElement>;
}

const DEFAULT_LABELS: Required<SelfViewPipLabels> = {
  region: 'Your video. Drag or use arrow keys to move it to another corner.',
  hide: 'Hide self view',
  show: 'Show self view',
};

/** Pointer travel (px) before a press becomes a drag. */
const DRAG_THRESHOLD = 4;
/** Seconds of release velocity projected forward when picking the corner. */
const FLING_PROJECTION = 0.18;
/** Pointer samples (ms) used for the release velocity. */
const VELOCITY_WINDOW = 90;
/** Rubber-band stiffness past the stage inset while dragging. */
const RUBBER_BAND = 0.5;
/** Settle spring: ~280ms to rest, slight overshoot only on a hard fling. */
const SPRING_STIFFNESS = 420;
const SPRING_DAMPING = 2 * 0.86 * Math.sqrt(SPRING_STIFFNESS);

type Vec = { x: number; y: number };

interface Geometry {
  cw: number;
  ch: number;
  w: number;
  h: number;
  inset: number;
}

function cornerFrom(
  vertical: 'top' | 'bottom',
  horizontal: 'left' | 'right',
): SelfViewPipCorner {
  return `${vertical}-${horizontal}`;
}

function measure(el: HTMLElement): Geometry {
  const parent = (el.offsetParent as HTMLElement | null) ?? el.parentElement;
  const inset =
    parseFloat(
      getComputedStyle(el).getPropertyValue('--self-view-pip-inset'),
    ) || 0;
  return {
    cw: parent?.clientWidth ?? 0,
    ch: parent?.clientHeight ?? 0,
    w: el.offsetWidth,
    h: el.offsetHeight,
    inset,
  };
}

/** Top-left of the PiP at rest in `corner`, in container coordinates. */
function restPosition(corner: SelfViewPipCorner, g: Geometry): Vec {
  return {
    x: corner.endsWith('right') ? g.cw - g.w - g.inset : g.inset,
    y: corner.startsWith('bottom') ? g.ch - g.h - g.inset : g.inset,
  };
}

/**
 * Clamp to [min, max] with a rubber band that saturates at `limit` px past
 * either bound, so an over-drag resists but never leaves the stage.
 */
function rubber(value: number, min: number, max: number, limit: number) {
  const band = (d: number) =>
    limit > 0 ? limit * (1 - 1 / (1 + (d * RUBBER_BAND) / limit)) : 0;
  if (value < min) return min - band(min - value);
  if (value > max) return max + band(value - max);
  return value;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Floating, draggable self-view (Meet-style). The resting corner is pure CSS
 * (left/right/top/bottom anchors, so it follows stage resizes for free); drag
 * and settle motion is an offset written to the `translate` property once per
 * animation frame — no React state per pointer move and no layout writes.
 * On release the release velocity is projected forward to pick the nearest
 * corner, and a damped spring settles the PiP into it. Arrow keys move between
 * corners; Escape cancels a drag in progress.
 *
 * `transform` is left free for the host (e.g. FLIP layout animation).
 */
export function SelfViewPip({
  children,
  corner: cornerProp,
  defaultCorner = 'bottom-right',
  onCornerChange,
  hidden: hiddenProp,
  defaultHidden = false,
  onHiddenChange,
  size = 'default',
  docked = false,
  labels,
  className,
  ref,
}: SelfViewPipProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [cornerState, setCornerState] =
    useState<SelfViewPipCorner>(defaultCorner);
  const [hiddenState, setHiddenState] = useState(defaultHidden);
  const corner = cornerProp ?? cornerState;
  const hidden = !docked && (hiddenProp ?? hiddenState);

  const rootRef = useRef<HTMLDivElement | null>(null);
  /** Current translate offset from the resting corner position. */
  const offset = useRef<Vec>({ x: 0, y: 0 });
  const velocity = useRef<Vec>({ x: 0, y: 0 });
  const frame = useRef(0);
  const prevCorner = useRef(corner);
  /** Release velocity to hand to the settle spring after a corner change. */
  const releaseVelocity = useRef<Vec | null>(null);
  const drag = useRef<{
    id: number;
    startX: number;
    startY: number;
    base: Vec;
    min: Vec;
    max: Vec;
    /** Max rubber-band overshoot (the stage inset). */
    limit: number;
    target: Vec;
    moved: boolean;
    samples: { t: number; x: number; y: number }[];
  } | null>(null);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  const write = () => {
    const el = rootRef.current;
    if (!el) return;
    const { x, y } = offset.current;
    el.style.translate =
      Math.abs(x) < 0.01 && Math.abs(y) < 0.01 ? '' : `${x}px ${y}px`;
  };

  const stop = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
  };

  /** Spring the offset to 0 (the resting corner) from `v` px/s. */
  const settle = useCallback((v: Vec = { x: 0, y: 0 }) => {
    stop();
    if (prefersReducedMotion()) {
      offset.current = { x: 0, y: 0 };
      write();
      return;
    }
    velocity.current = { ...v };
    let last = 0;
    const step = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      // Semi-implicit Euler in 4 sub-steps: stable at any frame rate.
      const h = dt / 4;
      for (let i = 0; i < 4; i += 1) {
        for (const axis of ['x', 'y'] as const) {
          const a =
            -SPRING_STIFFNESS * offset.current[axis] -
            SPRING_DAMPING * velocity.current[axis];
          velocity.current[axis] += a * h;
          offset.current[axis] += velocity.current[axis] * h;
        }
      }
      const { x, y } = offset.current;
      const speed = Math.hypot(velocity.current.x, velocity.current.y);
      if (Math.hypot(x, y) < 0.4 && speed < 8) {
        offset.current = { x: 0, y: 0 };
        write();
        frame.current = 0;
        return;
      }
      write();
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, []);

  // Corner changed (drag release, arrow key or a controlled prop): keep the
  // PiP where it is on screen and spring it into the new corner.
  useLayoutEffect(() => {
    const from = prevCorner.current;
    prevCorner.current = corner;
    const el = rootRef.current;
    if (from === corner || !el) return;
    const g = measure(el);
    const a = restPosition(from, g);
    const b = restPosition(corner, g);
    offset.current = {
      x: a.x + offset.current.x - b.x,
      y: a.y + offset.current.y - b.y,
    };
    write();
    settle(releaseVelocity.current ?? undefined);
    releaseVelocity.current = null;
  }, [corner, settle]);

  useEffect(() => stop, []);

  // Hidden / docked swaps the root element: start from rest.
  useLayoutEffect(() => {
    stop();
    offset.current = { x: 0, y: 0 };
    write();
  }, [hidden, docked]);

  const setCorner = (next: SelfViewPipCorner) => {
    setCornerState(next);
    onCornerChange?.(next);
  };

  const setHidden = (next: boolean) => {
    setHiddenState(next);
    onHiddenChange?.(next);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = rootRef.current;
    if (!el || e.button !== 0 || drag.current) return;
    if ((e.target as HTMLElement).closest('button')) return;
    stop();
    const g = measure(el);
    const rest = restPosition(corner, g);
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      base: { ...offset.current },
      min: { x: g.inset - rest.x, y: g.inset - rest.y },
      max: {
        x: g.cw - g.w - g.inset - rest.x,
        y: g.ch - g.h - g.inset - rest.y,
      },
      limit: g.inset,
      target: { ...offset.current },
      moved: false,
      samples: [{ t: e.timeStamp, x: e.clientX, y: e.clientY }],
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = rootRef.current;
    if (!d || d.id !== e.pointerId || !el) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      el.dataset.dragging = ''; // not React-owned: survives re-renders
    }
    d.samples.push({ t: e.timeStamp, x: e.clientX, y: e.clientY });
    while (
      d.samples.length > 2 &&
      e.timeStamp - d.samples[0].t > VELOCITY_WINDOW
    ) {
      d.samples.shift();
    }
    d.target = {
      x: rubber(d.base.x + dx, d.min.x, d.max.x, d.limit),
      y: rubber(d.base.y + dy, d.min.y, d.max.y, d.limit),
    };
    // One style write per frame, however fast pointer events arrive.
    if (!frame.current) {
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        if (!drag.current) return;
        offset.current = { ...drag.current.target };
        write();
      });
    }
  };

  const endDrag = (cancelled: boolean, e?: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = rootRef.current;
    if (!d || (e && d.id !== e.pointerId)) return;
    drag.current = null;
    stop();
    if (el?.hasPointerCapture(d.id)) el.releasePointerCapture(d.id);
    if (!d.moved || !el) {
      // A tap interrupted an in-flight settle: finish going to the corner.
      if (el && (offset.current.x || offset.current.y)) settle();
      return;
    }
    delete el.dataset.dragging;
    if (cancelled) {
      settle();
      return;
    }
    offset.current = { ...d.target };
    write();

    // Release velocity (px/s) from the recent samples.
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const span = Math.max(last.t - first.t, 1);
    const v = {
      x: ((last.x - first.x) / span) * 1000,
      y: ((last.y - first.y) / span) * 1000,
    };
    if (e && e.timeStamp - last.t > 60) {
      // Pointer rested before release: no fling.
      v.x = 0;
      v.y = 0;
    }

    const g = measure(el);
    const rest = restPosition(corner, g);
    const cx = rest.x + offset.current.x + g.w / 2 + v.x * FLING_PROJECTION;
    const cy = rest.y + offset.current.y + g.h / 2 + v.y * FLING_PROJECTION;
    const next = cornerFrom(
      cy < g.ch / 2 ? 'top' : 'bottom',
      cx < g.cw / 2 ? 'left' : 'right',
    );
    if (next === corner) {
      settle(v);
    } else {
      releaseVelocity.current = v;
      setCorner(next);
      // A controlled parent may ignore the change: settle back if the corner
      // did not commit (the layout effect clears `releaseVelocity` when it did).
      requestAnimationFrame(() => {
        if (releaseVelocity.current) {
          const v0 = releaseVelocity.current;
          releaseVelocity.current = null;
          settle(v0);
        }
      });
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && drag.current) {
      e.preventDefault();
      endDrag(true);
      return;
    }
    if (e.target !== e.currentTarget) return;
    const [v, h] = corner.split('-') as ['top' | 'bottom', 'left' | 'right'];
    let next: SelfViewPipCorner | null = null;
    if (e.key === 'ArrowUp') next = cornerFrom('top', h);
    else if (e.key === 'ArrowDown') next = cornerFrom('bottom', h);
    else if (e.key === 'ArrowLeft') next = cornerFrom(v, 'left');
    else if (e.key === 'ArrowRight') next = cornerFrom(v, 'right');
    if (!next) return;
    e.preventDefault();
    if (next !== corner) setCorner(next);
  };

  const rootClass = [
    styles['self-view-pip'],
    docked
      ? styles['self-view-pip--docked']
      : styles[`self-view-pip--corner-${corner}`],
    styles[`self-view-pip--size-${size}`],
    hidden ? styles['self-view-pip--hidden'] : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (hidden) {
    return (
      <div ref={setRef} className={rootClass}>
        <button
          type="button"
          className={styles['self-view-pip__chip']}
          onClick={() => setHidden(false)}
        >
          <Icon glyph={<EyeOutlineIcon />} size="16" />
          <span>{l.show}</span>
        </button>
      </div>
    );
  }

  if (docked) {
    return (
      <div ref={setRef} className={rootClass}>
        <div className={styles['self-view-pip__content']}>{children}</div>
      </div>
    );
  }

  // Focusable group: arrow keys move it between corners (keyboard alternative
  // to dragging); pointer handlers implement the drag itself.
  /* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */
  return (
    <div
      ref={setRef}
      className={rootClass}
      role="group"
      aria-label={l.region}
      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endDrag(false, e)}
      onPointerCancel={(e) => endDrag(true, e)}
      onLostPointerCapture={(e) => endDrag(false, e)}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className={styles['self-view-pip__content']}>{children}</div>
      <IconButton
        className={styles['self-view-pip__hide']}
        icon={<Icon glyph={<CloseIcon />} />}
        size="x-small"
        style="inverted"
        aria-label={l.hide}
        title={l.hide}
        onClick={() => setHidden(true)}
      />
    </div>
  );
  /* eslint-enable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */
}
