import { useCallback, useEffect, useRef, useState } from 'react';
import { ParticipantsPanel } from '@mattermost/compass-proto';
import { Button } from '@mattermost/compass-ui/components/button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
} from '@mattermost/compass-ui/components/popover-menu';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { VideoCallWidget } from '../components/VideoCallWidget';
import { useVideoCall } from '../videoCallContext';
import {
  CHANNEL_NAME,
  CLIPS,
  DM_PEER_ID,
  ROSTER,
  SELF_ID,
} from '../videoCallsData';
import { useCallSession } from './useCallSession';
import styles from './CallWidgetHost.module.scss';

type Overlay = 'participants' | 'more' | null;

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];

/**
 * TEMPORARY placeholder for the pre-join, calling and incoming widget states
 * (replaced by the widget package). Keeps the whole flow clickable end to end.
 */
function WidgetPhaseStub() {
  const { state, actions } = useVideoCall();
  const { phase } = state;
  return (
    <div className={styles['call-widget-host__stub']}>
      <p className={styles['call-widget-host__stub-title']}>
        {phase === 'pre-join' && 'Ready to start?'}
        {phase === 'calling' && `Calling ${PEER.name}…`}
        {phase === 'incoming' && `${PEER.name} is calling`}
      </p>
      <div className={styles['call-widget-host__stub-actions']}>
        {phase === 'pre-join' && (
          <>
            <Button
              emphasis="primary"
              size="small"
              onClick={actions.confirmPreJoin}
            >
              Start call
            </Button>
            <Button emphasis="tertiary" size="small" onClick={actions.expand}>
              Expand
            </Button>
            <Button
              emphasis="tertiary"
              size="small"
              onClick={actions.cancelCall}
            >
              Cancel
            </Button>
          </>
        )}
        {phase === 'calling' && (
          <>
            <Button emphasis="tertiary" size="small" onClick={actions.expand}>
              Expand
            </Button>
            <Button
              emphasis="tertiary"
              size="small"
              onClick={actions.cancelCall}
            >
              Cancel
            </Button>
          </>
        )}
        {phase === 'incoming' && (
          <>
            <Button
              emphasis="primary"
              size="small"
              onClick={() => actions.accept()}
            >
              Accept
            </Button>
            <Button emphasis="tertiary" size="small" onClick={actions.decline}>
              Decline
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The call widget (bottom-left over the sidebar): hosts every phase on the
 * widget surface. The active phase is the full video widget.
 */
export default function CallWidgetHost() {
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

  if (state.phase !== 'active') return <WidgetPhaseStub />;

  const toggle = (id: Exclude<Overlay, null>) =>
    setOverlay((cur) => (cur === id ? null : id));

  return (
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
                actions.expand();
                actions.togglePane('chat');
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
        onExpand={actions.expand}
        onLeave={actions.leave}
      />
    </div>
  );
}
