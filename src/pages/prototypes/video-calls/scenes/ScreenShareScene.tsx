import { SectionNotice } from '@mattermost/compass-ui/components/section-notice';
import { useVideoCall } from '../videoCallContext';
import CallWindowHost from './CallWindowHost';
import styles from './ScreenShareScene.module.scss';

/** Prototype-only stand-in for a captured screen: a stylized slide, not a real capture. */
function MockSharedScreen() {
  return (
    <div className={styles['screen-share-scene__screen']} aria-hidden>
      <div className={styles['screen-share-scene__chrome']}>
        <span className={styles['screen-share-scene__dot']} />
        <span className={styles['screen-share-scene__dot']} />
        <span className={styles['screen-share-scene__dot']} />
        <span className={styles['screen-share-scene__address']} />
      </div>
      <div className={styles['screen-share-scene__slide']}>
        <p className={styles['screen-share-scene__eyebrow']}>Design review</p>
        <h3 className={styles['screen-share-scene__heading']}>
          Onboarding redesign
        </h3>
        <div className={styles['screen-share-scene__columns']}>
          <div className={styles['screen-share-scene__card']}>
            <span className={styles['screen-share-scene__bar']} />
            <span className={styles['screen-share-scene__bar']} />
            <span className={styles['screen-share-scene__bar--short']} />
          </div>
          <div className={styles['screen-share-scene__card']}>
            <span className={styles['screen-share-scene__bar']} />
            <span className={styles['screen-share-scene__bar--short']} />
            <span className={styles['screen-share-scene__bar']} />
          </div>
          <div className={styles['screen-share-scene__card']}>
            <span className={styles['screen-share-scene__bar--short']} />
            <span className={styles['screen-share-scene__bar']} />
            <span className={styles['screen-share-scene__bar']} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Call window in the share layout (content + filmstrip). The sharing banner
 * offers "Stop sharing", which returns to the regular call layout.
 */
export default function ScreenShareScene() {
  const { actions } = useVideoCall();

  return (
    <CallWindowHost
      sharing
      shareContent={<MockSharedScreen />}
      banner={
        <SectionNotice
          type="info"
          title="You are sharing your screen"
          primaryButtonLabel="Stop sharing"
          onPrimaryAction={actions.toggleShare}
          className={styles['screen-share-scene__banner']}
        />
      }
    />
  );
}
