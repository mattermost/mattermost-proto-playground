import { MessageReactions } from '@mattermost/compass-ui';
import { MobileMessage, mobileMessageStyles } from '@mattermost/compass-proto';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from './mobile-message.specimen.module.scss';

const bodyTextClass = mobileMessageStyles['mobile-message__body-text'];

export default function MobileMessageLibrary() {
  return (
    <div className={styles['mm-specimen']}>
      <div className={styles['mm-specimen__stage']}>
        <p className={styles['mm-specimen__label']}>Default</p>
        <div className={styles['mm-specimen__frame']}>
          <MobileMessage
            avatarSrc={avatarLeonard}
            avatarAlt='Leonard Riley'
            username='Leonard Riley'
            timestamp='9:41 AM'
          >
            <p className={bodyTextClass}>
              Hey team, the new components are looking great!
            </p>
          </MobileMessage>
        </div>
      </div>

      <div className={styles['mm-specimen__stage']}>
        <p className={styles['mm-specimen__label']}>Active (tap)</p>
        <div className={styles['mm-specimen__frame']}>
          <MobileMessage
            className={mobileMessageStyles['mobile-message--state-active']}
            avatarSrc={avatarLeonard}
            avatarAlt='Leonard Riley'
            username='Leonard Riley'
            timestamp='9:41 AM'
          >
            <p className={bodyTextClass}>
              Hey team, the new components are looking great!
            </p>
          </MobileMessage>
        </div>
      </div>

      <div className={styles['mm-specimen__stage']}>
        <p className={styles['mm-specimen__label']}>Bot</p>
        <div className={styles['mm-specimen__frame']}>
          <MobileMessage
            avatarSrc={avatarDanielle}
            avatarAlt='Mattermost'
            username='Mattermost'
            timestamp='9:45 AM'
            isBot
          >
            <p className={bodyTextClass}>
              You have 3 unread messages in #general.
            </p>
          </MobileMessage>
        </div>
      </div>

      <div className={styles['mm-specimen__stage']}>
        <p className={styles['mm-specimen__label']}>Pinned + reactions</p>
        <div className={styles['mm-specimen__frame']}>
          <MobileMessage
            showPinnedSavedIndicators
            avatarSrc={avatarLeonard}
            avatarAlt='Leonard Riley'
            username='Leonard Riley'
            timestamp='10:12 AM'
            footer={
              <MessageReactions
                reactions={[
                  {emoji: '👍', count: 2, byCurrentUser: true},
                  {emoji: '🎉', count: 1},
                ]}
                showAddReaction
              />
            }
          >
            <p className={bodyTextClass}>
              Design review is bumped to 2:00 PM today — conflict with the
              roadmap meeting.
            </p>
          </MobileMessage>
        </div>
      </div>
    </div>
  );
}
