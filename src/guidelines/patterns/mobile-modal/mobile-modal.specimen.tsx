import type { ReactNode} from 'react';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import {
  Icon } from '@mattermost/compass-ui';
import { MobileMenuItem, MobileModal, MobileNavigationBar } from '@mattermost/compass-proto';
import DeviceFrame from '@/components/layout/DeviceFrame';
import MobileModalStage from '@/components/layout/MobileModalStage';
import styles from './mobile-modal.specimen.module.scss';

function Stage({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className={styles['mobile-modal-specimen__stage']}>
      <p className={styles['mobile-modal-specimen__label']}>{label}</p>
      {children}
    </div>
  );
}

function PreviousView() {
  return (
    <div className={styles['mobile-modal-specimen__previous']}>
      <MobileNavigationBar
        variant='Channel'
        name='UX Design'
        memberCount={32}
      />
      <div className={styles['mobile-modal-specimen__previous-body']}>
        <p className={styles['mobile-modal-specimen__previous-copy']}>
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
      className={styles['mobile-modal-specimen__chevron']}
      glyph={<ChevronRightIcon />}
    />
  );

  return (
    <div className={styles['mobile-modal-specimen__settings']}>
      <div className={styles['mobile-modal-specimen__group']}>
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
      <div className={styles['mobile-modal-specimen__group']}>
        <button type='button' className={styles['mobile-modal-specimen__link']}>
          Help
        </button>
      </div>
    </div>
  );
}

function PlaceholderContent() {
  return (
    <div className={styles['mobile-modal-specimen__placeholder']}>
      <Icon size='24' glyph={<FormatListBulletedIcon />} />
      <p className={styles['mobile-modal-specimen__placeholder-text']}>
        Content slot — place any modal body here.
      </p>
    </div>
  );
}

export default function MobileModalLibrary() {
  return (
    <div className={styles['mobile-modal-specimen']}>
      <Stage label='Settings (content slot example)'>
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
            <PreviousView />
          </MobileModalStage>
        </DeviceFrame>
      </Stage>

      <Stage label='Child — subtitle'>
        <DeviceFrame insetContent={false} statusBarStyle='light'>
          <MobileModalStage
            open
            animate={false}
            modal={
              <MobileModal
                variant='Child'
                title='Notifications'
                subtitle='Settings'
              >
                <PlaceholderContent />
              </MobileModal>
            }
          >
            <PreviousView />
          </MobileModalStage>
        </DeviceFrame>
      </Stage>
    </div>
  );
}
