import type { ReactNode } from 'react';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import MessageHeader from '@/components/ui/MessageHeader/MessageHeader';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import PBEChannelHeader from './PBEChannelHeader';
import PBEComposer from './PBEComposer';
import {
  pbeMessages,
  systemMessage,
  type PBEMessage,
} from '../shared/fixtures';
import styles from './PBEChannelSurface.module.scss';

export interface PBEChannelSurfaceProps {
  /** Channel display name used in the header + composer placeholder. */
  channelName?: string;
  /** Show the Encryption Details pill in the channel header. */
  showEncryptionDetailsLink?: boolean;
  /** Render the Encryption Details pill in its pressed state. */
  encryptionDetailsActive?: boolean;
  /** Click handler for the Encryption Details pill. */
  onEncryptionDetailsClick?: () => void;
  /** Click handler for the channel-info icon button. */
  onInfoClick?: () => void;
  /** Toggled state of the info icon button. */
  infoToggled?: boolean;
  /** Optional overlay (e.g. Create Channel modal) rendered inside the center surface. */
  overlay?: ReactNode;
  /** Hide the leading system message. Default: false. */
  hideSystemMessage?: boolean;
  /** Messages to render. Defaults to the fixtures PBE thread. */
  messages?: PBEMessage[];
}

function PBEPost({ msg }: { msg: PBEMessage }) {
  return (
    <div className={styles['pbe-channel-surface__post']}>
      <div className={styles['pbe-channel-surface__post-avatar-col']}>
        <UserAvatar src={msg.avatarSrc} alt={msg.username} size="32" status />
      </div>
      <div className={styles['pbe-channel-surface__post-content']}>
        <div className={styles['pbe-channel-surface__post-header-row']}>
          <MessageHeader username={msg.username} timestamp={msg.timestamp} />
          <span
            className={styles['pbe-channel-surface__post-shield']}
            aria-hidden
          >
            <ShieldOutlineIcon size={12} />
          </span>
          {msg.isEM && (
            <LabelTag label="EM" type="Info Dim" casing="All Caps" />
          )}
        </div>
        <div className={styles['pbe-channel-surface__post-body']}>
          {msg.text}
        </div>
      </div>
    </div>
  );
}

/**
 * Combined channel header + posts area + composer used by every
 * in-channel state (and as the chrome background for EM modal states).
 *
 * Posts are rendered page-locally because PBE messages carry a shield
 * indicator span and optional EM badge that the dest `Message` component
 * doesn't expose.
 */
export default function PBEChannelSurface({
  channelName = 'operations-alpha',
  showEncryptionDetailsLink = false,
  encryptionDetailsActive = false,
  onEncryptionDetailsClick,
  onInfoClick,
  infoToggled = false,
  overlay,
  hideSystemMessage = false,
  messages = pbeMessages,
}: PBEChannelSurfaceProps) {
  return (
    <div className={styles['pbe-channel-surface']}>
      <PBEChannelHeader
        channelName={channelName}
        showEncryptionDetails={showEncryptionDetailsLink}
        encryptionDetailsActive={encryptionDetailsActive}
        onEncryptionDetailsClick={onEncryptionDetailsClick}
        onInfoClick={onInfoClick}
        infoToggled={infoToggled}
      />
      <div className={styles['pbe-channel-surface__body']}>
        <div className={styles['pbe-channel-surface__feed']}>
          {!hideSystemMessage && (
            <div className={styles['pbe-channel-surface__system']}>
              <ShieldOutlineIcon size={14} aria-hidden />
              <span className={styles['pbe-channel-surface__system-label']}>
                {systemMessage}
              </span>
            </div>
          )}
          <MessageSeparator type="Date" label="Today" />
          <div className={styles['pbe-channel-surface__posts']}>
            {messages.map((msg) => (
              <PBEPost key={msg.id} msg={msg} />
            ))}
          </div>
        </div>
        <PBEComposer channelName={channelName} />
      </div>
      {overlay}
    </div>
  );
}
