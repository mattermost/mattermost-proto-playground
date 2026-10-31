import type { ReactNode } from 'react';
import styles from './PreJoinPanel.module.scss';

export interface PreJoinPanelProps {
  /** Heading, e.g. "Ready to join?". */
  title: ReactNode;
  /** Optional line under the title. */
  subtitle?: ReactNode;
  /** Large self-preview (16:9). */
  preview: ReactNode;
  /** Device toggles and pickers shown under the preview. */
  previewControls?: ReactNode;
  /** Who is in the call / who will be called. */
  participants?: ReactNode;
  /** Extra checks (mic meter, speaker test) shown in the side column. */
  checks?: ReactNode;
  /** Primary and secondary buttons. */
  actions: ReactNode;
  /** Accessible name for the region. Defaults to the title when it is a string. */
  ariaLabel?: string;
  /** `dark` re-themes the text for a dark call surface (the window). */
  appearance?: 'default' | 'dark';
  className?: string;
}

/**
 * Two-column "ready to join" layout: preview on the left, details and actions
 * on the right (stacked on narrow containers). Presentational and slot-driven.
 */
export default function PreJoinPanel({
  title,
  subtitle,
  preview,
  previewControls,
  participants,
  checks,
  actions,
  ariaLabel,
  appearance = 'default',
  className,
}: PreJoinPanelProps) {
  const label = ariaLabel ?? (typeof title === 'string' ? title : undefined);
  return (
    <section
      className={[
        styles['pre-join-panel'],
        appearance === 'dark' ? styles['pre-join-panel--dark'] : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
    >
      <div className={styles['pre-join-panel__media']}>
        <div className={styles['pre-join-panel__preview']}>{preview}</div>
        {previewControls && (
          <div className={styles['pre-join-panel__preview-controls']}>
            {previewControls}
          </div>
        )}
      </div>
      <div className={styles['pre-join-panel__details']}>
        <div className={styles['pre-join-panel__heading']}>
          <h2 className={styles['pre-join-panel__title']}>{title}</h2>
          {subtitle && (
            <p className={styles['pre-join-panel__subtitle']}>{subtitle}</p>
          )}
        </div>
        {participants && (
          <div className={styles['pre-join-panel__participants']}>
            {participants}
          </div>
        )}
        {checks && (
          <div className={styles['pre-join-panel__checks']}>{checks}</div>
        )}
        <div className={styles['pre-join-panel__actions']}>{actions}</div>
      </div>
    </section>
  );
}
