import type { HTMLAttributes } from 'react';
import Emoji from '@/components/Emoji/Emoji';
import IconButton from '@/components/IconButton/IconButton';
import Icon from '@/components/Icon/Icon';
import EmoticonPlusOutlineIcon from '@mattermost/compass-icons/components/emoticon-plus-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import AppsIcon from '@mattermost/compass-icons/components/apps';
import ReplyOutlineIcon from '@mattermost/compass-icons/components/reply-outline';
import styles from './MessageActions.module.scss';

export type MessageActionsType = 'Center Channel' | 'RHS' | 'Search Results';

export interface MessageActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** Context variant. Default: Center Channel. */
  type?: MessageActionsType;
  /** Whether the hover toolbar is visible. Default: true. */
  visible?: boolean;
  /** Whether collapsed reply threads feature is on. Default: true. */
  collapsedReplyThreads?: boolean;
  /** Whether quick reactions are shown. Default: true. */
  quickReactions?: boolean;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Hover toolbar on messages. Context-aware variants for Center Channel, RHS,
 * and Search Results. Quick Reactions toggle shows emoji shortcuts.
 */
export default function MessageActions({
  type = 'Center Channel',
  visible = true,
  collapsedReplyThreads = true,
  quickReactions = true,
  className = '',
  ...rest
}: MessageActionsProps) {
  if (!visible) return null;

  const isCenterChannel = type === 'Center Channel';
  const isRHS = type === 'RHS';
  const isSearchResults = type === 'Search Results';
  const showQuickReactions = quickReactions && collapsedReplyThreads;

  const rootClass = [styles['message-actions'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      role="toolbar"
      aria-label="Message actions"
      {...rest}
    >
      {/* Quick reaction emojis — center channel + RHS */}
      {showQuickReactions && !isSearchResults && (
        <>
          <IconButton
            aria-label="React with thumbs up"
            size="Small"
            padding="Compact"
            icon={<Emoji emoji="👍" size="16" />}
          />
          {isCenterChannel && (
            <>
              <IconButton
                aria-label="React with raised hands"
                size="Small"
                padding="Compact"
                icon={<Emoji emoji="🙌" size="16" />}
              />
              <IconButton
                aria-label="React with OK hand"
                size="Small"
                padding="Compact"
                icon={<Emoji emoji="👌" size="16" />}
              />
            </>
          )}
          <IconButton
            aria-label="Add reaction"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<EmoticonPlusOutlineIcon />} />}
          />
        </>
      )}

      {/* Search results only: more button first */}
      {isSearchResults && (
        <IconButton
          aria-label="More actions"
          size="Small"
          padding="Compact"
          icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
        />
      )}

      {/* Center channel actions */}
      {isCenterChannel && (
        <>
          <IconButton
            aria-label="Save message"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<BookmarkOutlineIcon />} />}
          />
          <IconButton
            aria-label="AI actions"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<CreationOutlineIcon />} />}
          />
          <IconButton
            aria-label="Plugin actions"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<AppsIcon />} />}
          />
          <IconButton
            aria-label="Reply in thread"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<ReplyOutlineIcon />} />}
          />
          <IconButton
            aria-label="More actions"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
          />
        </>
      )}

      {/* RHS actions */}
      {isRHS && (
        <IconButton
          aria-label="More actions"
          size="Small"
          padding="Compact"
          icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
        />
      )}

      {/* Search results additional buttons */}
      {isSearchResults && (
        <>
          <IconButton
            aria-label="Save message"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<BookmarkOutlineIcon />} />}
          />
          <IconButton
            aria-label="Reply in thread"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<ReplyOutlineIcon />} />}
          />
          <button
            type="button"
            className={styles['message-actions__jump']}
            aria-label="Jump to message"
          >
            Jump
          </button>
        </>
      )}
    </div>
  );
}
