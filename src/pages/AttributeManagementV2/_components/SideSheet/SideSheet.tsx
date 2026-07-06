import type { ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import styles from './SideSheet.module.scss';

export interface SideSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Footer slot — typically a Cancel + Save button group. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Right-anchored side sheet. Used for "Manage order & clamp" and other
 * focused, secondary editors that don't warrant a full sub-page.
 */
export default function SideSheet({
  open,
  title,
  onClose,
  footer,
  children,
}: SideSheetProps) {
  if (!open) return null;
  return (
    <div className={styles['sheet']} role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className={styles['sheet__scrim']}
        onClick={onClose}
        aria-label="Close"
      />
      <div className={styles['sheet__panel']}>
        <header className={styles['sheet__header']}>
          <h2 className={styles['sheet__title']}>{title}</h2>
          <button
            type="button"
            className={styles['sheet__close']}
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </header>
        <div className={styles['sheet__body']}>{children}</div>
        {footer != null && (
          <footer className={styles['sheet__footer']}>{footer}</footer>
        )}
      </div>
    </div>
  );
}
