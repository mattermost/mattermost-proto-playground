import type { ReactNode } from 'react';
import styles from './Preview.module.scss';

interface PreviewProps {
  /** Optional caption shown above the preview area. */
  caption?: string;
  /** When true, centers the children horizontally inside the preview area. */
  center?: boolean;
  children: ReactNode;
}

/**
 * Bordered, padded container for embedding live components inside a guideline
 * MDX page. Visually separates a working example from surrounding prose.
 */
export default function Preview({ caption, center = false, children }: PreviewProps) {
  const bodyClass = [
    styles['preview__body'],
    center ? styles['preview__body--center'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={[styles['preview'], 'compass-doc-embed'].join(' ')}>
      {caption && <p className={styles['preview__caption']}>{caption}</p>}
      <div className={bodyClass}>{children}</div>
    </div>
  );
}
