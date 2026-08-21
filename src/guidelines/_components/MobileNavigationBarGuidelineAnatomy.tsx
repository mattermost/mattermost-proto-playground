import { MobileNavigationBar } from '@mattermost/compass-proto';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import styles from './MobileNavigationBarGuidelineAnatomy.module.scss';

/**
 * Mobile Navigation Bar — anatomy preview on the shared AnatomyStage surface.
 */
export function MobileNavigationBarAnatomyStage() {
  return (
    <AnatomyStage
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className={styles['mobile-navigation-bar-anatomy__frame']}>
        <MobileNavigationBar
          variant='Channel'
          name='UX Design'
          memberCount={32}
          mentionCount={1}
        />
      </div>
    </AnatomyStage>
  );
}
