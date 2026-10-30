import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import { Message } from '@mattermost/compass-proto';
import { CallCard, type CallCardProps } from '../components/CallCard';
import { formatCallDuration } from '../hooks/useCallTimer';
import { useVideoCall } from '../videoCallContext';
import { DM_PEER_ID, ROSTER, SELF_ID } from '../videoCallsData';

const byId = (id: string) => ROSTER.find((p) => p.id === id) ?? ROSTER[0];

const clock = (ms: number) =>
  new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

interface CallPostModel {
  /** Who the post is from. */
  authorId: string;
  timestamp: string;
  card: CallCardProps;
}

/**
 * The call post for the current conversation in whichever Figma Call Card
 * state fits. In a DM it appears the moment a call starts (you're calling, or
 * someone is calling you), becomes Active + Joined (Leave) once you're in, and
 * ends as "Call ended" with the duration. In a group / channel the running
 * call's post is always there: Active (Join call) until you're in it, then
 * Joined. Returns null when there is no call to show.
 */
function useCallPost(): CallPostModel | null {
  const { state, actions } = useVideoCall();
  const { callContext, phase } = state;
  const inCall = phase === 'calling' || phase === 'active';

  const people = (joined: boolean) =>
    ROSTER.slice(0, state.count)
      .filter((p) => joined || p.id !== SELF_ID)
      .map((p) => ({ key: p.id, name: p.name, src: p.avatarSrc }));

  if (callContext !== 'dm') {
    // Someone else started it; it is already running when you open the channel.
    const starter = byId('sofia');
    return {
      authorId: starter.id,
      timestamp: '10:03 AM',
      card: inCall
        ? {
            state: 'joined',
            title: 'Call started',
            meta: `3 minutes ago by ${starter.name}`,
            participants: people(true),
            onLeave: actions.leave,
          }
        : {
            state: 'active',
            title: 'Call started',
            meta: `3 minutes ago by ${starter.name}`,
            participants: people(false),
            onJoin: phase === 'idle' ? () => actions.startCall() : undefined,
          },
    };
  }

  const caller = byId(state.callerId);
  const now = clock(Date.now());

  if (phase === 'calling') {
    return {
      authorId: caller.id,
      timestamp: now,
      card: {
        state: 'calling',
        title: `Calling ${byId(DM_PEER_ID).name}…`,
        meta: 'Waiting for them to answer',
        onCancel: actions.cancelCall,
      },
    };
  }

  if (inCall) {
    return {
      authorId: caller.id,
      timestamp: now,
      card: {
        state: 'joined',
        title: 'Call started',
        meta: `just now by ${caller.name}`,
        participants: people(true),
        onLeave: actions.leave,
      },
    };
  }

  if (phase === 'incoming') {
    return {
      authorId: caller.id,
      timestamp: now,
      card: {
        state: 'active',
        title: 'Call started',
        meta: `just now by ${caller.name}`,
        participants: people(false),
        onJoin: () => actions.accept(),
      },
    };
  }

  if (phase === 'idle' && state.missedCall) {
    return {
      authorId: DM_PEER_ID,
      timestamp: now,
      card: {
        state: 'ended',
        title: 'Missed call',
        meta: `${byId(DM_PEER_ID).name} · ${now}`,
        trailing: (
          <Button
            emphasis="tertiary"
            size="small"
            leadingIcon={<Icon glyph={<PhoneIcon />} />}
            onClick={() => actions.startCall()}
          >
            Call back
          </Button>
        ),
      },
    };
  }

  if (phase === 'idle' && state.endedDurationSec > 0 && state.endedAt) {
    return {
      authorId: caller.id,
      timestamp: clock(state.endedAt),
      card: {
        state: 'ended',
        title: 'Call ended',
        meta: `Ended at ${clock(state.endedAt)} · Lasted ${formatCallDuration(
          state.endedDurationSec,
        )}`,
        recordingLabel:
          state.recordingsMade > 0
            ? `${state.recordingsMade} ${
                state.recordingsMade === 1 ? 'recording' : 'recordings'
              }`
            : undefined,
      },
    };
  }

  return null;
}

/** The call post (author row + Call Card) in the message list; null when no call. */
export default function ChannelCallPost() {
  const post = useCallPost();
  if (!post) return null;
  const author = byId(post.authorId);
  return (
    <Message
      avatarSrc={author.avatarSrc}
      avatarAlt={author.name}
      username={author.name}
      timestamp={post.timestamp}
    >
      <CallCard {...post.card} />
    </Message>
  );
}
