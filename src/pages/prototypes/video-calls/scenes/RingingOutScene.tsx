import { useEffect } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { playSound, setSoundsEnabled, stopSound } from '../callSounds';
import { useVideoCall } from '../videoCallContext';
import { DM_PEER_ID, ROSTER } from '../videoCallsData';
import DMChat from './DMChat';
import styles from './RingingOutScene.module.scss';

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];
const AUTO_CONNECT_MS = 6000;

/** Outgoing 1:1 call. Rings, then auto-connects. Cancel returns to the DM. */
export default function RingingOutScene() {
  const { state, actions } = useVideoCall();
  const { soundOn } = state;
  const { connect, go } = actions;

  useEffect(() => {
    const timer = window.setTimeout(connect, AUTO_CONNECT_MS);
    return () => window.clearTimeout(timer);
  }, [connect]);

  useEffect(() => {
    setSoundsEnabled(soundOn);
    playSound('ring-outgoing', { loop: true });
    return () => stopSound('ring-outgoing');
  }, [soundOn]);

  const first = PEER.name.split(' ')[0];

  return (
    <DMChat
      overlay={
        <div
          className={styles['ringing-out-scene']}
          role="dialog"
          aria-label={`Calling ${PEER.name}`}
        >
          <span className={styles['ringing-out-scene__avatar']}>
            <UserAvatar
              src={PEER.avatarSrc}
              alt=""
              name={PEER.name}
              size="96"
            />
          </span>
          <div className={styles['ringing-out-scene__text']}>
            <p className={styles['ringing-out-scene__title']}>
              Calling {first}…
            </p>
            <p className={styles['ringing-out-scene__subtitle']} role="status">
              Waiting for {first} to answer
            </p>
          </div>
          <Button emphasis="secondary" onClick={() => go('dm')}>
            Cancel
          </Button>
        </div>
      }
    />
  );
}
