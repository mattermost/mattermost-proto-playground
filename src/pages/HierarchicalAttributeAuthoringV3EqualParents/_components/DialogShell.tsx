import type { ReactNode } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import type { ModalSize } from '@/components/ui/Modal/Modal';
import styles from './dialogs.module.scss';

export interface DialogShellProps {
  title: string;
  subtitle?: string;
  size?: ModalSize;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
}

/**
 * Scrim + centred Modal for the three consequence dialogs (add-a-parent, delete,
 * link-in-order). Each dialog is its own view, so each carries exactly one
 * `emphasis="Primary"` action while the page underneath carries none.
 */
export default function DialogShell({
  title,
  subtitle,
  size = 'Small',
  onClose,
  footer,
  children,
}: DialogShellProps) {
  return (
    <div className={styles['dialogs']} role="presentation">
      <button
        type="button"
        className={styles['dialogs__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['dialogs__frame']}>
        <Modal
          size={size}
          title={title}
          subtitle={subtitle}
          onClose={onClose}
          footer={<div className={styles['dialogs__footer']}>{footer}</div>}
        >
          <div className={styles['dialogs__body']}>{children}</div>
        </Modal>
      </div>
    </div>
  );
}
