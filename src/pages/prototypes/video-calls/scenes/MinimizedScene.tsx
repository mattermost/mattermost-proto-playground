import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChannelHeader,
  Message,
  MessageInput,
  ParticipantsPanel,
  shellStyles,
} from '@mattermost/compass-proto';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
} from '@mattermost/compass-ui/components/popover-menu';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { VideoCallWidget } from '../components/VideoCallWidget';
import { CHANNEL_NAME, CLIPS, SELF_ID } from '../videoCallsData';
import VideoCallChannelShell from '../VideoCallChannelShell';
import { useCallSession } from './useCallSession';

type Overlay = 'participants' | 'more' | null;

/**
 * Minimized call: the channel stays usable and the call lives in a floating
 * `VideoCallWidget` (bottom-left of the shell). Expand returns to `call`.
 */
export default function MinimizedScene() {
  const { state, participants, actions, elapsedLabel } = useCallSession();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOverlay(null), []);
  useOutsideClose(widgetRef, overlay !== null, close);
  useEffect(() => {
    if (overlay === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOverlay(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [overlay]);

  const toggle = (id: Exclude<Overlay, null>) =>
    setOverlay((cur) => (cur === id ? null : id));

  const widget = (
    <div ref={widgetRef}>
      <VideoCallWidget
        channelName={CHANNEL_NAME}
        elapsedLabel={elapsedLabel}
        participants={participants}
        clips={CLIPS}
        participantCount={participants.length}
        participantsOpen={overlay === 'participants'}
        onToggleParticipants={() => toggle('participants')}
        participantsPopover={
          overlay === 'participants' ? (
            <ParticipantsPanel
              variant="widget"
              participants={participants}
              currentUserId={SELF_ID}
            />
          ) : undefined
        }
        micOn={state.media.micOn}
        onToggleMic={actions.toggleMic}
        cameraOn={state.media.cameraOn}
        onToggleCamera={actions.toggleCamera}
        handRaised={state.handRaised}
        onToggleHand={actions.toggleHand}
        sharing={state.sharing}
        onToggleShare={() => {
          close();
          actions.toggleShare();
        }}
        moreOpen={overlay === 'more'}
        onToggleMore={() => toggle('more')}
        moreMenu={
          <PopoverMenu
            open={overlay === 'more'}
            role="menu"
            aria-label="More options"
          >
            <MenuItem
              label="Show call chat"
              leadingElement={false}
              onClick={() => {
                close();
                actions.go('call', { pane: 'chat' });
              }}
            />
            <MenuItem
              label={
                state.soundOn ? 'Turn call sounds off' : 'Turn call sounds on'
              }
              leadingElement={false}
              onClick={() => {
                actions.setSoundOn(!state.soundOn);
                close();
              }}
            />
            <PopoverMenuDivider />
            <MenuItem
              label="Copy call link"
              leadingElement={false}
              onClick={() => {
                actions.pushNotice({ kind: 'info', text: 'Call link copied' });
                close();
              }}
            />
          </PopoverMenu>
        }
        onExpand={() => actions.go('call')}
        onLeave={actions.leave}
      />
    </div>
  );

  return (
    <VideoCallChannelShell
      header={
        <ChannelHeader
          type="channel"
          name={CHANNEL_NAME}
          memberCount={14}
          pinnedCount={2}
        />
      }
      floating={widget}
    >
      <div className={shellStyles['channel-shell__messages']}>
        <Scrollbar>
          <div className={shellStyles['channel-shell__messages-list']}>
            <MessageSeparator type="date" label="Today" />
            <Message
              avatarSrc={avatarSofia}
              avatarAlt="Sofia Bauer"
              username="Sofia Bauer"
              timestamp="9:02 AM"
            >
              <p className={shellStyles['channel-shell__post-text']}>
                Jumping on the design review call now. The new onboarding flow
                is ready to walk through.
              </p>
            </Message>
            <Message
              avatarSrc={avatarMarco}
              avatarAlt="Marco Rinaldi"
              username="Marco Rinaldi"
              timestamp="9:14 AM"
            >
              <p className={shellStyles['channel-shell__post-text']}>
                Joining in a minute. I will keep notes in this channel so anyone
                who misses it can catch up.
              </p>
            </Message>
          </div>
        </Scrollbar>
      </div>
      <div className={shellStyles['channel-shell__message-input']}>
        <MessageInput placeholder={`Write to ${CHANNEL_NAME}`} />
      </div>
    </VideoCallChannelShell>
  );
}
