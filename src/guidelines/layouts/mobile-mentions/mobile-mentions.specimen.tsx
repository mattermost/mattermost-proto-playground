import { useState} from 'react';
import {
  MessageSeparator, Scrollbar } from '@mattermost/compass-ui';
import { type MobileTabBarTab } from '@mattermost/compass-proto';
import { MobileMentions, MobileMessage, MobileTabBar, mobileMessageStyles } from '@mattermost/compass-proto';
import DeviceFrame from '@/components/layout/DeviceFrame';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import styles from './mobile-mentions.specimen.module.scss';

const bodyTextClass = mobileMessageStyles['mobile-message__body-text'];

export default function MobileMentionsLibrary() {
  const [activeTab, setActiveTab] = useState<MobileTabBarTab>('mentions');

  return (
    <div className={styles['mobile-mentions-layout']}>
      <DeviceFrame insetContent={false} statusBarStyle='light'>
        <div className={styles['mobile-mentions-layout__shell']}>
          <MobileMentions>
            <Scrollbar>
              <div className={styles['mobile-mentions-layout__list']}>
                <MessageSeparator type='Date' label='Today' />
                <MobileMessage
                  avatarSrc={avatarSofia}
                  avatarAlt='Sofia Bauer'
                  username='Sofia Bauer'
                  timestamp='9:02 AM'
                  channelName='UX Design'
                  teamName='Contributors'
                >
                  <p className={bodyTextClass}>
                    @Leonard Riley can you join the Q2 roadmap review at 10:30?
                  </p>
                </MobileMessage>
                <MobileMessage
                  avatarSrc={avatarMarco}
                  avatarAlt='Marco Rinaldi'
                  username='Marco Rinaldi'
                  timestamp='9:14 AM'
                  channelName='Onboarding'
                  teamName='Design'
                >
                  <p className={bodyTextClass}>
                    @Leonard Riley would love a second pair of eyes on the
                    onboarding flow before we cut a release.
                  </p>
                </MobileMessage>
                <MessageSeparator type='Date' label='Yesterday' />
                <MobileMessage
                  avatarSrc={avatarAikoTan}
                  avatarAlt='Aiko Tan'
                  username='Aiko Tan'
                  timestamp='4:41 PM'
                  channelName='UX Design'
                  teamName='Contributors'
                >
                  <p className={bodyTextClass}>
                    Thanks @Leonard Riley — I’ll take a pass after standup.
                  </p>
                </MobileMessage>
              </div>
            </Scrollbar>
          </MobileMentions>
          <MobileTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            profileSrc={avatarLeonard}
            profileAlt='Leonard Riley'
            mentionsBadge={2}
          />
        </div>
      </DeviceFrame>
    </div>
  );
}
