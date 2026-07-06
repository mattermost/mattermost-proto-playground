import type { ReactNode } from 'react';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import styles from './DetailShell.module.scss';

export interface DetailShellProps {
  title: string;
  /** Meta line below title — e.g. type · applies-to summary · shared-with link. */
  meta?: ReactNode;
  onBack: () => void;
  /** Overflow `⋯` action handler. */
  onOverflow?: () => void;
  children: ReactNode;
}

/**
 * Full sub-page drill-in shell.
 *   ‹ back → attribute  (header)
 *   title + meta line   (single primary slot in overflow menu only)
 *   body (caller composes Definition, Access & Editing, Applies-to)
 *
 * Save is implicit per section — no global "Save changes" bar.
 */
export default function DetailShell({
  title,
  meta,
  onBack,
  onOverflow,
  children,
}: DetailShellProps) {
  return (
    <div className={styles['detail']}>
      <button
        type="button"
        className={styles['detail__back']}
        onClick={onBack}
      >
        <ChevronLeftIcon size={16} />
        <span>Back to attributes</span>
      </button>

      <header className={styles['detail__header']}>
        <div className={styles['detail__titleblock']}>
          <h1 className={styles['detail__title']}>{title}</h1>
          {meta != null && (
            <div className={styles['detail__meta']}>{meta}</div>
          )}
        </div>
        <button
          type="button"
          className={styles['detail__overflow']}
          aria-label="More actions"
          onClick={onOverflow}
        >
          <DotsHorizontalIcon size={20} />
        </button>
      </header>

      <div className={styles['detail__body']}>{children}</div>
    </div>
  );
}
