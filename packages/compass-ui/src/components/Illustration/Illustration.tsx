import type { ReactNode } from 'react';
import styles from './Illustration.module.scss';

export interface IllustrationProps {
  /** SVG component from an illustration import (e.g. from `@/assets/illustrations/name.svg?react`). */
  children: ReactNode;
  /** Optional CSS class name. */
  className?: string;
  /** Optional inline width (e.g. "100%", "320px"). */
  width?: string;
  /** Optional inline height. */
  height?: string;
  /** Accessible label; set to empty string for decorative only. */
  'aria-label'?: string;
}

/**
 * Wrapper for illustration SVGs. Import SVGs as React components with the ?react suffix
 * and pass them as children.
 *
 * @example
 * import EmptyStateSvg from '@/assets/illustrations/empty-state.svg?react'
 * <Illustration aria-label="No items yet"><EmptyStateSvg /></Illustration>
 */
export default function Illustration({
  children,
  className = '',
  width,
  height,
  'aria-label': ariaLabel,
}: IllustrationProps) {
  const rootClass = [styles.illustration, className].filter(Boolean).join(' ');
  const hasLabel = ariaLabel !== undefined && ariaLabel !== '';

  return (
    <span
      className={rootClass}
      style={{ width, height }}
      role={hasLabel ? 'img' : undefined}
      aria-label={hasLabel ? ariaLabel : undefined}
      aria-hidden={!hasLabel}
    >
      {children}
    </span>
  );
}
