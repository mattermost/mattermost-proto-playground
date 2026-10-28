import { useEffect, useMemo, type ComponentType } from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { useWalkthrough } from '@/walkthrough';
import { SCENES, type SceneId } from './videoCalls.scenes';
import { useVideoCallState } from './useVideoCallState';
import { VideoCallContext } from './videoCallContext';
import DMScene from './scenes/DMScene';
import ChannelScene from './scenes/ChannelScene';
import PreJoinScene from './scenes/PreJoinScene';
import RingingOutScene from './scenes/RingingOutScene';
import RingingInScene from './scenes/RingingInScene';
import CallScene from './scenes/CallScene';
import MinimizedScene from './scenes/MinimizedScene';
import ScreenShareScene from './scenes/ScreenShareScene';
import EndedScene from './scenes/EndedScene';
import styles from './VideoCalls.module.scss';

const SCENE_COMPONENTS: Record<SceneId, ComponentType> = {
  dm: DMScene,
  channel: ChannelScene,
  'pre-join': PreJoinScene,
  'ringing-out': RingingOutScene,
  'ringing-in': RingingInScene,
  call: CallScene,
  minimized: MinimizedScene,
  'screen-share': ScreenShareScene,
  ended: EndedScene,
};

export default function VideoCalls() {
  const { setCenterSlot } = usePrototypeChrome();
  const { active: walkthroughActive } = useWalkthrough();
  const { state, participants, actions } = useVideoCallState();
  const { scene } = state;

  useEffect(() => {
    if (walkthroughActive) {
      setCenterSlot(null);
      return () => setCenterSlot(null);
    }
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={scene}
        onChange={(id) => actions.go(id as SceneId)}
        ariaLabel="Prototype entry points"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, actions, setCenterSlot, walkthroughActive]);

  const value = useMemo(
    () => ({ state, participants, actions }),
    [state, participants, actions],
  );

  const Scene = SCENE_COMPONENTS[scene];

  return (
    <VideoCallContext.Provider value={value}>
      <div className={styles['video-calls']}>
        <div className={styles['video-calls__frame']}>
          <Scene />
        </div>
      </div>
    </VideoCallContext.Provider>
  );
}
