import { Button } from '@mattermost/compass-ui/components/button';
import { UserAvatarGroup } from '@mattermost/compass-ui/components/user-avatar-group';
import { useVideoCall } from '../videoCallContext';
import DMChat from './DMChat';
import { describePeople, formatDuration } from './callCopy';
import styles from './EndedScene.module.scss';

/** Call summary over the DM. Back to chat or rejoin. */
export default function EndedScene() {
  const { state, participants, actions } = useVideoCall();
  const others = participants.filter((p) => !p.self);

  return (
    <DMChat
      overlay={
        <div
          className={styles['ended-scene']}
          role="dialog"
          aria-label="Call ended"
        >
          <div className={styles['ended-scene__text']}>
            <h2 className={styles['ended-scene__title']}>Call ended</h2>
            <p className={styles['ended-scene__duration']}>
              {formatDuration(state.endedDurationSec)}
            </p>
          </div>
          <div className={styles['ended-scene__people']}>
            <UserAvatarGroup
              size="40"
              max={5}
              avatars={participants.map((p) => ({
                key: p.id,
                name: p.name,
                src: p.avatarSrc,
              }))}
            />
            <p className={styles['ended-scene__names']}>
              With {describePeople(others.map((p) => p.name))}
            </p>
          </div>
          <div className={styles['ended-scene__actions']}>
            <Button emphasis="primary" onClick={() => actions.go('dm')}>
              Back to chat
            </Button>
            <Button
              emphasis="secondary"
              onClick={() => actions.startPreJoin('start')}
            >
              Rejoin
            </Button>
          </div>
        </div>
      }
    />
  );
}
