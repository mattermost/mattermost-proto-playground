import { Button } from '@mattermost/compass-ui/components/button';
import { useVideoCall } from '../videoCallContext';
import { DM_PEER_ID, ROSTER } from '../videoCallsData';
import CallScene from './CallScene';
import PreJoinScene from './PreJoinScene';
import ScreenShareScene from './ScreenShareScene';
import styles from './CallWindowScene.module.scss';

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];

/**
 * TEMPORARY placeholder for the expanded "calling" state (replaced by the
 * window package). Keeps the flow clickable end to end.
 */
function CallingWindowStub() {
  const { actions } = useVideoCall();
  return (
    <div className={styles['call-window-scene__stub']}>
      <p className={styles['call-window-scene__stub-title']}>
        Calling {PEER.name}…
      </p>
      <div className={styles['call-window-scene__stub-actions']}>
        <Button emphasis="tertiary" onClick={actions.collapse}>
          Collapse
        </Button>
        <Button emphasis="tertiary" onClick={actions.cancelCall}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/**
 * The expanded call window. It hosts every phase (pre-join, calling, live,
 * sharing) so the lifecycle never leaves the surface the user chose.
 */
export default function CallWindowScene() {
  const { state } = useVideoCall();
  if (state.phase === 'pre-join') return <PreJoinScene />;
  if (state.phase === 'calling') return <CallingWindowStub />;
  return state.sharing ? <ScreenShareScene /> : <CallScene />;
}
