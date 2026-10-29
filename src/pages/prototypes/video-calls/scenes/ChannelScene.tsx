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
import { useVideoCall } from '../videoCallContext';
import { CHANNEL_NAME, ROSTER, SELF_ID } from '../videoCallsData';

const byId = (id: string) => ROSTER.find((p) => p.id === id) ?? ROSTER[0];
const SELF = byId(SELF_ID);
const SOFIA = byId('sofia');
const AIKO = byId('aiko');
const MARCO = byId('marco');
/** People already in the channel's ongoing call. */
const IN_CALL = [MARCO, SOFIA, AIKO];
/** Participant count after the user joins (the banner's three, plus self). */
const COUNT_AFTER_JOIN = IN_CALL.length + 1;

/** Channel with an ongoing call banner. Entry point for "Join call". */
export default function ChannelScene() {
  const { actions } = useVideoCall();

  const join = () => {
    actions.patch({ count: COUNT_AFTER_JOIN });
    actions.startPreJoin('join-group');
  };

  return (
    <VideoCallChannelShell
      header={
        <ChannelHeader
          type="channel"
          name={CHANNEL_NAME}
          description="Design critiques, specs and shared work."
          memberCount={24}
          pinnedCount={2}
          callButton={
            <Button
              emphasis="quaternary"
              size="small"
              leadingIcon={<Icon glyph={<VideoOutlineIcon />} />}
              onClick={join}
            >
              Join call
            </Button>
          }
        />
      }
    >
      <CallBanner
        participants={IN_CALL.map((p) => ({
          key: p.id,
          name: p.name,
          src: p.avatarSrc,
        }))}
        message={`${IN_CALL.length} people in a call`}
        meta="12:40"
        joinLabel="Join"
        onJoin={join}
      />
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
        <MessageInput placeholder={`Message ${CHANNEL_NAME}`} />
      </div>
    </VideoCallChannelShell>
  );
}
