import { useState} from 'react';
import { Scrollbar } from '@mattermost/compass-ui';
import { MobileMessage } from '@mattermost/compass-proto';
import { type MobileTabBarTab } from '@mattermost/compass-proto';
import { MobileSavedMessages, MobileTabBar, mobileMessageStyles } from '@mattermost/compass-proto';
import DeviceFrame from '@/components/layout/DeviceFrame';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import styles from './mobile-saved.specimen.module.scss';

const bodyTextClass = mobileMessageStyles['mobile-message__body-text'];

export default function MobileSavedLibrary() {
  const [activeTab, setActiveTab] = useState<MobileTabBarTab>('saved');

  return (
    <div className={styles['mobile-saved-layout']}>
      <DeviceFrame insetContent={false} statusBarStyle='light'>
        <div className={styles['mobile-saved-layout__shell']}>
          <MobileSavedMessages>
            <Scrollbar>
              <div className={styles['mobile-saved-layout__list']}>
                <MobileMessage
                  avatarSrc={avatarLeonard}
                  avatarAlt='Leonard Riley'
                  username='Leonard Riley'
                  timestamp='10:12 AM'
                  channelName='UX Design'
                  teamName='Contributors'
                >
                  <p className={bodyTextClass}>
                    Design review is bumped to 2:00 PM today — conflict with the
                    roadmap meeting.
                  </p>
                </MobileMessage>
                <MobileMessage
                  avatarSrc={avatarMarco}
                  avatarAlt='Marco Rinaldi'
                  username='Marco Rinaldi'
                  timestamp='Yesterday'
                  channelName='Onboarding'
                  teamName='Design'
                >
                  <p className={bodyTextClass}>
                    Just pushed the updated onboarding flow to staging — would
                    love a second pair of eyes before we cut a release.
                  </p>
                </MobileMessage>
                <MobileMessage
                  avatarSrc={avatarSofia}
                  avatarAlt='Sofia Bauer'
                  username='Sofia Bauer'
                  timestamp='Mon'
                  channelName='Town Square'
                  teamName='Contributors'
                >
                  <p className={bodyTextClass}>
                    Morning everyone! Reminder that the Q2 roadmap review is at
                    10:30 today.
                  </p>
                </MobileMessage>
              </div>
            </Scrollbar>
          </MobileSavedMessages>
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
