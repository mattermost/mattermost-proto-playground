import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import {Icon, MobileMenuItem, MobileModal} from '@mattermost/compass-ui';
import styles from '../MobileHomeChannel.module.scss';

type ModalSceneProps = {
  onClose: () => void;
};

export default function ModalScene({onClose}: ModalSceneProps) {
  const chevron = (
    <Icon
      size='20'
      className={styles['mobile-home-channel__modal-chevron']}
      glyph={<ChevronRightIcon />}
    />
  );

  return (
    <MobileModal title='Channel info' onCloseClick={onClose}>
      <div className={styles['mobile-home-channel__modal-body']}>
        <MobileMenuItem
          label='Notification Preferences'
          divider
          trailingElement
          trailingVisual={chevron}
          leadingVisual={<Icon size='20' glyph={<BellOutlineIcon />} />}
        />
        <MobileMenuItem
          label='Channel Settings'
          divider
          trailingElement
          trailingVisual={chevron}
          leadingVisual={<Icon size='20' glyph={<CogOutlineIcon />} />}
        />
        <MobileMenuItem
          label='View Info'
          trailingElement
          trailingVisual={chevron}
          leadingVisual={<Icon size='20' glyph={<InformationOutlineIcon />} />}
        />
      </div>
    </MobileModal>
  );
}
