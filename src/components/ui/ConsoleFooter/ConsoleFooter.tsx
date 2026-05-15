import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import styles from './ConsoleFooter.module.scss';

export interface ConsoleFooterProps {
  /** Whether the Save button is disabled. Default: true. */
  saveDisabled?: boolean;
  /** Whether a save operation is in progress. */
  saving?: boolean;
  /** Callback when Save is clicked. */
  onSave?: () => void;
  /** Callback when Cancel is clicked. */
  onCancel?: () => void;
  /** Warning message shown after the buttons (triangle-alert icon). */
  warning?: string;
  /** Error message shown after the buttons (circle-alert icon). */
  error?: string;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * System Console page footer — sticky bottom bar with Save / Cancel actions
 * and an optional warning or error message slot.
 *
 * Variants:
 * - Default: Save (disabled) + Cancel
 * - Warning: buttons + warning icon and message
 * - Error: buttons + error icon and message
 *
 * @see Figma: Compass System Console → Console Footer
 */
export default function ConsoleFooter({
  saveDisabled = true,
  saving = false,
  onSave,
  onCancel,
  warning,
  error,
  className = '',
}: ConsoleFooterProps) {
  const rootClass = [styles['console-footer'], className]
    .filter(Boolean)
    .join(' ');

  const message = error || warning;
  const messageIcon = error ? (
    <AlertCircleOutlineIcon />
  ) : warning ? (
    <AlertOutlineIcon />
  ) : null;
  const messageClass = [
    styles['console-footer__message'],
    error
      ? styles['console-footer__message--error']
      : warning
        ? styles['console-footer__message--warning']
        : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['console-footer__content']}>
        <div className={styles['console-footer__buttons']}>
          <Button
            emphasis="Primary"
            disabled={saveDisabled || saving}
            onClick={onSave}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button emphasis="Tertiary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        {message != null && (
          <div className={messageClass}>
            <span className={styles['console-footer__message-icon']}>
              <Icon size="12" glyph={messageIcon} />
            </span>
            <span className={styles['console-footer__message-text']}>
              {message}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
