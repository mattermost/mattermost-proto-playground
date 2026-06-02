import type { HTMLAttributes } from 'react';
import styles from './Spinner.module.scss';

export type SpinnerSize = 10 | 12 | 16 | 20 | 24 | 28 | 32;

export interface SpinnerProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'role'
> {
  size?: SpinnerSize;
  inverted?: boolean;
  'aria-label'?: string;
}

export default function Spinner({
  size = 16,
  inverted = false,
  className = '',
  'aria-label': ariaLabel = 'Loading',
  style,
  ...htmlProps
}: SpinnerProps) {
  const strokeWidth = Math.max(1, Math.min(3, Math.round(size * 0.1)));

  const rootClass = [
    styles.spinner,
    inverted ? styles['spinner--inverted'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={rootClass}
      role="status"
      aria-label={ariaLabel}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ['--spinner-stroke-width' as string]: `${strokeWidth}px`,
        ...style,
      }}
      {...htmlProps}
    />
  );
}
