import { useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import TextInput from '@/components/ui/TextInput/TextInput';
import ConsoleFrame from '../shared/ConsoleFrame';
import styles from './UserSessionsModal.module.scss';

interface UserSessionRow {
  id: string;
  device: string;
  osLine: string;
  lastActive: string;
  created: string;
}

const TARGET_USER = 'Leonard Riley';

const INITIAL_SESSIONS: UserSessionRow[] = [
  {
    id: 'sess-1',
    device: 'Macbook Pro',
    osLine: 'macOS 26 · Desktop app version 6.1',
    lastActive: 'November 12, 2025, 07:55 PM',
    created: 'August 19, 2025, 06:46 PM',
  },
  {
    id: 'sess-2',
    device: 'iPad Air',
    osLine: 'iOS 17 · App version 2.1.0',
    lastActive: 'November 12, 2025, 07:55 PM',
    created: 'August 19, 2025, 06:46 PM',
  },
  {
    id: 'sess-3',
    device: 'iPhone 17 pro',
    osLine: 'iOS 26 · App version 2.33.1',
    lastActive: 'November 12, 2025, 07:55 PM',
    created: 'August 19, 2025, 06:46 PM',
  },
  {
    id: 'sess-4',
    device: 'Windows 11',
    osLine: 'Chrome web browser 5.10.0',
    lastActive: 'November 12, 2025, 07:55 PM',
    created: 'August 19, 2025, 06:46 PM',
  },
];

const BACKGROUND_USERS = [
  { name: 'Leonard Riley', handle: '@leonard.riley', email: 'leonard.riley@acmecorp.com', lastActive: '2 days ago', messages: '73', role: 'Member' },
  { name: 'Tou Medhurst', handle: '@toy.medhurst', email: 'toy.medhurst@acmecorp.com', lastActive: '2 days ago', messages: '281', role: 'Member' },
  { name: 'Adriana Schmitt', handle: '@adrianna.s', email: 'adriana.schmitt@acmecorp.com', lastActive: '2 days ago', messages: '345', role: 'Member' },
  { name: 'Chanel Beahan', handle: '@chanel.beahan', email: 'chanel.beahan@acmecorp.com', lastActive: '2 days ago', messages: '402', role: 'Member' },
  { name: 'Lacey Gusikowski', handle: '@lacey.gu', email: 'lacey.gusikowski@acmecorp.com', lastActive: '2 days ago', messages: '458', role: 'Member' },
  { name: 'Izaiah Schmitt', handle: '@izaiah37', email: 'izaiah37@acmecorp.com', lastActive: '2 days ago', messages: '5140', role: 'Member' },
];

interface UserSessionsModalProps {
  onBack?: () => void;
  /** Variant: 'empty' renders the modal with no sessions to show the empty state. */
  variant?: 'default' | 'empty';
}

export default function UserSessionsModal({
  onBack,
  variant = 'default',
}: UserSessionsModalProps) {
  const [sessions, setSessions] = useState<UserSessionRow[]>(
    variant === 'empty' ? [] : INITIAL_SESSIONS,
  );
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  function revoke(id: string) {
    setRevoking(id);
    setTimeout(() => {
      setSessions((s) => s.filter((x) => x.id !== id));
      setRevoking(null);
    }, 320);
  }

  function revokeAll() {
    setSessions([]);
    setRevokeAllOpen(false);
  }

  return (
    <ConsoleFrame
      title="Mattermost Users"
      activeItemId="users"
      enterpriseTag={false}
      trailing={
        <Button
          emphasis="Tertiary"
          size="Small"
          destructive
          onClick={() => setRevokeAllOpen(true)}
        >
          Revoke All Sessions
        </Button>
      }
    >
      <div className={styles['users']}>
        <div className={styles['users__toolbar']}>
          <div className={styles['users__search']}>
            <TextInput
              size="Medium"
              placeholder="Search users"
              leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
            />
          </div>
          <div className={styles['users__toolbar-right']}>
            <div className={styles['users__filter-pill']}>
              <span className={styles['users__filter-label']}>Duration</span>
              <span className={styles['users__filter-value']}>Last 6 months</span>
              <Icon size="12" glyph={<ChevronDownIcon />} />
            </div>
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<DownloadOutlineIcon />} />}
            >
              Export
            </Button>
          </div>
        </div>

        <div className={styles['users__meta']}>
          <span>94 users</span>
          <span className={styles['users__page']}>Showing 1 – 20 users</span>
        </div>

        <div className={styles['users__table']}>
          <div className={styles['users__head']}>
            <div className={`${styles['users__col']} ${styles['users__col--name']}`}>User details</div>
            <div className={`${styles['users__col']} ${styles['users__col--email']}`}>Email</div>
            <div className={`${styles['users__col']} ${styles['users__col--joined']}`}>Joined</div>
            <div className={`${styles['users__col']} ${styles['users__col--active']}`}>Last Active Date</div>
            <div className={`${styles['users__col']} ${styles['users__col--messages']}`}>Messages Posted</div>
            <div className={`${styles['users__col']} ${styles['users__col--actions']}`}>Actions</div>
          </div>
          {BACKGROUND_USERS.map((u) => (
            <div key={u.handle} className={styles['users__row']}>
              <div className={`${styles['users__col']} ${styles['users__col--name']}`}>
                <div className={styles['users__avatar']} aria-hidden>
                  {u.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                </div>
                <div className={styles['users__user-text']}>
                  <span className={styles['users__user-name']}>{u.name}</span>
                  <span className={styles['users__user-handle']}>{u.handle}</span>
                </div>
              </div>
              <div className={`${styles['users__col']} ${styles['users__col--email']}`}>{u.email}</div>
              <div className={`${styles['users__col']} ${styles['users__col--joined']}`}>146 days</div>
              <div className={`${styles['users__col']} ${styles['users__col--active']}`}>{u.lastActive}</div>
              <div className={`${styles['users__col']} ${styles['users__col--messages']}`}>{u.messages}</div>
              <div className={`${styles['users__col']} ${styles['users__col--actions']}`}>
                <span className={styles['users__role-pill']}>
                  {u.role} <Icon size="12" glyph={<ChevronDownIcon />} />
                </span>
                <IconButton size="X-Small" aria-label="Row actions" icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />} />
              </div>
            </div>
          ))}
        </div>

        {onBack && (
          <div className={styles['users__back-row']}>
            <Button emphasis="Tertiary" size="Small" onClick={onBack}>
              ← Back to scenarios
            </Button>
          </div>
        )}
      </div>

      <div className={styles['modal-overlay']}>
        <div className={styles['modal']} role="dialog" aria-modal="true" aria-labelledby="user-sessions-title">
          <div className={styles['modal__header']}>
            <h2 id="user-sessions-title" className={styles['modal__title']}>
              {TARGET_USER}&rsquo;s sessions
            </h2>
            <IconButton
              size="Small"
              aria-label="Close"
              icon={<Icon size="16" glyph={<CloseIcon />} />}
              onClick={onBack}
            />
          </div>

          <div className={styles['modal__body']}>
            {sessions.length === 0 ? (
              <div className={styles['modal__empty']}>
                <p className={styles['modal__empty-title']}>No active sessions</p>
                <p className={styles['modal__empty-body']}>
                  {TARGET_USER} has no sessions to revoke. They&rsquo;ll appear here
                  the next time they sign in.
                </p>
              </div>
            ) : (
              <ul className={styles['modal__list']}>
                {sessions.map((s) => (
                  <li
                    key={s.id}
                    className={`${styles['modal__row']} ${revoking === s.id ? styles['modal__row--revoking'] : ''}`}
                  >
                    <div className={styles['modal__row-text']}>
                      <div className={styles['modal__row-title']}>{s.device}</div>
                      <div className={styles['modal__row-os']}>{s.osLine}</div>
                      <div className={styles['modal__row-meta']}>
                        <span className={styles['modal__row-meta-label']}>Last active:</span> {s.lastActive}
                      </div>
                      <div className={styles['modal__row-meta']}>
                        <span className={styles['modal__row-meta-label']}>Created:</span> {s.created}
                      </div>
                    </div>
                    <div className={styles['modal__row-action']}>
                      {revoking === s.id ? (
                        <LabelTag label="Revoking…" type="Danger" size="Small" />
                      ) : (
                        <Button
                          emphasis="Tertiary"
                          size="Small"
                          destructive
                          onClick={() => revoke(s.id)}
                        >
                          Revoke session
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {revokeAllOpen && (
        <div className={styles['confirm-overlay']}>
          <div className={styles['confirm']} role="dialog" aria-modal="true">
            <h3 className={styles['confirm__title']}>Revoke all sessions?</h3>
            <p className={styles['confirm__body']}>
              This will sign out every user across the workspace. They&rsquo;ll need
              to sign in again on each device.
            </p>
            <div className={styles['confirm__actions']}>
              <Button emphasis="Tertiary" onClick={() => setRevokeAllOpen(false)}>Cancel</Button>
              <Button emphasis="Primary" destructive onClick={revokeAll}>
                Revoke all
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConsoleFrame>
  );
}
