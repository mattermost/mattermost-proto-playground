// [AI DRAFT] Caption band, optional session controls, and one fixed-size product frame.
import type { ReactNode } from 'react';
import styles from './DmgmStage.module.scss';

export interface DmgmStageProps {
  /** Short screen title, shown outside the product surface. */
  title: string;
  /** Reviewer context, shown outside the product surface. Never inside the frame. */
  note?: ReactNode;
  /** Instrument panel (session controls), rendered between caption and frame. */
  controls?: ReactNode;
  /** The product screen, laid out at a true 1366 × 768 viewport. */
  children: ReactNode;
}

/**
 * Explanatory copy and prototype controls sit deliberately OUTSIDE the frame:
 * the frame is what reviewers judge, and anything inside it reads as shipped UI.
 */
export default function DmgmStage({
  title,
  note,
  controls,
  children,
}: DmgmStageProps) {
  return (
    <section className={styles['dmgm-stage']}>
      <header className={styles['dmgm-stage__caption']}>
        <h2 className={styles['dmgm-stage__title']}>{title}</h2>
        {note ? <div className={styles['dmgm-stage__note']}>{note}</div> : null}
      </header>
      {controls}
      <div className={styles['dmgm-stage__viewport']}>
        <div className={styles['dmgm-stage__frame']} data-dmgm-frame>
          {children}
        </div>
      </div>
    </section>
  );
}
