import SendIcon from '@mattermost/compass-icons/components/send';
import { Icon } from '@mattermost/compass-ui';
import { MobileModalNavigationBar } from '@mattermost/compass-proto';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import styles from './MobileModalNavigationBarGuidelineAnatomy.module.scss';

/**
 * Mobile Modal Navigation Bar — anatomy preview on the shared AnatomyStage surface.
 */
export function MobileModalNavigationBarAnatomyStage() {
  return (
    <AnatomyStage
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className={styles['mobile-modal-navigation-bar-anatomy__frame']}>
        <MobileModalNavigationBar
          variant='Child'
          title='Modal'
          subtitle='UX Design'
          actionLabel='Action'
          trailingIcon={<Icon size='20' glyph={<SendIcon />} />}
        />
      </div>
    </AnatomyStage>
  );
}
