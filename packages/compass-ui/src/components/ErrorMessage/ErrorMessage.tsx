import Icon from '@/components/Icon/Icon';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import styles from './ErrorMessage.module.scss';

export interface ErrorMessageProps {
  /** Optional CSS class name. */
  className?: string;
  /** The error message text to display. */
  message: string;
}

/**
 * Error Message — inline red error text for form validation.
 * Displays an error icon alongside the message. Used below form inputs.
 */
export default function ErrorMessage({
  className = '',
  message,
}: ErrorMessageProps) {
  const rootClass = [styles['error-message'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="alert">
      <span className={styles['error-message__icon']} aria-hidden>
        <Icon size="12" glyph={<AlertCircleOutlineIcon />} />
      </span>
      <span className={styles['error-message__text']}>{message}</span>
    </div>
  );
}
