import { useEffect } from 'react';
import { IncomingCallCard } from '../components/IncomingCallCard';
import { playSound, setSoundsEnabled, stopSound } from '../callSounds';
import { useVideoCall } from '../videoCallContext';
import { DM_PEER_ID, ROSTER } from '../videoCallsData';
import DMChat from './DMChat';

const CALLER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];
const RING_TIMEOUT_MS = 25000;

/** Incoming 1:1 call over the DM. Accept goes to pre-join; no answer becomes a missed call. */
export default function RingingInScene() {
  const { state, actions } = useVideoCall();
  const { soundOn } = state;
  const { missIncoming, startPreJoin, declineIncoming, setMedia } = actions;

  useEffect(() => {
    const timer = window.setTimeout(missIncoming, RING_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [missIncoming]);

  useEffect(() => {
    setSoundsEnabled(soundOn);
    playSound('ring-incoming', { loop: true });
    return () => stopSound('ring-incoming');
  }, [soundOn]);

  return (
    <DMChat
      overlayPlacement="top-right"
      overlay={
        <IncomingCallCard
          callerName={CALLER.name}
          callerAvatarSrc={CALLER.avatarSrc}
          onAccept={() => startPreJoin('accept')}
          onAcceptAudio={() => {
            setMedia({ cameraOn: false });
            startPreJoin('accept');
          }}
          onDecline={declineIncoming}
        />
      }
    />
  );
}
