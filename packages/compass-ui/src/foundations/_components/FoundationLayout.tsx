import type { ReactNode } from 'react';
import styles from './FoundationLayout.module.scss';

export function FoundationLayout({ children }: { children: ReactNode }) {
  return <div className={styles.foundationLayout}>{children}</div>;
}
