import { ChannelHeader } from '@mattermost/compass-ui';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import styles from './ChannelHeaderGuidelineAnatomy.module.scss';

/**
 * Channel Header pattern — anatomy preview on the shared AnatomyStage surface.
 */
export function ChannelHeaderAnatomyStage() {
  return (
    <AnatomyStage
      style={{
        alignItems: 'stretch',
        justifyContent: 'center',
      }}
    >
      <div className={styles['channel-header-anatomy__strip']}>
        <ChannelHeader
          type="Channel"
          name="UX Design"
          memberCount={48}
          pinnedCount={3}
          description="Design critiques, specs, and Compass references."
        />
      </div>
    </AnatomyStage>
  );
}
