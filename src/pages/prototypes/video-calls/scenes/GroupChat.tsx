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
import { CallBanner } from '../components/CallBanner';
import VideoCallChannelShell from '../VideoCallChannelShell';
import ChannelCallPost from './ChannelCallCard';
import styles from './GroupChat.module.scss';
import StartCallMenu from './StartCallMenu';
import { useVideoCall } from '../videoCallContext';
import { CHANNEL_NAME, ROSTER, SELF_ID } from '../videoCallsData';

const byId = (id: string) => ROSTER.find((p) => p.id === id) ?? ROSTER[0];
const SELF = byId(SELF_ID);
const SOFIA = byId('sofia');
const MARCO = byId('marco');

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
          {ongoing && (
            <div className={styles['group-chat__banner-anchor']}>
              <CallBanner
                participants={others.slice(0, 3).map((p) => ({
                  key: p.id,
                  name: p.name,
                  src: p.avatarSrc,
                }))}
                message={`${others.length} ${
                  others.length === 1 ? 'person' : 'people'
                } in a call`}
                meta="12:40"
                joinLabel="Join"
                onJoin={() => actions.startCall()}
              />
            </div>
          )}
        </>
      }
    >
      <div className={layoutStyles['channel-shell__messages']}>
        <MessageSeparator type="date" label="Today" />
        <Message
          avatarSrc={SOFIA.avatarSrc}
          avatarAlt={SOFIA.name}
          username={SOFIA.name}
          timestamp="10:02 AM"
        >
          <p className={layoutStyles['channel-shell__post-text']}>
            Starting the weekly design critique now. Hop in if you want to walk
            through the new onboarding screens.
          </p>
        </Message>
        <ChannelCallPost />
        <Message
          avatarSrc={MARCO.avatarSrc}
          avatarAlt={MARCO.name}
          username={MARCO.name}
          timestamp="10:04 AM"
        >
          <p className={layoutStyles['channel-shell__post-text']}>
            I have the latest prototype open, sharing in a minute.
          </p>
        </Message>
        <Message
          avatarSrc={SELF.avatarSrc}
          avatarAlt={SELF.name}
          username={SELF.name}
          timestamp="10:06 AM"
        >
          <p className={layoutStyles['channel-shell__post-text']}>
            Finishing something up, I will join shortly.
          </p>
        </Message>
      </div>
      <div className={layoutStyles['channel-shell__message-input']}>
        <MessageInput placeholder={`Message ${chatName}`} />
      </div>
    </VideoCallChannelShell>
  );
}
