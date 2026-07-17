import type { ReactNode } from 'react';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Button from '@/components/Button/Button';
import styles from './AdminPanelFooter.module.scss';

export type AdminPanelFooterStatus = 'none' | 'warning' | 'error';

export interface AdminPanelFooterProps {
  /** Primary footer action label. */
  saveLabel?: string;
  cancelLabel?: string;
  onSave?: () => void;
  onCancel?: () => void;
  /** When true, Save uses disabled styling until the sheet is actionable. */
  saveDisabled?: boolean;
  /** Optional validation summary beside the buttons. */
  status?: AdminPanelFooterStatus;
  /** Override default copy when `warning` | `error`. */
  statusMessage?: ReactNode;
  className?: string;
}

const DEFAULT_WARNING = 'There are outstanding issues in the form above.';
const DEFAULT_ERROR = 'There are errors in the form above.';

export default function AdminPanelFooter({
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  onSave,
  onCancel,
  saveDisabled = true,
  status = 'none',
  statusMessage,
  className = '',
}: AdminPanelFooterProps) {
  let statusUi: ReactNode = null;

  if (status === 'warning') {
    const copy = statusMessage ?? DEFAULT_WARNING;
    statusUi = (
      <>
        <span className={styles['admin-panel-footer__status-icon']} aria-hidden>
          <AlertOutlineIcon size={12} />
        </span>
        <span>{copy}</span>
      </>
    );
  }

  if (status === 'error') {
    const copy = statusMessage ?? DEFAULT_ERROR;
    statusUi = (
      <>
        <span className={styles['admin-panel-footer__status-icon']} aria-hidden>
          <AlertCircleOutlineIcon size={12} />
        </span>
        <span>{copy}</span>
      </>
    );
  }

  const statusMod =
    status === 'warning'
      ? styles['admin-panel-footer--status-warning']
      : status === 'error'
        ? styles['admin-panel-footer--status-error']
        : '';

  return (
    <footer
      className={[styles['admin-panel-footer'], statusMod, className]
        .filter(Boolean)
        .join(' ')
        .trim()}
      role="contentinfo"
    >
      <div className={styles['admin-panel-footer__inner']}>
        <div className={styles['admin-panel-footer__actions']}>
          <Button
            type="button"
            size="Medium"
            emphasis="Primary"
            disabled={saveDisabled}
            onClick={onSave}
          >
            {saveLabel}
          </Button>
          <Button
            type="button"
            size="Medium"
            emphasis="Tertiary"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        </div>
        {statusUi != null ? (
          <div
            className={styles['admin-panel-footer__status']}
            role="alert"
          >
            {statusUi}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
