import type { ReactNode } from 'react';
import styles from './AcvcStage.module.scss';

export interface AcvcStageProps {
  /** Short screen title, shown outside the product surface. */
  title: string;
  /** One or two sentences of reviewer context, shown outside the product surface. */
  note?: ReactNode;
  /** The framed product screen. */
  children: ReactNode;
  /** Renders the frame at channel-app proportions rather than console proportions. */
  variant?: 'app' | 'console';
}

/**
 * Caption band plus a frame for one product screen.
 *
 * The caption sits deliberately OUTSIDE the frame: nothing explanatory may
 * appear inside the product surface, because the surface is what reviewers are
 * judging and stray annotations read as shipped UI.
 */
export default function AcvcStage({
  title,
  note,
  children,
  variant = 'app',
}: AcvcStageProps) {
  return (
    <section className={styles['acvc-stage']}>
      <header className={styles['acvc-stage__caption']}>
        <h2 className={styles['acvc-stage__title']}>{title}</h2>
        {note ? <p className={styles['acvc-stage__note']}>{note}</p> : null}
      </header>
      <div
        className={[
          styles['acvc-stage__frame'],
          styles[`acvc-stage__frame--${variant}`],
        ].join(' ')}
      >
        {children}
      </div>
    </section>
  );
}
