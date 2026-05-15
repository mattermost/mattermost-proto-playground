import { useState } from 'react';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import DialpadIcon from '@/components/icons/DialpadIcon';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { KeypadGrid } from '@/pages/OutboundCalls/OutboundCallKeypad';
import { CONTACT_MAP } from '@/pages/OutboundCalls/outboundCallData';
import { formatRecentDuration, sanitizeDigits } from '@/pages/OutboundCalls/outboundCallUtils';
import { playDtmf } from '@/utils/phoneSounds';
import type { Recent } from '@/types/outboundCall';
import styles from './OutboundCalls.module.scss';

export function RhsDialer({
  recents,
  onClose,
  onStartCall,
  onDialRaw,
}: {
  recents: Recent[];
  onClose: () => void;
  onStartCall: (contactId: string, phoneIndex: number) => void;
  onDialRaw: (number: string) => void;
}) {
  const [typed, setTyped] = useState('');

  const append = (k: string) => {
    playDtmf(k);
    setTyped((t) => sanitizeDigits(t + k));
  };
  const clearTyped = () => setTyped('');
  const dial = () => {
    if (!typed) return;
    onDialRaw(typed);
    setTyped('');
  };

  return (
    <aside className={styles['rhs']} aria-label="Dial pad">
      <div className={styles['rhs__header']}>
        <span className={styles['rhs__header-icon']} aria-hidden>
          <Icon glyph={<DialpadIcon />} size="16" />
        </span>
        <span className={styles['rhs__header-title']}>Dial Pad</span>
        <IconButton
          aria-label="Close dial pad"
          size="Small"
          padding="Compact"
          icon={<Icon glyph={<CloseIcon />} size="16" />}
          onClick={onClose}
        />
      </div>

      <div className={styles['rhs__body']}>
        <div className={styles['rhs__dialpad']}>
          <TextInput
            className={styles['rhs__phone-field']}
            size="Large"
            value={typed}
            onChange={(e) => setTyped(sanitizeDigits(e.target.value))}
            onKeyDown={(e) => {
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
                  size="Small"
                  padding="Compact"
                  icon={<Icon glyph={<CloseCircleIcon />} size="16" />}
                  onClick={clearTyped}
                />
              </span>
            }
          />
          <KeypadGrid onPress={append} />
          <button
            type="button"
            className={styles['rhs__call-button']}
            onClick={dial}
            disabled={!typed}
            aria-label="Start call"
          >
            <Icon glyph={<PhoneIcon />} size="20" />
          </button>
        </div>

        <div className={styles['rhs__recents']}>
          <div className={styles['rhs__recents-header']}>
            <Icon glyph={<ClockOutlineIcon />} size="12" />
            <span>Recent calls</span>
          </div>
          <ul className={styles['rhs__recents-list']}>
            {recents.map((r, i) => {
              const c = CONTACT_MAP[r.contactId];
              const p = c.phones[r.phoneIndex];
              const isMissed = r.direction === 'inbound-missed';
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={styles['rhs__recent']}
                    onClick={() => onStartCall(r.contactId, r.phoneIndex)}
                  >
                    {c.avatar ? (
                      <UserAvatar src={c.avatar} alt={c.name} size="32" />
                    ) : (
                      <div
                        className={styles['rhs__recent-avatar-fallback']}
                        aria-hidden
                      >
                        <Icon glyph={<PhoneIcon />} size="16" />
                      </div>
                    )}
                    <div className={styles['rhs__recent-body']}>
                      <div
                        className={`${styles['rhs__recent-name']} ${
                          isMissed ? styles['rhs__recent-name--missed'] : ''
                        }`}
                      >
                        {c.name}
                      </div>
                      <div className={styles['rhs__recent-meta']}>{p.number}</div>
                    </div>
                    <div className={styles['rhs__recent-right']}>
                      <div className={styles['rhs__recent-time']}>{r.timestamp}</div>
                      <div className={styles['rhs__recent-duration']}>
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
    </aside>
  );
}
