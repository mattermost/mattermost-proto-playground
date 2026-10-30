import type { ReactNode } from 'react';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import {
  ChannelHeader,
  Message,
  MessageInput,
  layoutStyles,
} from '@mattermost/compass-proto';
import VideoCallChannelShell from '../VideoCallChannelShell';
import ChannelCallPost from './ChannelCallCard';
import StartCallMenu from './StartCallMenu';
import { DM_PEER_ID, ROSTER, SELF_ID } from '../videoCallsData';

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];
const SELF = ROSTER.find((p) => p.id === SELF_ID) ?? ROSTER[0];

export interface DMChatProps {
  /** The call widget, floating bottom-left over the sidebar. */
  floating?: ReactNode;
}

/** The 1:1 chat with the DM peer. Prototype-only composition. */
export default function DMChat({ floating }: DMChatProps) {
  return (
    <VideoCallChannelShell
      header={
        <ChannelHeader
          type="dm"
          name={PEER.name}
          avatarSrc={PEER.avatarSrc}
          avatarStatus
          callButton={<StartCallMenu />}
        />
      }
      floating={floating}
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
        <ChannelCallPost />
      </div>
      <div className={layoutStyles['channel-shell__message-input']}>
        <MessageInput placeholder={`Message ${PEER.name}`} />
      </div>
    </VideoCallChannelShell>
  );
}
