/**
 * ScreenCanvas — the standard two-part layout for a DPC V2 state file.
 *
 *   ┌──────────────────────────────────────┐
 *   │  Optional eyebrow + title strip      │
 *   │  (rendered above the canvas)         │
 *   ├──────────────────────────────────────┤
 *   │  UI canvas (product UI lives here)   │
 *   │  — e.g. a ChannelShell + modal       │
 *   ├──────────────────────────────────────┤
 *   │  Review notes (below the divider)    │
 *   └──────────────────────────────────────┘
 *
 * Per Change 3 of the May 2026 stakeholder feedback: reviewer commentary
 * (e.g. "DM PREVIEW · WHAT @USER WILL RECEIVE", "Security note · FR-18 /
 * NIST 800-207 Tenet 1", etc.) MUST live below the canvas in the Review
 * notes block, never inside the product UI itself.
 */
import type { ReactNode } from 'react';
import ReviewNotes, { type ReviewNoteItem } from './ReviewNotes';
import styles from './ScreenCanvas.module.scss';

export interface ScreenCanvasProps {
  /** Optional eyebrow above the title (e.g. spec section). */
  eyebrow?: ReactNode;
  /** Optional screen title rendered above the UI canvas. */
  title?: ReactNode;
  /** Optional one-line subtitle below the title. */
  subtitle?: ReactNode;
  /** The product UI — modal over app, full-screen surface, etc. */
  canvas: ReactNode;
  /** Optional reviewer commentary block heading. */
  reviewTitle?: string;
  /** Optional summary paragraph that introduces the review notes. */
  reviewSummary?: ReactNode;
  /** Structured per-section reviewer commentary. */
  reviewItems?: ReviewNoteItem[];
  /** Freeform reviewer commentary when `reviewItems` doesn't fit. */
  reviewChildren?: ReactNode;
  className?: string;
}

export default function ScreenCanvas({
  eyebrow,
  title,
  subtitle,
  canvas,
  reviewTitle,
  reviewSummary,
  reviewItems,
  reviewChildren,
  className,
}: ScreenCanvasProps) {
  const hasReview =
    reviewSummary != null ||
    (reviewItems != null && reviewItems.length > 0) ||
    reviewChildren != null;

  return (
    <section
      className={[styles['screen-canvas'], className]
        .filter(Boolean)
        .join(' ')}
    >
      {(eyebrow || title || subtitle) && (
        <header className={styles['screen-canvas__heading']}>
          {eyebrow && (
            <span className={styles['screen-canvas__eyebrow']}>{eyebrow}</span>
          )}
          {title && (
            <h2 className={styles['screen-canvas__title']}>{title}</h2>
          )}
          {subtitle && (
            <p className={styles['screen-canvas__subtitle']}>{subtitle}</p>
          )}
        </header>
      )}
      <div className={styles['screen-canvas__canvas']}>{canvas}</div>
      {hasReview && (
        <ReviewNotes
          title={reviewTitle}
          summary={reviewSummary}
          items={reviewItems}
        >
          {reviewChildren}
        </ReviewNotes>
      )}
    </section>
  );
}
