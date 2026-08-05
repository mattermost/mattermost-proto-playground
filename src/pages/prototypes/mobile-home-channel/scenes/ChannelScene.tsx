import {useState} from 'react';
import {
  MessageSeparator,
  MobileMessage,
  MobileMessageInput,
  MobileNavigationBar,
  Scrollbar,
  mobileMessageStyles,
} from '@mattermost/compass-ui';
import MobileKeyboard from '../components/MobileKeyboard';
import {avatars, type ChannelMeta} from '../mobileHomeChannelData';
import styles from '../MobileHomeChannel.module.scss';

const bodyTextClass = mobileMessageStyles['mobile-message__body-text'];

type ChannelSceneProps = {
  channel: ChannelMeta;
  modalOpen: boolean;
  onOpenModal: () => void;
  onBack: () => void;
};

export default function ChannelScene({
  channel,
  modalOpen,
  onOpenModal,
  onBack,
}: ChannelSceneProps) {
  const [draft, setDraft] = useState('');
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);

  return (
    <div
      className={[
        styles['mobile-home-channel__channel-content'],
        composerFocused &&
          !modalOpen &&
          styles['mobile-home-channel__channel-content--keyboard-open'],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <MobileNavigationBar
        variant={channel.variant}
        name={channel.name}
        memberCount={channel.memberCount}
        onBackClick={onBack}
        onTitleClick={onOpenModal}
      />

      <div className={styles['mobile-home-channel__channel-body']}>
        <Scrollbar>
          <div className={styles['mobile-home-channel__messages']}>
            <MessageSeparator type='Date' label='Today' />

            <MobileMessage
              avatarSrc={avatars.sofia}
              avatarAlt='Sofia Bauer'
              username='Sofia Bauer'
              timestamp='9:02 AM'
            >
              <p className={bodyTextClass}>
                Morning everyone! Reminder that the Q2 roadmap review is at
                10:30 today.
              </p>
            </MobileMessage>

            <MobileMessage
              avatarSrc={avatars.marco}
              avatarAlt='Marco Rinaldi'
              username='Marco Rinaldi'
              timestamp='9:14 AM'
            >
              <p className={bodyTextClass}>
                Just pushed the updated onboarding flow to staging — would love
                a second pair of eyes before we cut a release.
              </p>
            </MobileMessage>

            <MobileMessage
              avatarSrc={avatars.aikoTan}
              avatarAlt='Aiko Tan'
              username='Aiko Tan'
              timestamp='9:33 AM'
            >
              <p className={bodyTextClass}>
                Nice work Marco. I can take a pass after standup.
              </p>
            </MobileMessage>

            <MessageSeparator type='New Messages' />

            <MobileMessage
              avatarSrc={avatars.leonard}
              avatarAlt='Leonard Riley'
              username='Leonard Riley'
              timestamp='10:12 AM'
            >
              <p className={bodyTextClass}>
                Design review is bumped to 2:00 PM today — conflict with the
                roadmap meeting.
              </p>
            </MobileMessage>
          </div>
        </Scrollbar>
      </div>

      <div
        className={[
          styles['mobile-home-channel__composer'],
          composerExpanded &&
            styles['mobile-home-channel__composer--expanded'],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles['mobile-home-channel__composer-spacer']} />
        <div className={styles['mobile-home-channel__composer-sheet']}>
          <MobileMessageInput
            variant='Root'
            placeholder={`Write to ${channel.name}…`}
            value={draft}
            onChange={setDraft}
            expanded={composerExpanded}
            onExpandedChange={setComposerExpanded}
            onFocus={() => setComposerFocused(true)}
            onBlur={() => setComposerFocused(false)}
            onSend={() => setDraft('')}
          />
        </div>
      </div>

      <MobileKeyboard open={composerFocused && !modalOpen} />
    </div>
  );
}
