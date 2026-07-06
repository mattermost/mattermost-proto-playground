import type { ReactNode } from 'react';
import styles from './Section.module.scss';

export interface SectionProps {
  title: string;
  /** Optional secondary line under the title. */
  description?: string;
  /** Trailing action(s) for the section header. */
  headerAction?: ReactNode;
  children: ReactNode;
}

/**
 * Generic detail-page section card.
 * Used by Definition, Access & Editing, and Applies-to.
 */
export default function Section({
  title,
  description,
  headerAction,
  children,
}: SectionProps) {
  return (
    <section className={styles['section']}>
      <header className={styles['section__header']}>
        <div className={styles['section__titleblock']}>
          <h2 className={styles['section__title']}>{title}</h2>
          {description != null && (
            <p className={styles['section__desc']}>{description}</p>
          )}
        </div>
        {headerAction != null && (
          <div className={styles['section__action']}>{headerAction}</div>
        )}
      </header>
      <div className={styles['section__body']}>{children}</div>
    </section>
  );
}
