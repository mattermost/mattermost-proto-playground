import type { ReactNode } from 'react';
import styles from './backdrop.module.scss';

/** Scrim host for modal surfaces in the scene stage (playground presentation). */
export default function ModalBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.backdrop__inner}>{children}</div>
    </div>
  );
}
