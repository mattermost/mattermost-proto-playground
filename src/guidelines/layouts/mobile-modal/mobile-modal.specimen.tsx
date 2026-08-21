import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import { Icon } from '@mattermost/compass-ui';
import { MobileMenuItem, MobileModal, MobileNavigationBar } from '@mattermost/compass-proto';
import DeviceFrame from '@/components/layout/DeviceFrame';
import MobileModalStage from '@/components/layout/MobileModalStage';
import styles from './mobile-modal.specimen.module.scss';

function ChannelPeek() {
  return (
    <div className={styles['mobile-modal-layout__peek']}>
      <MobileNavigationBar
        variant='Channel'
        name='UX Design'
        memberCount={32}
      />
      <div className={styles['mobile-modal-layout__peek-body']}>
        <p className={styles['mobile-modal-layout__peek-copy']}>
          Channel content behind the modal.
        </p>
      </div>
    </div>
  );
}

function SettingsContent() {
  const chevron = (
    <Icon
      size='20'
      className={styles['mobile-modal-layout__chevron']}
      glyph={<ChevronRightIcon />}
    />
  );

  return (
    <div className={styles['mobile-modal-layout__settings']}>
      <div className={styles['mobile-modal-layout__group']}>
        <MobileMenuItem
          label='Notifications'
          divider
          trailingElement
          trailingVisual={chevron}
          leadingVisual={<Icon size='20' glyph={<BellOutlineIcon />} />}
        />
        <MobileMenuItem
          label='Display'
          divider
          trailingElement
          trailingVisual={chevron}
          leadingVisual={<Icon size='20' glyph={<LayersOutlineIcon />} />}
        />
        <MobileMenuItem
          label='Advanced settings'
          divider
          trailingElement
          trailingVisual={chevron}
          leadingVisual={<Icon size='20' glyph={<CogOutlineIcon />} />}
        />
        <MobileMenuItem
          label='About Mattermost'
          divider
          trailingElement
          trailingVisual={chevron}
          leadingVisual={<Icon size='20' glyph={<InformationOutlineIcon />} />}
        />
      </div>
      <div className={styles['mobile-modal-layout__group']}>
        <button type='button' className={styles['mobile-modal-layout__link']}>
          Help
        </button>
      </div>
    </div>
  );
}

export default function MobileModalLayout() {
  return (
    <div className={styles['mobile-modal-layout']}>
      <DeviceFrame insetContent={false} statusBarStyle='light'>
        <MobileModalStage
          open
          animate={false}
          modal={
            <MobileModal title='Settings'>
              <SettingsContent />
            </MobileModal>
          }
        >
          <ChannelPeek />
        </MobileModalStage>
      </DeviceFrame>
    </div>
  );
}
