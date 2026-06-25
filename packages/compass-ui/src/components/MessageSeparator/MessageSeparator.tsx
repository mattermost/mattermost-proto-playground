import type { HTMLAttributes } from 'react';
import Icon from '@/components/Icon/Icon';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import styles from './MessageSeparator.module.scss';

export type MessageSeparatorType = 'Date' | 'New Messages' | 'Reply Count';

export interface MessageSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Separator variant. Default: Date. */
  type?: MessageSeparatorType;
  /** Label text. Defaults: 'Today' / 'New Messages' / '4 replies'. */
  label?: string;
  /** Show AI summarize button (New Messages type only). Default: false. */
  showAiSummary?: boolean;
  /** Called when Summarize button is clicked. */
  onSummarize?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

const DEFAULT_LABELS: Record<MessageSeparatorType, string> = {
  Date: 'Today',
  'New Messages': 'New Messages',
  'Reply Count': '4 replies',
};

/**
 * Horizontal divider lines in the message stream.
 * Three types: date separator, new-message indicator (gold), and reply count.
 */
export default function MessageSeparator({
  type = 'Date',
  label,
  showAiSummary = false,
  onSummarize,
  className = '',
  ...rest
}: MessageSeparatorProps) {
  const displayLabel = label ?? DEFAULT_LABELS[type];

  const rootClass = [
    styles['message-separator'],
    styles[
      `message-separator--${type === 'New Messages' ? 'new' : type === 'Reply Count' ? 'reply' : 'date'}`
    ],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelBlock = (
    <div className={styles['message-separator__label']}>
      <span className={styles['message-separator__text']}>
        {displayLabel}
      </span>

      {type === 'New Messages' && showAiSummary && (
        <button
          type="button"
          className={styles['message-separator__summarize']}
          onClick={onSummarize}
          aria-label="Summarize new messages with AI"
        >
          <span
            className={styles['message-separator__summarize-icon']}
            aria-hidden
          >
            <Icon size="12" glyph={<CreationOutlineIcon />} />
          </span>
          Summarize
        </button>
      )}
    </div>
  );

  return (
    <div className={rootClass} role="separator" {...rest}>
      {type === 'Reply Count' ? (
        <>
          <div className={styles['message-separator__reply-gutter']} aria-hidden>
            <div className={styles['message-separator__reply-line-start']} />
          </div>
          {labelBlock}
          <div className={styles['message-separator__line']} aria-hidden />
        </>
      ) : (
        <>
          <div className={styles['message-separator__line']} aria-hidden />
          {labelBlock}
          <div className={styles['message-separator__line']} aria-hidden />
        </>
      )}
    </div>
  );
}
