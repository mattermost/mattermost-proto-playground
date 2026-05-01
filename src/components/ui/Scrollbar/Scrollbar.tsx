import styles from './Scrollbar.module.scss';

export type ScrollbarOrientation = 'Vertical' | 'Horizontal';
export type ScrollbarThumbSize = '25%' | '33%' | '50%' | '75%';

export interface ScrollbarProps {
  /** Orientation of the scrollbar. Default: Vertical. */
  orientation?: ScrollbarOrientation;
  /** Thumb size relative to the track. Default: 25%. */
  thumbSize?: ScrollbarThumbSize;
  /** Scroll position as a percentage (0–100) from the start. Default: 0. */
  scrollPosition?: number;
  /** Optional CSS class name. */
  className?: string;
}

const THUMB_SIZE_MAP: Record<ScrollbarThumbSize, number> = {
  '25%': 25,
  '33%': 33,
  '50%': 50,
  '75%': 75,
};

/**
 * Scrollbar — custom scrollbar component.
 * Vertical and horizontal variants. Multiple thumb sizes (25%/33%/50%/75%).
 * Low-level UI primitive.
 *
 * @see https://compass.mattermost.com/29be2c109/p/88cb9c-scrollbars
 */
export default function Scrollbar({
  orientation = 'Vertical',
  thumbSize = '25%',
  scrollPosition = 0,
  className = '',
}: ScrollbarProps) {
  const isVertical = orientation === 'Vertical';
  const thumbPercent = THUMB_SIZE_MAP[thumbSize];
  const clampedPosition = Math.min(100, Math.max(0, scrollPosition));
  // Max offset so the thumb doesn't overflow the track
  const maxOffset = 100 - thumbPercent;
  const thumbOffset = (clampedPosition / 100) * maxOffset;

  const orientationClass = isVertical
    ? styles['scrollbar--vertical']
    : styles['scrollbar--horizontal'];

  const thumbStyle = isVertical
    ? {
        height: `${thumbPercent}%`,
        top: `${thumbOffset}%`,
      }
    : {
        width: `${thumbPercent}%`,
        left: `${thumbOffset}%`,
      };

  return (
    <div
      className={[styles.scrollbar, orientationClass, className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <div className={styles['scrollbar__track']}>
        <div className={styles['scrollbar__thumb']} style={thumbStyle} />
      </div>
    </div>
  );
}
