import { useVideoCall } from '../videoCallContext';
import CallScene from './CallScene';
import { PhaseCrossfade } from '../components/PhaseCrossfade';
import PreJoinScene from './PreJoinScene';
import ScreenShareScene from './ScreenShareScene';

/**
 * The expanded call window. It hosts every phase (pre-join, calling, live,
 * sharing) so the lifecycle never leaves the surface the user chose.
 */
export default function CallWindowScene() {
  const { state } = useVideoCall();
  const scene =
    // Calling keeps the pre-join layout (preview and device controls stay).
    state.phase === 'pre-join' || state.phase === 'calling' ? (
      <PreJoinScene />
    ) : state.sharing ? (
      <ScreenShareScene />
    ) : (
      <CallScene />
    );
  return (
    <PhaseCrossfade
      phaseKey={state.phase === 'calling' ? 'pre-join' : state.phase}
      align="fill"
    >
      {scene}
    </PhaseCrossfade>
  );
}
