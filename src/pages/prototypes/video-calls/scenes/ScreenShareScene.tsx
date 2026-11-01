import { useEffect, useRef } from 'react';
import { ShareIndicator } from '../components/ShareIndicator';
import { useVideoCall } from '../videoCallContext';
import CallWindowHost from './CallWindowHost';
import styles from './ScreenShareScene.module.scss';

/** The live capture: what you are really sharing, shown on the stage. */
function SharedScreenVideo({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      ref={ref}
      className={styles['screen-share-scene__video']}
      autoPlay
      muted
      playsInline
      aria-label="Your shared screen"
    />
  );
}

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
 * Call window in the share layout (content + filmstrip). The compact sharing pill
 * offers "Stop", which returns to the regular call layout.
 */
export default function ScreenShareScene() {
  const { state, screenShare } = useVideoCall();

  return (
    <CallWindowHost
      sharing
      shareContent={
        screenShare.stream ? (
          <SharedScreenVideo stream={screenShare.stream} />
        ) : (
          <MockSharedScreen />
        )
      }
      banner={
        <ShareIndicator
          onStop={screenShare.toggle}
          labels={
            state.shareSource
              ? { status: `You are sharing ${state.shareSource.what}` }
              : undefined
          }
        />
      }
    />
  );
}
