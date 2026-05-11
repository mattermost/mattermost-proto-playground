import type { ReactNode } from 'react';
import styles from './GuidelineSampleRow.module.scss';

interface GuidelineSampleRowProps {
  children: ReactNode;
}

/** Horizontal wrap row for inline MDX examples (icons, toggles, pills). */
export default function GuidelineSampleRow({ children }: GuidelineSampleRowProps) {
  return (
    <div className={styles['guideline-sample-row']}>{children}</div>
  );
}
