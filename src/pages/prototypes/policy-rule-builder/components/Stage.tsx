// [AI DRAFT] The product surface. Reviewer copy lives in the page header, so
// this region is the console and it fills the page under that header.
import type { ReactNode } from 'react';
import styles from './Stage.module.scss';

export interface StageProps {
  /** Instrument panel (session controls), rendered above the product surface. */
  controls?: ReactNode;
  /** The product screen, filling the page under the reviewer header. */
  children: ReactNode;
}

export default function Stage({ controls, children }: StageProps) {
  return (
    <section className={styles['prb-stage']}>
      {controls}
      <div className={styles['prb-stage__viewport']}>
        <div className={styles['prb-stage__frame']} data-prb-frame>
          {children}
        </div>
      </div>
    </section>
  );
}
