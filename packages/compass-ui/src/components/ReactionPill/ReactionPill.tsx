import type { HTMLAttributes } from 'react';
import Icon from '@/components/Icon/Icon';
import HandRightOutlineIcon from '@mattermost/compass-icons/components/hand-right-outline';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import styles from './ReactionPill.module.scss';

export type ReactionPillSize = 'Small' | 'Medium' | 'Large';
export type ReactionPillType = 'Reaction' | 'Hand Raise' | 'Other';

export interface ReactionPillProps extends HTMLAttributes<HTMLDivElement> {
  /** Size variant. Default: Small. */
  size?: ReactionPillSize;
  /** Pill type. Default: Reaction. */
  type?: ReactionPillType;
  /** Emoji to display for Reaction type. Default: 😀 */
  emoji?: string;
  /** Participant name / label text. */
  label?: string;
  /** Notification message for 'Other' type. */
  message?: string;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Call-specific reaction pills showing emoji, hand-raise, or notification reactions
 * during calls. Anatomy: Leading Icon + Label (+ Trailing Icon for Other type).
 */
export default function ReactionPill({
  size = 'Small',
  type = 'Reaction',
  emoji = '😀',
  label = 'Leonard R.',
  message = 'You have been muted by the host',
  className = '',
  ...rest
}: ReactionPillProps) {
  const rootClass = [
    styles['reaction-pill'],
    styles[`reaction-pill--size-${size.toLowerCase()}`],
    styles[
      `reaction-pill--type-${type === 'Hand Raise' ? 'hand-raise' : type === 'Other' ? 'other' : 'reaction'}`
    ],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} {...rest}>
      <div className={styles['reaction-pill__inner']}>
        {/* Reaction type: emoji + name */}
        {type === 'Reaction' && (
          <>
            <span className={styles['reaction-pill__emoji']} aria-hidden>
              {emoji}
            </span>
            <span className={styles['reaction-pill__label']}>{label}</span>
          </>
        )}

        {/* Hand Raise: icon + name */}
        {type === 'Hand Raise' && (
          <>
            <span className={styles['reaction-pill__leading-icon']} aria-hidden>
              <Icon size="12" glyph={<HandRightOutlineIcon />} />
            </span>
            <span className={styles['reaction-pill__label']}>
              {label} Raised Hand
            </span>
          </>
        )}

        {/* Other type: icon + message + dismiss */}
        {type === 'Other' && (
          <>
            <span className={styles['reaction-pill__leading-icon']} aria-hidden>
              <Icon size="12" glyph={<MicrophoneOffIcon />} />
            </span>
            <span className={styles['reaction-pill__label']}>{message}</span>
            <span
              className={styles['reaction-pill__trailing-icon']}
              aria-hidden
            >
              <Icon size="12" glyph={<CloseCircleIcon />} />
            </span>
          </>
        )}
      </div>
    </div>
  );
}
