import type { HTMLAttributes } from 'react';
import IconButton from '@/components/IconButton/IconButton';
import Icon from '@/components/Icon/Icon';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import EmoticonPlusOutlineIcon from '@mattermost/compass-icons/components/emoticon-plus-outline';
import styles from './MessageReactions.module.scss';

export interface ReactionItem {
  emoji: string;
  count: number;
  /** Whether the current user reacted with this emoji. */
  byCurrentUser?: boolean;
}

export interface MessageReactionsProps extends HTMLAttributes<HTMLDivElement> {
  /** List of reactions to display. */
  reactions?: ReactionItem[];
  /** Whether to show the add-reaction button. Default: false. */
  showAddReaction?: boolean;
  /** Whether to show the acknowledge button. */
  acknowledged?: boolean;
  /** Acknowledge count. */
  acknowledgeCount?: number;
  /** Whether the current user has acknowledged. Default: false. */
  currentUserAcknowledged?: boolean;
  /** Called when add-reaction is clicked. */
  onAddReaction?: () => void;
  /** Called when a reaction pill is clicked. */
  onReactionClick?: (emoji: string) => void;
  /** Called when the acknowledge button is clicked. */
  onAcknowledge?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

const DEFAULT_REACTIONS: ReactionItem[] = [
  { emoji: '👍', count: 1 },
  { emoji: '😀', count: 4 },
  { emoji: '🙌', count: 1 },
];

/**
 * Emoji reaction chips displayed below messages.
 * Distinguishes the current user's own reactions (highlighted) from others.
 * Includes an add-reaction button and an optional Acknowledge variant.
 */
export default function MessageReactions({
  reactions = DEFAULT_REACTIONS,
  showAddReaction = false,
  acknowledged = false,
  acknowledgeCount = 0,
  currentUserAcknowledged = false,
  onAddReaction,
  onReactionClick,
  onAcknowledge,
  className = '',
  ...rest
}: MessageReactionsProps) {
  const rootClass = [styles['message-reactions'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} {...rest}>
      {/* Acknowledge button */}
      {acknowledged && (
        <button
          type="button"
          className={[
            styles['message-reactions__ack'],
            currentUserAcknowledged
              ? styles['message-reactions__ack--active']
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={onAcknowledge}
          aria-pressed={currentUserAcknowledged}
          aria-label="Acknowledge message"
        >
          <span className={styles['message-reactions__ack-icon']} aria-hidden>
            <Icon size="16" glyph={<CheckCircleOutlineIcon />} />
          </span>
          {currentUserAcknowledged ? (
            <span className={styles['message-reactions__ack-count']}>
              {acknowledgeCount}
            </span>
          ) : (
            <span className={styles['message-reactions__ack-label']}>
              Acknowledge
            </span>
          )}
        </button>
      )}

      {/* Reaction pills */}
      <div className={styles['message-reactions__pills']}>
        {reactions.map(({ emoji, count, byCurrentUser }) => (
          <button
            key={emoji}
            type="button"
            className={[
              styles['message-reactions__pill'],
              byCurrentUser ? styles['message-reactions__pill--mine'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onReactionClick?.(emoji)}
            aria-label={`${emoji} ${count} reaction${count !== 1 ? 's' : ''}`}
            aria-pressed={byCurrentUser}
          >
            <span
              className={styles['message-reactions__pill-emoji']}
              aria-hidden
            >
              {emoji}
            </span>
            <span className={styles['message-reactions__pill-count']}>
              {count}
            </span>
          </button>
        ))}

        {/* Add reaction button */}
        {showAddReaction && (
          <IconButton
            aria-label="Add reaction"
            className={styles['message-reactions__add-reaction']}
            size="X-Small"
            onClick={onAddReaction}
            icon={<Icon size="16" glyph={<EmoticonPlusOutlineIcon />} />}
          />
        )}
      </div>
    </div>
  );
}
