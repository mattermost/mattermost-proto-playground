import type { ReactNode } from 'react';
import styles from './ProtoNote.module.scss';

export interface ProtoNoteProps {
  heading: string;
  children: ReactNode;
  className?: string;
}

/**
 * Prototype annotation register — dashed, `[AI DRAFT]`, and deliberately NOT
 * product chrome.
 *
 * Used for notes that belong to the design conversation rather than to the
 * shipped UI (e.g. "this backend behaviour is still open"). Hidden by
 * `?demo=off` so the surface can be shown to a customer without internal
 * commentary leaking into it.
 */
export default function ProtoNote({
  heading,
  children,
  className = '',
}: ProtoNoteProps) {
  const rootClass = [styles['proto-note'], className].filter(Boolean).join(' ');

  return (
    <aside className={rootClass}>
      <span className={styles['proto-note__badge']}>[AI DRAFT]</span>
      <div className={styles['proto-note__body']}>
        <span className={styles['proto-note__heading']}>{heading}</span>
        {children}
      </div>
    </aside>
  );
}

/** Paragraph inside a ProtoNote. Never render a bare `<p>` here. */
export function ProtoNoteText({
  children,
  strong = false,
}: {
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <p
      className={[
        styles['proto-note__text'],
        strong ? styles['proto-note__strong'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </p>
  );
}

/** Bullet list inside a ProtoNote. */
export function ProtoNoteList({ items }: { items: readonly string[] }) {
  return (
    <ul className={styles['proto-note__list']}>
      {items.map((item) => (
        <li key={item} className={styles['proto-note__item']}>
          {item}
        </li>
      ))}
    </ul>
  );
}
