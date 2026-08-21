import { useState} from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import ExitToAppIcon from '@mattermost/compass-icons/components/exit-to-app';
import {
  Icon, Scrollbar } from '@mattermost/compass-ui';
import { type MobileTabBarTab } from '@mattermost/compass-proto';
import { MobileMenuItem, MobileProfile, MobileTabBar } from '@mattermost/compass-proto';
import DeviceFrame from '@/components/layout/DeviceFrame';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from './mobile-profile.specimen.module.scss';

export default function MobileProfileLibrary() {
  const [activeTab, setActiveTab] = useState<MobileTabBarTab>('profile');

  return (
    <div className={styles['mobile-profile-layout']}>
      <DeviceFrame insetContent={false} statusBarStyle='light'>
        <div className={styles['mobile-profile-layout__shell']}>
          <MobileProfile
            avatarSrc={avatarLeonard}
            avatarAlt='Leonard Riley'
            displayName='Leonard Riley'
            username='@leonard.riley'
          >
            <Scrollbar>
              <div className={styles['mobile-profile-layout__menu']}>
                <MobileMenuItem
                  label='Online'
                  leadingVisual={
                    <Icon
                      size='20'
                      className={styles['mobile-profile-layout__status-icon']}
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
                  className={styles['mobile-profile-layout__menu-divider']}
                  role='separator'
                />
                <MobileMenuItem
                  label='Your Profile'
                  leadingVisual={
                    <Icon size='20' glyph={<AccountOutlineIcon />} />
                  }
                />
                <MobileMenuItem
                  label='Settings'
                  leadingVisual={
                    <Icon size='20' glyph={<CogOutlineIcon />} />
                  }
                />
                <div
                  className={styles['mobile-profile-layout__menu-divider']}
                  role='separator'
                />
                <MobileMenuItem
                  label='Log out'
                  secondaryLabel='Log out of Community Server'
                  destructive
                  leadingVisual={
                    <Icon size='20' glyph={<ExitToAppIcon />} />
                  }
                />
              </div>
            </Scrollbar>
          </MobileProfile>
          <MobileTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            profileSrc={avatarLeonard}
            profileAlt='Leonard Riley'
          />
        </div>
      </DeviceFrame>
    </div>
  );
}
