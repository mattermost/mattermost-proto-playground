import { useEffect, useRef } from 'react';
import type { AgentColor, AgentShape } from '../agentsData';
import { AGENT_COLOR_STOPS } from '../agentsData';
import {
  AGENT_AVATAR_SHAPE_PATHS,
  agentAvatarShapeMask,
} from './agentAvatarShapes';
import styles from './AgentAvatar.module.scss';

type AgentAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type AgentAvatarProps = {
  shape: AgentShape;
  color: AgentColor;
  size?: AgentAvatarSize;
  eyes?: boolean;
  /** Soft float — New Agent modal preview only (not swatches / sidebar). */
  levitate?: boolean;
  /**
   * Oval ground shadow — only for large hero contexts (New Agent modal
   * preview, Agents landing Matty card). Off by default.
   */
  shadow?: boolean;
  /** When set, draws a 2px --button-bg contour ring outset 4px from the shape. */
  selected?: boolean;
  className?: string;
};

/**
 * How far eyes can wander, as a fraction of the avatar width.
 * Slightly higher on `xs` so pupils still read at ~20px sidebar size.
 */
const EYE_TRAVEL: Record<AgentAvatarSize, number> = {
  xs: 0.18,
  sm: 0.14,
  md: 0.14,
  lg: 0.14,
  xl: 0.14,
};

/** Shared geometry attrs for the double-stroke selection ring. */
const SELECTION_STROKE = {
  fill: 'none' as const,
  vectorEffect: 'non-scaling-stroke' as const,
};

/**
 * Geometric agent appearance (shape × color) used in the New Agent modal
 * and Agents landing cards. When `eyes` is set, pupils track the pointer.
 */
export default function AgentAvatar({
  shape,
  color,
  size = 'md',
  eyes = false,
  levitate = false,
  shadow = false,
  selected = false,
  className = '',
}: AgentAvatarProps) {
  const stops = AGENT_COLOR_STOPS[color];
  const shapeMask = agentAvatarShapeMask(shape);
  const maskStyle = shapeMask
    ? {
        WebkitMaskImage: shapeMask,
        maskImage: shapeMask,
      }
    : undefined;
  const colorStyle = {
    ['--agent-avatar-highlight' as string]: stops.highlight,
    ['--agent-avatar-mid' as string]: stops.mid,
    ['--agent-avatar-edge' as string]: stops.edge,
  };
  const rootRef = useRef<HTMLSpanElement>(null);
  const eyesRef = useRef<HTMLSpanElement>(null);
  const eyeTravel = EYE_TRAVEL[size];

  useEffect(() => {
    if (!eyes) return;

    let frame = 0;

    const lookAt = (clientX: number, clientY: number) => {
      const root = rootRef.current;
      const pupils = eyesRef.current;
      if (!root || !pupils) return;

      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const max = rect.width * eyeTravel;
      const distance = Math.hypot(dx, dy) || 1;
      const scale = Math.min(1, max / distance);

      pupils.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
    };

    const onPointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        lookAt(event.clientX, event.clientY);
      });
    };

    const onPointerLeave = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (eyesRef.current) {
          eyesRef.current.style.transform = 'translate(0px, 0px)';
        }
      });
    };

    window.addEventListener('pointermove', onPointerMove);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener(
        'pointerleave',
        onPointerLeave,
      );
    };
  }, [eyes, eyeTravel]);

  return (
    <span
      ref={rootRef}
      className={[
        styles['agent-avatar'],
        styles[`agent-avatar--${size}`],
        styles[`agent-avatar--${shape}`],
        shadow ? styles['agent-avatar--shadow'] : '',
        levitate ? styles['agent-avatar--levitate'] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={colorStyle}
      aria-hidden
    >
      {selected ? (
        <svg
          className={styles['agent-avatar__selection']}
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* Double-stroke along path: 12px button-bg, 8px bg punch → 4px gap + 2px ring */}
          {shape === 'sphere' ? (
            <>
              <circle
                className={styles['agent-avatar__selection-ring']}
                cx="0.5"
                cy="0.5"
                r="0.5"
                {...SELECTION_STROKE}
              />
              <circle
                className={styles['agent-avatar__selection-gap']}
                cx="0.5"
                cy="0.5"
                r="0.5"
                {...SELECTION_STROKE}
              />
            </>
          ) : (
            <>
              <path
                className={styles['agent-avatar__selection-ring']}
                d={AGENT_AVATAR_SHAPE_PATHS[shape]}
                strokeLinejoin="round"
                {...SELECTION_STROKE}
              />
              <path
                className={styles['agent-avatar__selection-gap']}
                d={AGENT_AVATAR_SHAPE_PATHS[shape]}
                strokeLinejoin="round"
                {...SELECTION_STROKE}
              />
            </>
          )}
        </svg>
      ) : null}
      <span className={styles['agent-avatar__shape']} style={maskStyle} />
      {eyes ? (
        <span ref={eyesRef} className={styles['agent-avatar__eyes']}>
          <span />
          <span />
        </span>
      ) : null}
    </span>
  );
}
