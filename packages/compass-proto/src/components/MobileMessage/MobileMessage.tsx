import type {ReactNode} from 'react';
import { ChannelInfoMsgHeader } from '@mattermost/compass-ui';
import { Tag } from '@mattermost/compass-ui';
import { UserAvatar } from '@mattermost/compass-ui';
import { PinnedSavedIndicators } from '@mattermost/compass-ui';
import styles from './MobileMessage.module.scss';

export interface MobileMessageProps {
  avatarSrc?: string;
  avatarAlt: string;
  username: string;
  timestamp: string;
  isBot?: boolean;
  botLabel?: string;
  /** When true, Pinned + Saved row appears at the top of the message container. */
  showPinnedSavedIndicators?: boolean;
  /**
   * Channel name shown in a Channel Info Message Header above the post —
   * used in Mentions / Saved lists.
   */
  channelName?: string;
  /**
   * Optional team name after the channel divider. Omit when the workspace has
   * only one team or the team is already clear from context.
   */
  teamName?: string;
  /** Called when the channel label is pressed. */
  onChannelClick?: () => void;
  /** Merged onto the root element (e.g. documentation modifiers). */
  className?: string;
  /**
   * Primary body content (e.g. message text). For plain `<p>` copy, use the
   * `mobile-message__body-text` class from `MobileMessage.module.scss` so
   * typography matches Body 200 and host shells cannot restyle bare tags.
   */
  children: ReactNode;
  /** Link Preview block — renders after `children`. */
  linkPreview?: ReactNode;
  /** Image Preview block(s) — renders after the link preview slot. */
  imagePreviews?: ReactNode;
  /** Trailing body content — e.g. attachments and reactions — renders last. */
  footer?: ReactNode;
}

export default function MobileMessage({
  avatarSrc,
  avatarAlt,
  username,
  timestamp,
  isBot = false,
  botLabel = 'Bot',
  showPinnedSavedIndicators = false,
  channelName,
  teamName,
  onChannelClick,
  className = '',
  children,
  linkPreview,
  imagePreviews,
  footer,
}: MobileMessageProps) {
  const rootClass = [styles['mobile-message'], className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      {channelName != null && channelName !== '' && (
        <div className={styles['mobile-message__channel']}>
          <ChannelInfoMsgHeader
            className={styles['mobile-message__channel-header']}
            channelName={channelName}
            teamName={teamName}
            onChannelClick={onChannelClick}
          />
        </div>
      )}
      {showPinnedSavedIndicators && (
        <div className={styles['mobile-message__pinned']}>
          <PinnedSavedIndicators />
        </div>
      )}
      <div className={styles['mobile-message__layout']}>
        <div className={styles['mobile-message__avatar-col']}>
          <UserAvatar src={avatarSrc} alt={avatarAlt} size='32' />
        </div>
        <div className={styles['mobile-message__content']}>
          <div className={styles['mobile-message__header']}>
            <span className={styles['mobile-message__username']}>{username}</span>
            {isBot && <Tag label={botLabel} />}
            <span className={styles['mobile-message__timestamp']}>{timestamp}</span>
          </div>
          <div className={styles['mobile-message__body']}>
            {children}
            {linkPreview != null && (
              <div className={styles['mobile-message__link-preview-slot']}>
                {linkPreview}
              </div>
            )}
            {imagePreviews != null && (
              <div className={styles['mobile-message__images-slot']}>
                {imagePreviews}
              </div>
            )}
            {footer != null && (
              <div className={styles['mobile-message__footer-slot']}>{footer}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
