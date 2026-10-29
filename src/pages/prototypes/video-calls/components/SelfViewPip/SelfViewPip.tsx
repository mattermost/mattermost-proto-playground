import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import EyeOffOutlineIcon from '@mattermost/compass-icons/components/eye-off-outline';
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
  labels?: SelfViewPipLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<SelfViewPipLabels> = {
  region: 'Your video. Drag or use arrow keys to move it to another corner.',
  hide: 'Hide self view',
  show: 'Show self view',
};

/** Pointer travel (px) before a press becomes a drag. */
const DRAG_THRESHOLD = 4;

function cornerFrom(
  vertical: 'top' | 'bottom',
  horizontal: 'left' | 'right',
): SelfViewPipCorner {
  return `${vertical}-${horizontal}`;
}

/**
 * Floating, draggable self-view (Meet-style): snaps to the nearest stage
 * corner on release, arrow keys move between corners, and it can collapse to
 * a chip. Absolutely positioned inside the nearest positioned ancestor (the
 * stage); it only receives pointer events inside its own bounds.
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
  labels,
  className,
}: SelfViewPipProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [cornerState, setCornerState] =
    useState<SelfViewPipCorner>(defaultCorner);
  const [hiddenState, setHiddenState] = useState(defaultHidden);
  const [dragging, setDragging] = useState(false);
  const corner = cornerProp ?? cornerState;
  const hidden = hiddenProp ?? hiddenState;

  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const setCorner = useCallback(
    (next: SelfViewPipCorner) => {
      setCornerState(next);
      onCornerChange?.(next);
    },
    [onCornerChange],
  );

  const setHidden = (next: boolean) => {
    setHiddenState(next);
    onHiddenChange?.(next);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = rootRef.current;
    if (!d || d.id !== e.pointerId || !el) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      setDragging(true);
    }
    // Direct style write: no React render per pointer move.
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = rootRef.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!d.moved || !el) return;
    const parent = (el.offsetParent as HTMLElement | null) ?? el.parentElement;
    const rect = el.getBoundingClientRect();
    el.style.transform = '';
    setDragging(false);
    if (!parent || e.type === 'pointercancel') return;
    const box = parent.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 - box.left;
    const cy = rect.top + rect.height / 2 - box.top;
    setCorner(
      cornerFrom(
        cy < box.height / 2 ? 'top' : 'bottom',
        cx < box.width / 2 ? 'left' : 'right',
      ),
    );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
    styles[`self-view-pip--corner-${corner}`],
    styles[`self-view-pip--size-${size}`],
    hidden ? styles['self-view-pip--hidden'] : '',
    dragging ? styles['self-view-pip--dragging'] : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (hidden) {
    return (
      <div className={rootClass}>
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

  // Focusable group: arrow keys move it between corners (keyboard alternative
  // to dragging); pointer handlers implement the drag itself.
  /* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */
  return (
    <div
      ref={rootRef}
      className={rootClass}
      role="group"
      aria-label={l.region}
      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className={styles['self-view-pip__content']}>{children}</div>
      <IconButton
        className={styles['self-view-pip__hide']}
        icon={<Icon glyph={<EyeOffOutlineIcon />} />}
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
