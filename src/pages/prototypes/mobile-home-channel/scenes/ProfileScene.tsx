import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import ExitToAppIcon from '@mattermost/compass-icons/components/exit-to-app';
import { Icon, Scrollbar } from '@mattermost/compass-ui';
import { MobileMenuItem, MobileProfile } from '@mattermost/compass-proto';
import {avatars} from '../mobileHomeChannelData';
import styles from '../MobileHomeChannel.module.scss';

export default function ProfileScene() {
  return (
    <MobileProfile
      avatarSrc={avatars.leonard}
      avatarAlt='Leonard Riley'
      displayName='Leonard Riley'
      username='@leonard.riley'
    >
      <Scrollbar>
        <div className={styles['mobile-home-channel__profile-menu']}>
          <MobileMenuItem
            label='Online'
            leadingVisual={
              <Icon
                size='20'
                className={styles['mobile-home-channel__profile-status-icon']}
                glyph={<CheckCircleIcon />}
              />
            }
          />
          <MobileMenuItem
            label='Set a Custom Status'
            leadingVisual={
              <Icon size='20' glyph={<EmoticonHappyOutlineIcon />} />
            }
          />
          <div
            className={styles['mobile-home-channel__profile-menu-divider']}
            role='separator'
          />
          <MobileMenuItem
            label='Your Profile'
            leadingVisual={<Icon size='20' glyph={<AccountOutlineIcon />} />}
          />
          <MobileMenuItem
            label='Settings'
            leadingVisual={<Icon size='20' glyph={<CogOutlineIcon />} />}
          />
          <div
            className={styles['mobile-home-channel__profile-menu-divider']}
            role='separator'
          />
          <MobileMenuItem
            label='Log out'
            secondaryLabel='Log out of Community Server'
            destructive
            leadingVisual={<Icon size='20' glyph={<ExitToAppIcon />} />}
          />
        </div>
      </Scrollbar>
    </MobileProfile>
  );
}
