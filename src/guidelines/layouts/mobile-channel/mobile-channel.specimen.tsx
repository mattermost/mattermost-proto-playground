import { useState} from 'react';
import {
  MessageSeparator, Scrollbar } from '@mattermost/compass-ui';
import { MobileMessage, MobileMessageInput, MobileNavigationBar, mobileMessageStyles } from '@mattermost/compass-proto';
import DeviceFrame from '@/components/layout/DeviceFrame';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import styles from './mobile-channel.specimen.module.scss';

const bodyTextClass = mobileMessageStyles['mobile-message__body-text'];

/** Rough iOS keyboard layout matching system QWERTY + suggestions. */
const KEYBOARD_LETTER_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
] as const;

const KEYBOARD_SUGGESTIONS = ['I', 'The', "I'm"];

function KeyboardShiftIcon() {
  return (
    <svg width='18' height='16' viewBox='0 0 18 16' aria-hidden>
      <path
        fill='currentColor'
        d='M9 0 0 9h5v7h8V9h5L9 0Z'
      />
    </svg>
  );
}

function KeyboardDeleteIcon() {
  return (
    <svg width='22' height='16' viewBox='0 0 22 16' aria-hidden>
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinejoin='round'
        d='M7.5 1H20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7.5L1 8l6.5-7Z'
      />
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        d='m10 5 6 6M16 5l-6 6'
      />
    </svg>
  );
}

function KeyboardEmojiIcon() {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' aria-hidden>
      <circle cx='11' cy='11' r='9' fill='none' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='8' cy='9' r='1.1' fill='currentColor' />
      <circle cx='14' cy='9' r='1.1' fill='currentColor' />
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.4'
        strokeLinecap='round'
        d='M7.5 13.5c1.2 1.4 2.7 2 3.5 2s2.3-.6 3.5-2'
      />
    </svg>
  );
}

function KeyboardGlobeIcon() {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' aria-hidden>
      <circle cx='11' cy='11' r='8' fill='none' stroke='currentColor' strokeWidth='1.4' />
      <ellipse cx='11' cy='11' rx='3.5' ry='8' fill='none' stroke='currentColor' strokeWidth='1.4' />
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.4'
        d='M3 11h16M4.5 7h13M4.5 15h13'
      />
    </svg>
  );
}

function KeyboardMicIcon() {
  return (
    <svg width='14' height='22' viewBox='0 0 14 22' aria-hidden>
      <rect x='4' y='1' width='6' height='11' rx='3' fill='currentColor' />
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        d='M1.5 10.5a5.5 5.5 0 0 0 11 0M7 16v4M4 20h6'
      />
    </svg>
  );
}

export default function MobileChannelLayout() {
  const [draft, setDraft] = useState('');
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);

  return (
    <div className={styles['mobile-channel-layout']}>
      <DeviceFrame insetContent={false} statusBarStyle='light'>
        <div
          className={[
            styles['mobile-channel-layout__shell'],
            composerFocused && styles['mobile-channel-layout__shell--keyboard-open'],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles['mobile-channel-layout__content']}>
            <MobileNavigationBar
              variant='Channel'
              name='Town Square'
              memberCount={124}
            />

            <div className={styles['mobile-channel-layout__body']}>
              <Scrollbar>
                <div className={styles['mobile-channel-layout__messages']}>
                  <MessageSeparator type='Date' label='Today' />

                  <MobileMessage
                    avatarSrc={avatarSofia}
                    avatarAlt='Sofia Bauer'
                    username='Sofia Bauer'
                    timestamp='9:02 AM'
                  >
                    <p className={bodyTextClass}>
                      Morning everyone! Reminder that the Q2 roadmap review is
                      at 10:30 today.
                    </p>
                  </MobileMessage>

                  <MobileMessage
                    avatarSrc={avatarMarco}
                    avatarAlt='Marco Rinaldi'
                    username='Marco Rinaldi'
                    timestamp='9:14 AM'
                  >
                    <p className={bodyTextClass}>
                      Just pushed the updated onboarding flow to staging —
                      would love a second pair of eyes before we cut a release.
                    </p>
                  </MobileMessage>

                  <MobileMessage
                    avatarSrc={avatarAikoTan}
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
                    avatarSrc={avatarLeonard}
                    avatarAlt='Leonard Riley'
                    username='Leonard Riley'
                    timestamp='10:12 AM'
                  >
                    <p className={bodyTextClass}>
                      Design review is bumped to 2:00 PM today — conflict with
                      the roadmap meeting.
                    </p>
                  </MobileMessage>
                </div>
              </Scrollbar>
            </div>

            <div
              className={[
                styles['mobile-channel-layout__composer'],
                composerExpanded && styles['mobile-channel-layout__composer--expanded'],
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles['mobile-channel-layout__composer-spacer']} />
              <div className={styles['mobile-channel-layout__composer-sheet']}>
                <MobileMessageInput
                  variant='Root'
                  placeholder='Write to Town Square…'
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
          </div>

          <div
            className={[
              styles['mobile-channel-layout__keyboard'],
              composerFocused && styles['mobile-channel-layout__keyboard--open'],
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden
            // Keep the composer focused when interacting with the mock keyboard
            onMouseDown={(event) => event.preventDefault()}
            onPointerDown={(event) => event.preventDefault()}
          >
            <div className={styles['mobile-channel-layout__keyboard-inner']}>
              <div className={styles['mobile-channel-layout__keyboard-suggestions']}>
                {KEYBOARD_SUGGESTIONS.map((suggestion, index) => (
                  <span
                    key={suggestion}
                    className={styles['mobile-channel-layout__keyboard-suggestion']}
                  >
                    {index > 0 && (
                      <span
                        className={
                          styles['mobile-channel-layout__keyboard-suggestion-divider']
                        }
                        aria-hidden
                      />
                    )}
                    <span
                      className={
                        styles['mobile-channel-layout__keyboard-suggestion-label']
                      }
                    >
                      {suggestion}
                    </span>
                  </span>
                ))}
              </div>

              <div className={styles['mobile-channel-layout__keyboard-keys']}>
                <div className={styles['mobile-channel-layout__keyboard-row']}>
                  {KEYBOARD_LETTER_ROWS[0].map((key) => (
                    <span
                      key={key}
                      className={styles['mobile-channel-layout__keyboard-key']}
                    >
                      {key}
                    </span>
                  ))}
                </div>

                <div
                  className={[
                    styles['mobile-channel-layout__keyboard-row'],
                    styles['mobile-channel-layout__keyboard-row--inset'],
                  ].join(' ')}
                >
                  {KEYBOARD_LETTER_ROWS[1].map((key) => (
                    <span
                      key={key}
                      className={styles['mobile-channel-layout__keyboard-key']}
                    >
                      {key}
                    </span>
                  ))}
                </div>

                <div className={styles['mobile-channel-layout__keyboard-row']}>
                  <span
                    className={[
                      styles['mobile-channel-layout__keyboard-key'],
                      styles['mobile-channel-layout__keyboard-key--mod'],
                      styles['mobile-channel-layout__keyboard-key--shift'],
                    ].join(' ')}
                  >
                    <KeyboardShiftIcon />
                  </span>
                  {KEYBOARD_LETTER_ROWS[2].map((key) => (
                    <span
                      key={key}
                      className={styles['mobile-channel-layout__keyboard-key']}
                    >
                      {key}
                    </span>
                  ))}
                  <span
                    className={[
                      styles['mobile-channel-layout__keyboard-key'],
                      styles['mobile-channel-layout__keyboard-key--mod'],
                      styles['mobile-channel-layout__keyboard-key--action'],
                    ].join(' ')}
                  >
                    <KeyboardDeleteIcon />
                  </span>
                </div>

                <div className={styles['mobile-channel-layout__keyboard-row']}>
                  <span
                    className={[
                      styles['mobile-channel-layout__keyboard-key'],
                      styles['mobile-channel-layout__keyboard-key--mod'],
                      styles['mobile-channel-layout__keyboard-key--action'],
                      styles['mobile-channel-layout__keyboard-key--label'],
                    ].join(' ')}
                  >
                    123
                  </span>
                  <span
                    className={[
                      styles['mobile-channel-layout__keyboard-key'],
                      styles['mobile-channel-layout__keyboard-key--mod'],
                      styles['mobile-channel-layout__keyboard-key--action'],
                    ].join(' ')}
                  >
                    <KeyboardEmojiIcon />
                  </span>
                  <span
                    className={[
                      styles['mobile-channel-layout__keyboard-key'],
                      styles['mobile-channel-layout__keyboard-key--space'],
                      styles['mobile-channel-layout__keyboard-key--label'],
                    ].join(' ')}
                  >
                    space
                  </span>
                  <span
                    className={[
                      styles['mobile-channel-layout__keyboard-key'],
                      styles['mobile-channel-layout__keyboard-key--mod'],
                      styles['mobile-channel-layout__keyboard-key--action'],
                      styles['mobile-channel-layout__keyboard-key--return'],
                      styles['mobile-channel-layout__keyboard-key--label'],
                    ].join(' ')}
                  >
                    return
                  </span>
                </div>
              </div>

              <div className={styles['mobile-channel-layout__keyboard-toolbar']}>
                <span className={styles['mobile-channel-layout__keyboard-toolbar-btn']}>
                  <KeyboardGlobeIcon />
                </span>
                <span className={styles['mobile-channel-layout__keyboard-toolbar-btn']}>
                  <KeyboardMicIcon />
                </span>
              </div>
            </div>
          </div>
        </div>
      </DeviceFrame>
    </div>
  );
}
