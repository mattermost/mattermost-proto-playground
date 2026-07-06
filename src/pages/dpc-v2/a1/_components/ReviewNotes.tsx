/**
 * ReviewNotes — a clearly-separated block of reviewer commentary that
 * lives BELOW the UI canvas for a screen.
 *
 * The product UI renders cleanly at the top of each screen (no dashed-
 * border meta-annotations inside the modal/page itself). Below the UI,
 * a horizontal divider separates the canvas from the "Review notes"
 * section, which uses Compass DS heading hierarchy + a distinct visual
 * treatment so reviewers cannot mistake the commentary for product UI.
 */
import type { ReactNode } from 'react';
import styles from './ReviewNotes.module.scss';

export interface ReviewNoteItem {
  heading: string;
  body: ReactNode;
}

export interface ReviewNotesProps {
  /** Lead-in heading. Default: "Review notes". */
  title?: string;
  /** Optional one-line summary that introduces the block. */
  summary?: ReactNode;
  /** Structured per-section commentary. */
  items?: ReviewNoteItem[];
  /** Freeform content when `items` doesn't fit. */
  children?: ReactNode;
  className?: string;
}

export default function ReviewNotes({
  title = 'Review notes',
  summary,
  items,
  children,
  className,
}: ReviewNotesProps) {
  return (
    <section
      className={[styles['review-notes'], className]
        .filter(Boolean)
        .join(' ')}
      aria-label={title}
    >
      <div className={styles['review-notes__divider']} aria-hidden />
      <header className={styles['review-notes__header']}>
        <span className={styles['review-notes__eyebrow']}>
          Not product UI · reviewer commentary
        </span>
        <h3 className={styles['review-notes__title']}>{title}</h3>
        {summary && (
          <p className={styles['review-notes__summary']}>{summary}</p>
        )}
      </header>

      {items && items.length > 0 && (
        <div className={styles['review-notes__items']}>
          {items.map((it) => (
            <div className={styles['review-notes__item']} key={it.heading}>
              <h4 className={styles['review-notes__item-heading']}>
                {it.heading}
              </h4>
              <div className={styles['review-notes__item-body']}>
                {it.body}
              </div>
            </div>
          ))}
        </div>
      )}

      {children && <div className={styles['review-notes__free']}>{children}</div>}
    </section>
  );
}
