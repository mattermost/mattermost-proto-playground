import type { ReactNode } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import {
  ChannelHeader,
  Message,
  MessageInput,
  layoutStyles,
} from '@mattermost/compass-proto';
import VideoCallChannelShell from '../VideoCallChannelShell';
import { useVideoCall } from '../videoCallContext';
import { DM_PEER_ID, ROSTER, SELF_ID } from '../videoCallsData';
import { formatDuration } from './callCopy';
import styles from './DMChat.module.scss';

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];
const SELF = ROSTER.find((p) => p.id === SELF_ID) ?? ROSTER[0];

function CallPost({
  tone,
  title,
  meta,
  action,
}: {
  tone: 'missed' | 'ended';
  title: string;
  meta: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles['dm-chat__call-post']}>
      <span
        className={`${styles['dm-chat__call-post-icon']} ${
          tone === 'missed' ? styles['dm-chat__call-post-icon--missed'] : ''
        }`}
        aria-hidden="true"
      >
        <Icon glyph={<VideoOutlineIcon />} size="20" />
      </span>
      <div className={styles['dm-chat__call-post-text']}>
        <p className={styles['dm-chat__call-post-title']}>{title}</p>
        <p className={styles['dm-chat__call-post-meta']}>{meta}</p>
      </div>
      {action}
    </div>
  );
}

export interface DMChatProps {
  /** Card shown over the whole shell (calling, incoming, ended). */
  overlay?: ReactNode;
  overlayPlacement?: 'center' | 'top-right';
}

/**
 * The 1:1 chat with the DM peer, shared by the dm scene and the scenes that
 * dim it (calling, incoming, ended). Prototype-only composition.
 */
export default function DMChat({
  overlay,
  overlayPlacement = 'center',
}: DMChatProps) {
  const { state, actions } = useVideoCall();

  return (
    <VideoCallChannelShell
      header={
        <ChannelHeader
          type="dm"
          name={PEER.name}
          avatarSrc={PEER.avatarSrc}
          avatarStatus
          callButton={
            <Button
              emphasis="quaternary"
              size="small"
              leadingIcon={<Icon glyph={<VideoOutlineIcon />} />}
              onClick={() => actions.startPreJoin('start')}
            >
              Start video call
            </Button>
          }
        />
      }
      overlay={
        overlay ? (
          <div
            className={`${styles['dm-chat__scrim']} ${
              styles[`dm-chat__scrim--${overlayPlacement}`]
            }`}
          >
            {overlay}
          </div>
        ) : undefined
      }
    >
      <div className={layoutStyles['channel-shell__messages']}>
        <MessageSeparator type="date" label="Today" />
        <Message
          avatarSrc={PEER.avatarSrc}
          avatarAlt={PEER.name}
          username={PEER.name}
          timestamp="10:12 AM"
        >
          <p className={layoutStyles['channel-shell__post-text']}>
            Morning! I updated the onboarding flow with your comments.
          </p>
        </Message>
        <Message
          avatarSrc={SELF.avatarSrc}
          avatarAlt={SELF.name}
          username={SELF.name}
          timestamp="10:15 AM"
        >
          <p className={layoutStyles['channel-shell__post-text']}>
            Thanks, looking now. The new empty state is much clearer.
          </p>
        </Message>
        <Message
          avatarSrc={PEER.avatarSrc}
          avatarAlt={PEER.name}
          username={PEER.name}
          timestamp="10:16 AM"
        >
          <p className={layoutStyles['channel-shell__post-text']}>
            Great. Can we go through step three together? Easier to show than to
            type.
          </p>
        </Message>
        {state.missedCall && (
          <CallPost
            tone="missed"
            title="Missed call"
            meta={`${PEER.name} · 10:41 AM`}
            action={
              <Button
                emphasis="tertiary"
                size="small"
                leadingIcon={<Icon glyph={<VideoOutlineIcon />} />}
                onClick={() => actions.startPreJoin('start')}
              >
                Call back
              </Button>
            }
          />
        )}
        {state.endedDurationSec > 0 && (
          <CallPost
            tone="ended"
            title={`Call ended · ${formatDuration(state.endedDurationSec)}`}
            meta={`Video call with ${PEER.name}`}
          />
        )}
      </div>
      <div className={layoutStyles['channel-shell__message-input']}>
        <MessageInput placeholder={`Message ${PEER.name}`} />
      </div>
    </VideoCallChannelShell>
  );
}
