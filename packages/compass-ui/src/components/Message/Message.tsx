import React from 'react';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import MessageHeader from '@/components/MessageHeader/MessageHeader';
import MessageActions from '@/components/MessageActions/MessageActions';
import type { MessageActionsType } from '@/components/MessageActions/MessageActions';
import PinnedSavedIndicators from '@/components/PinnedSavedIndicators/PinnedSavedIndicators';
import styles from './Message.module.scss';

type MessageProps = {
  avatarSrc?: string;
  avatarAlt: string;
  username: string;
  timestamp: string;
  isBot?: boolean;
  botLabel?: string;
  /** Hover toolbar context. Default: Center Channel. */
  messageActionsType?: MessageActionsType;
  /** When false, the hover Message Actions toolbar is omitted. Default: true. */
  showMessageActions?: boolean;
  /** When true, Pinned + Saved row appears at the top of the message container. */
  showPinnedSavedIndicators?: boolean;
  /** Merged onto the root element (e.g. documentation modifiers). */
  className?: string;
  /**
   * Primary body content (e.g. message text). When using structured slots, this
   * is usually the markdown/text block only. For plain `<p>` copy, use the
   * `message__body-text` class from `Message.module.scss` so typography matches
   * the component and host shells (docs, patterns) cannot restyle bare tags.
   */
  children: React.ReactNode;
  /** Link Preview block — renders after `children`. */
  linkPreview?: React.ReactNode;
  /** Image Preview block(s) — renders after the link preview slot. */
  imagePreviews?: React.ReactNode;
  /** Trailing body content — e.g. attachments and reactions — renders last. */
  footer?: React.ReactNode;
};

export default function Message({
  avatarSrc,
  avatarAlt,
  username,
  timestamp,
  isBot = false,
  botLabel,
  messageActionsType = 'Center Channel',
  showMessageActions = true,
  showPinnedSavedIndicators = false,
  className = '',
  children,
  linkPreview,
  imagePreviews,
  footer,
}: MessageProps) {
  const rootClass = [styles.message, className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      {showPinnedSavedIndicators && (
        <div className={styles['message__pinned']}>
          <PinnedSavedIndicators />
        </div>
      )}
      <div className={styles['message__layout']}>
        <div className={styles['message__avatar-col']}>
          <UserAvatar src={avatarSrc} alt={avatarAlt} size="32" />
        </div>
        <div className={styles['message__content']}>
          <div className={styles['message__header-row']}>
            <div className={styles['message__header-block']}>
              <MessageHeader
                username={username}
                timestamp={timestamp}
                isBot={isBot}
                botLabel={botLabel}
              />
            </div>
            {showMessageActions && (
              <div className={styles['message__actions-slot']}>
                <MessageActions type={messageActionsType} />
              </div>
            )}
          </div>
          <div className={styles['message__body']}>
            {children}
            {linkPreview != null && (
              <div className={styles['message__link-preview-slot']}>
                {linkPreview}
              </div>
            )}
            {imagePreviews != null && (
              <div className={styles['message__images-slot']}>{imagePreviews}</div>
            )}
            {footer != null && (
              <div className={styles['message__footer-slot']}>{footer}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
