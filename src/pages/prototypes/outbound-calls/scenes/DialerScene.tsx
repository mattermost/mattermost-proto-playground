import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import DialpadIcon from '@mattermost/compass-icons/components/dialpad';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { KeypadGrid } from '@/pages/prototypes/outbound-calls/OutboundCallKeypad';
import { CONTACT_MAP } from '@/pages/prototypes/outbound-calls/outboundCallData';
import { formatRecentDuration, sanitizeDigits } from '@/pages/prototypes/outbound-calls/outboundCallUtils';
import type { Recent } from '@/types/outboundCall';
import styles from '../OutboundCalls.module.scss';

export function DialerScene({
  recents,
  onStartCall,
  onDialRaw,
}: {
  recents: Recent[];
  onStartCall: (contactId: string, phoneIndex: number) => void;
  onDialRaw: (number: string) => void;
}) {
  const [typed, setTyped] = useState('');

  const append = (k: string) => setTyped((t) => sanitizeDigits(t + k));
  const clearTyped = () => setTyped('');
  const dial = () => {
    if (!typed) return;
    onDialRaw(typed);
    setTyped('');
  };

  return (
    <>
      <div className={styles['dialer-header']}>
        <span className={styles['dialer-header__icon']}>
          <Icon glyph={<DialpadIcon />} size="16" />
        </span>
        <span className={styles['dialer-header__title']}>Dial Pad</span>
        <span className={styles['dialer-header__description']}>
          Dial any number — work numbers go through Mattermost Secure.
        </span>
      </div>

      <div className={styles['dialer']}>
        <div className={styles['dialer__keypad']}>
          <TextInput
            className={styles['dialer__phone-field']}
            size="large"
            value={typed}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTyped(sanitizeDigits(e.target.value))}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                dial();
              }
            }}
            placeholder="Enter a number"
            inputMode="tel"
            autoComplete="off"
            aria-label="Phone number"
            trailingIcon={
              <span style={{ visibility: typed ? 'visible' : 'hidden' }}>
                <IconButton
                  aria-label="Clear number"
                  size="small"
                  padding="compact"
                  icon={<Icon glyph={<CloseCircleIcon />} size="16" />}
                  onClick={clearTyped}
                />
              </span>
            }
          />
          <KeypadGrid onPress={append} />

          <div className={styles['dialer__call-action']}>
            <button
              type="button"
              className={styles['dialer__call-button']}
              onClick={dial}
              disabled={!typed}
              aria-label="Start call"
            >
              <Icon glyph={<PhoneIcon />} size="24" />
            </button>
          </div>
        </div>

        <div className={styles['dialer__recents']}>
          <div className={styles['dialer__recents-header']}>
            <Icon glyph={<ClockOutlineIcon />} size="16" />
            <span>Recent calls</span>
          </div>
          <ul className={styles['dialer__recents-list']}>
            {recents.map((r, i) => {
              const c = CONTACT_MAP[r.contactId];
              const p = c.phones[r.phoneIndex];
              const isMissed = r.direction === 'inbound-missed';
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={styles['dialer__recent']}
                    onClick={() => onStartCall(r.contactId, r.phoneIndex)}
                  >
                    {c.avatar ? (
                      <UserAvatar src={c.avatar} alt={c.name} size="32" />
                    ) : (
                      <div
                        className={styles['dialer__recent-avatar-fallback']}
                        aria-hidden
                      >
                        <Icon glyph={<PhoneIcon />} size="16" />
                      </div>
                    )}
                    <div className={styles['dialer__recent-body']}>
                      <div
                        className={`${styles['dialer__recent-name']} ${
                          isMissed ? styles['dialer__recent-name--missed'] : ''
                        }`}
                      >
                        {c.name}
                      </div>
                      <div className={styles['dialer__recent-meta']}>{p.number}</div>
                    </div>
                    <div className={styles['dialer__recent-right']}>
                      <div className={styles['dialer__recent-time']}>{r.timestamp}</div>
                      <div className={styles['dialer__recent-duration']}>
                        {r.durationSec !== undefined
                          ? formatRecentDuration(r.durationSec)
                          : 'Missed'}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
