import { MobileModal } from '@mattermost/compass-proto';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import styles from './MobileModalGuidelineAnatomy.module.scss';

/**
 * Mobile Modal — anatomy preview on the shared AnatomyStage surface.
 */
export function MobileModalAnatomyStage() {
  return (
    <AnatomyStage
      style={{
        alignItems: 'stretch',
        justifyContent: 'center',
        margin: '0 auto var(--spacing-m)',
        minHeight: 420,
        padding: 'var(--spacing-xl)',
        overflow: 'hidden',
      }}
    >
      <div className={styles['mobile-modal-anatomy__frame']}>
        <MobileModal title='Settings'>
          <div className={styles['mobile-modal-anatomy__slot']}>
            Content slot
          </div>
        </MobileModal>
      </div>
    </AnatomyStage>
  );
}
