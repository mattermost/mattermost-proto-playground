import { useEffect, useRef } from 'react';
import type { AgentColor, AgentShape } from '../agentsData';
import { AGENT_COLOR_HEX } from '../agentsData';
import styles from './AgentAvatar.module.scss';

type AgentAvatarProps = {
  shape: AgentShape;
  color: AgentColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  eyes?: boolean;
  className?: string;
};

/** How far eyes can wander, as a fraction of the avatar width. */
const EYE_TRAVEL = 0.14;

/**
 * Geometric agent appearance (shape × color) used in the New Agent modal
 * and Agents landing cards. When `eyes` is set, pupils track the pointer.
 */
export default function AgentAvatar({
  shape,
  color,
  size = 'md',
  eyes = false,
  className = '',
}: AgentAvatarProps) {
  const hex = AGENT_COLOR_HEX[color];
  const rootRef = useRef<HTMLSpanElement>(null);
  const eyesRef = useRef<HTMLSpanElement>(null);

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
      const max = rect.width * EYE_TRAVEL;
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
  }, [eyes]);

  return (
    <span
      ref={rootRef}
      className={[
        styles['agent-avatar'],
        styles[`agent-avatar--${size}`],
        styles[`agent-avatar--${shape}`],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ['--agent-avatar-color' as string]: hex }}
      aria-hidden
    >
      <span className={styles['agent-avatar__shape']} />
      {eyes ? (
        <span ref={eyesRef} className={styles['agent-avatar__eyes']}>
          <span />
          <span />
        </span>
      ) : null}
    </span>
  );
}
