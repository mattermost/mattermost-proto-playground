import { MessageSeparator, Scrollbar } from '@mattermost/compass-ui';
import { MobileMentions, MobileMessage, mobileMessageStyles } from '@mattermost/compass-proto';
import {avatars} from '../mobileHomeChannelData';
import styles from '../MobileHomeChannel.module.scss';

const bodyTextClass = mobileMessageStyles['mobile-message__body-text'];

export default function MentionsScene() {
  return (
    <MobileMentions>
      <Scrollbar>
        <div className={styles['mobile-home-channel__tab-list']}>
          <MessageSeparator type='Date' label='Today' />

          <MobileMessage
            avatarSrc={avatars.sofia}
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
            avatarSrc={avatars.marco}
            avatarAlt='Marco Rinaldi'
            username='Marco Rinaldi'
            timestamp='9:14 AM'
            channelName='Onboarding'
            teamName='Design'
          >
            <p className={bodyTextClass}>
              @Leonard Riley would love a second pair of eyes on the onboarding
              flow before we cut a release.
            </p>
          </MobileMessage>

          <MessageSeparator type='Date' label='Yesterday' />

          <MobileMessage
            avatarSrc={avatars.aikoTan}
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
  );
}
