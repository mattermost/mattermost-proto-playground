import type { ReactNode } from 'react';
import styles from './Num.module.scss';

interface NumProps {
  children: ReactNode;
}

/**
 * Numbered-circle marker. Use inline in MDX to label a list item that
 * corresponds to a numbered callout in an anatomy diagram above.
 */
export default function Num({ children }: NumProps) {
  return <span className={styles['num']}>{children}</span>;
}
