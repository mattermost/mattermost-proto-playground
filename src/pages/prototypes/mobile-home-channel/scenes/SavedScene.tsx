import { Scrollbar } from '@mattermost/compass-ui';
import { MobileMessage, MobileSavedMessages, mobileMessageStyles } from '@mattermost/compass-proto';
import {avatars} from '../mobileHomeChannelData';
import styles from '../MobileHomeChannel.module.scss';

const bodyTextClass = mobileMessageStyles['mobile-message__body-text'];

export default function SavedScene() {
  return (
    <MobileSavedMessages>
      <Scrollbar>
        <div className={styles['mobile-home-channel__tab-list']}>
          <MobileMessage
            avatarSrc={avatars.leonard}
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
            avatarSrc={avatars.marco}
            avatarAlt='Marco Rinaldi'
            username='Marco Rinaldi'
            timestamp='Yesterday'
            channelName='Onboarding'
            teamName='Design'
          >
            <p className={bodyTextClass}>
              Just pushed the updated onboarding flow to staging — would love a
              second pair of eyes before we cut a release.
            </p>
          </MobileMessage>

          <MobileMessage
            avatarSrc={avatars.sofia}
            avatarAlt='Sofia Bauer'
            username='Sofia Bauer'
            timestamp='Mon'
            channelName='Town Square'
            teamName='Contributors'
          >
            <p className={bodyTextClass}>
              Morning everyone! Reminder that the Q2 roadmap review is at 10:30
              today.
            </p>
          </MobileMessage>
        </div>
      </Scrollbar>
    </MobileSavedMessages>
  );
}
