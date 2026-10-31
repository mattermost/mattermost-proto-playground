import { useState, type ReactNode } from 'react';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import {
  ChannelHeader,
  MessageInput,
  layoutStyles,
} from '@mattermost/compass-proto';
import { CallBanner } from '../components/CallBanner';
import VideoCallChannelShell from '../VideoCallChannelShell';
import ChatThread from './ChatThread';
import { GROUP_POSTS } from './chatSamplesData';
import styles from './GroupChat.module.scss';
import StartCallMenu from './StartCallMenu';
import { useVideoCall } from '../videoCallContext';
import { CHANNEL_NAME, ROSTER } from '../videoCallsData';

/** Matches `--duration-quick` (the banner's slide-off). */
const BANNER_EXIT_MS = 150;

export interface GroupChatProps {
  kind: 'gm' | 'channel';
  /** The call widget, floating bottom-left over the sidebar. */
  floating?: ReactNode;
}

/**
 * Group DM or channel. While nobody (including you) is in the call, an ongoing
 * call banner invites you to join; the participant-count control sets how many
 * people are in it.
 */
export default function GroupChat({ kind, floating }: GroupChatProps) {
  const { state, actions } = useVideoCall();
  const others = ROSTER.slice(1, state.count);
  const ongoing = state.phase === 'idle';
  // The banner can be closed; it comes back with the next conversation.
  const [bannerDismissed, setBannerDismissed] = useState(false);
  // Stays mounted through its slide-off after a dismiss or when you join.
  const banner = useExitAnimation(ongoing && !bannerDismissed, BANNER_EXIT_MS);
  // A group DM only has its own members; a channel shows everyone.
  const allowed =
    kind === 'gm' ? ROSTER.slice(0, state.count).map((p) => p.id) : undefined;
  const chatName =
    kind === 'gm'
      ? others
          .slice(0, 3)
          .map((p) => p.name.split(' ')[0])
          .join(', ')
      : CHANNEL_NAME;

  return (
    <VideoCallChannelShell
      floating={floating}
      header={
        <>
          <ChannelHeader
            type={kind}
            name={chatName}
            description={
              kind === 'channel'
                ? 'Design critiques, specs and shared work.'
                : ''
            }
            memberCount={kind === 'gm' ? state.count : 24}
            pinnedCount={kind === 'channel' ? 2 : undefined}
            callButton={
              ongoing ? (
                <Button
                  emphasis="quaternary"
                  size="small"
                  leadingIcon={<Icon glyph={<VideoOutlineIcon />} />}
                  onClick={() => actions.startCall()}
                >
                  Join call
                </Button>
              ) : (
                <StartCallMenu />
              )
            }
          />
          {banner.rendered && (
            <div
              className={[
                styles['group-chat__banner-anchor'],
                banner.exiting && styles['group-chat__banner-anchor--exiting'],
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <CallBanner
                message={`${others.length} ${
                  others.length === 1 ? 'person' : 'people'
                } in a call`}
                meta="12:40"
                joinLabel="Join"
                onJoin={() => actions.startCall()}
                onDismiss={() => setBannerDismissed(true)}
              />
            </div>
          )}
        </>
      }
    >
      <ChatThread posts={GROUP_POSTS} allowedAuthors={allowed} />
      <div className={layoutStyles['channel-shell__message-input']}>
        <MessageInput placeholder={`Message ${chatName}`} />
      </div>
    </VideoCallChannelShell>
  );
}
