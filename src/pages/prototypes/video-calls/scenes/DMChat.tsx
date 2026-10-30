import type { ReactNode } from 'react';
import {
  ChannelHeader,
  MessageInput,
  layoutStyles,
} from '@mattermost/compass-proto';
import VideoCallChannelShell from '../VideoCallChannelShell';
import ChatThread from './ChatThread';
import { DM_POSTS } from './chatSamplesData';
import StartCallMenu from './StartCallMenu';
import { DM_PEER_ID, ROSTER } from '../videoCallsData';

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];

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
      <ChatThread posts={DM_POSTS} callPostAtEnd />
      <div className={layoutStyles['channel-shell__message-input']}>
        <MessageInput placeholder={`Message ${PEER.name}`} />
      </div>
    </VideoCallChannelShell>
  );
}
