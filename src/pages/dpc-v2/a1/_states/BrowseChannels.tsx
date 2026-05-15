/**
 * DPC V2 A1 — Browse Channels (Wave 2C).
 *
 * Forked from V1 with §3.3 V2 deltas:
 *
 *   1. Filter-chip row promoted to a first-class chip group:
 *      - "My Pending Requests"  (FR-27 / KD-3)
 *      - "Discoverable private channels" (FR-27 / KD-28)
 *      - "Hide joined" (v1 carry-forward, ON by default in V2 per §3.3.3)
 *
 *   2. Each Discoverable private channel row renders a composite **lock-plus**
 *      glyph (FR-15 / OPEN-D winner) in the row prefix. Non-discoverable
 *      private rows fall back to the plain lock; public rows render `#`.
 *
 *   3. Hover-action variants carry forward verbatim (Join · Request to Join ·
 *      View). The "Pending" disabled variant from v1 stays the same; clicking
 *      it currently routes through RequestToJoinModal preview-step like V1.
 *
 * The optional `rejoinMode` prop scopes the list to channels the persona
 * previously left (powers the L&R overlay surface) — kept for parity with V1.
 */
import { useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import {
  CHANNELS,
  usePersona,
  type ChannelFixture,
} from '@/pages/dpc/shared';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './BrowseChannels.module.scss';

export interface BrowseChannelsProps {
  store: A1V2StoreApi;
  /** When rendering the L&R overlay, scopes the list to rejoinable channels. */
  rejoinMode?: boolean;
}

interface BrowseChannel extends ChannelFixture {
  recommended?: boolean;
}

// Extra catalogue rows so the Browse list reads like the Figma reference.
const EXTRA_CHANNELS: BrowseChannel[] = [
  {
    id: 'ch-ext-001',
    name: 'ask-anything',
    displayName: 'ask-anything',
    purpose: 'Open Q&A — anything goes. Search before posting.',
    kind: 'public',
    discoverable: true,
    inDirectory: false,
    memberCount: 312,
    policyKey: null,
    allowKnocks: false,
    recommended: true,
  },
  {
    id: 'ch-ext-002',
    name: 'community-configuration',
    displayName: 'community-configuration',
    purpose: 'Community working group on platform configuration patterns.',
    kind: 'public',
    discoverable: true,
    inDirectory: false,
    memberCount: 84,
    policyKey: null,
    allowKnocks: false,
  },
  {
    id: 'ch-ext-003',
    name: 'cba-for-android',
    displayName: 'cba-for-android',
    purpose: 'Channel build automation for Android.',
    kind: 'public',
    discoverable: true,
    inDirectory: false,
    memberCount: 47,
    policyKey: null,
    allowKnocks: false,
  },
  {
    id: 'ch-ext-004',
    name: 'guild-management',
    displayName: 'guild-management',
    purpose: 'Guild leads coordination.',
    kind: 'public',
    discoverable: true,
    inDirectory: false,
    memberCount: 22,
    policyKey: null,
    allowKnocks: false,
  },
  {
    id: 'ch-ext-005',
    name: 'release-cadence',
    displayName: 'release-cadence',
    purpose: 'Train schedule, hotfix queue, release-manager handoffs.',
    kind: 'public',
    discoverable: true,
    inDirectory: false,
    memberCount: 61,
    policyKey: null,
    allowKnocks: false,
  },
  {
    id: 'ch-ext-006',
    name: 'region-west-taskforce',
    displayName: 'region-west-taskforce',
    purpose: 'Regional task-force coordination (West).',
    kind: 'private',
    discoverable: true,
    inDirectory: true,
    memberCount: 12,
    policyKey: 'typical',
    allowKnocks: false,
  },
];

export default function BrowseChannels({
  store,
  rejoinMode = false,
}: BrowseChannelsProps) {
  const { state } = store;
  const { persona } = usePersona();
  const [query, setQuery] = useState('');
  const [hideJoined, setHideJoined] = useState(true); // §3.3.3 — ON by default in V2.
  const [dpcOnly, setDpcOnly] = useState(false);
  const [pendingFilter, setPendingFilter] = useState(rejoinMode);
  const [channelType, setChannelType] = useState<'all' | 'public' | 'private'>(
    'all',
  );
  const [, setActiveRequestChannelId] = useState<string | null>(null);

  const isGuest = persona === 'guest';

  const allChannels: BrowseChannel[] = [
    ...CHANNELS.filter(
      (c) => c.kind === 'public' || (c.kind === 'private' && c.discoverable),
    ).map<BrowseChannel>((c) => ({ ...c })),
    ...EXTRA_CHANNELS,
  ];

  const pendingCount = state.myPendingRequests.length;

  const rows = allChannels.filter((c) => {
    if (isGuest) return false;
    if (rejoinMode && !state.rejoinableChannels.includes(c.id)) return false;
    if (channelType !== 'all' && c.kind !== channelType) return false;
    if (hideJoined && state.joinedChannels.includes(c.id)) return false;
    if (dpcOnly && !(c.kind === 'private' && c.discoverable)) return false;
    if (pendingFilter) {
      const myReq = store.myPendingRequestForChannel(c.id, persona);
      if (!myReq) return false;
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (
        !c.displayName.toLowerCase().includes(q) &&
        !c.purpose.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <section
      className={styles['v2-browse-channels']}
      aria-label={rejoinMode ? 'Channels you can rejoin' : 'Browse Channels'}
    >
      <header className={styles['v2-browse-channels__header']}>
        <div className={styles['v2-browse-channels__header-top']}>
          <h2 className={styles['v2-browse-channels__title']}>
            {rejoinMode ? 'Channels you can rejoin' : 'Browse Channels'}
          </h2>
          <div className={styles['v2-browse-channels__header-actions']}>
            <Button emphasis="Secondary" size="Small">
              Create New Channel
            </Button>
            <IconButton
              aria-label="Close"
              size="Small"
              icon={<Icon size="16" glyph={<CloseIcon />} />}
            />
          </div>
        </div>
        <TextInput
          size="Medium"
          placeholder="Search channels"
          leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* V2 filter-chip row. */}
        <div
          className={styles['v2-browse-channels__chips']}
          role="group"
          aria-label="Filter channels"
        >
          <Chip
            size="Small"
            as="button"
            tone={pendingFilter ? 'info' : 'neutral'}
            colored={pendingFilter}
            onClick={() => setPendingFilter((v) => !v)}
            aria-pressed={pendingFilter}
          >
            My Pending Requests{pendingCount > 0 ? ` (${pendingCount})` : ''}
          </Chip>
          <Chip
            size="Small"
            as="button"
            tone={dpcOnly ? 'info' : 'neutral'}
            colored={dpcOnly}
            leadingIcon={<LockOutlineIcon />}
            onClick={() => setDpcOnly((v) => !v)}
            aria-pressed={dpcOnly}
          >
            Discoverable private channels
          </Chip>
          <Chip
            size="Small"
            as="button"
            tone={hideJoined ? 'info' : 'neutral'}
            colored={hideJoined}
            onClick={() => setHideJoined((v) => !v)}
            aria-pressed={hideJoined}
          >
            Hide joined
          </Chip>
        </div>
      </header>

      <div className={styles['v2-browse-channels__filter-row']}>
        <span className={styles['v2-browse-channels__result-count']}>
          {rows.length} result{rows.length === 1 ? '' : 's'}
        </span>
        <ChannelTypeDropdown value={channelType} onChange={setChannelType} />
      </div>

      {isGuest ? (
        <EmptyState
          title="No discoverable channels in this team yet."
          description="Same response shape regardless of role — guest filter applied server-side (NFR-2)."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={
            pendingFilter
              ? "You don't have any pending requests."
              : rejoinMode
                ? "You haven't left any discoverable channels yet."
                : dpcOnly
                  ? 'No discoverable channels match the filter.'
                  : 'No discoverable channels in this team yet.'
          }
        />
      ) : (
        <ul className={styles['v2-browse-channels__list']}>
          {rows.map((c) => (
            <BrowseRow
              key={c.id}
              channel={c}
              isJoined={state.joinedChannels.includes(c.id)}
              hasPending={store.hasPendingForChannel(c.id, persona)}
              onClick={() => setActiveRequestChannelId(c.id)}
            />
          ))}
        </ul>
      )}

    </section>
  );
}

interface BrowseRowProps {
  channel: BrowseChannel;
  isJoined: boolean;
  hasPending: boolean;
  onClick: () => void;
}

function BrowseRow({ channel, isJoined, hasPending, onClick }: BrowseRowProps) {
  const isPrivate = channel.kind === 'private';
  const isDiscoverable = isPrivate && channel.discoverable;

  const variant: 'join' | 'view' | 'request' = isJoined
    ? 'view'
    : isDiscoverable
      ? 'request'
      : 'join';

  const handleAction = () => {
    if (variant === 'request') onClick();
  };

  return (
    <li className={styles['v2-browse-channels__row']}>
      <div className={styles['v2-browse-channels__row-content']}>
        <div className={styles['v2-browse-channels__row-top']}>
          {/* Row prefix icon — composite lock-plus for DPC rows. */}
          {isDiscoverable ? (
            <span
              className={styles['v2-browse-channels__row-icon']}
              aria-label="Discoverable private channel"
              role="img"
            >
              <LockOutlineIcon size={16} />
              <PlusIcon
                size={10}
                className={styles['v2-browse-channels__row-icon-plus']}
              />
            </span>
          ) : (
            <Icon
              size="16"
              glyph={isPrivate ? <LockOutlineIcon /> : <GlobeIcon />}
            />
          )}
          <span className={styles['v2-browse-channels__row-name']}>
            {channel.displayName}
          </span>
        </div>
        <div className={styles['v2-browse-channels__row-bottom']}>
          {channel.recommended && (
            <>
              <span
                className={[
                  styles['v2-browse-channels__indicator'],
                  styles['v2-browse-channels__indicator--info'],
                ].join(' ')}
              >
                <Icon size="12" glyph={<LightbulbOutlineIcon />} />
                Recommended
              </span>
              <span
                className={styles['v2-browse-channels__dot-separator']}
                aria-hidden
              />
            </>
          )}
          {isJoined && (
            <>
              <span
                className={[
                  styles['v2-browse-channels__indicator'],
                  styles['v2-browse-channels__indicator--success'],
                ].join(' ')}
              >
                <Icon size="12" glyph={<CheckIcon />} />
                Joined
              </span>
              <span
                className={styles['v2-browse-channels__dot-separator']}
                aria-hidden
              />
            </>
          )}
          {hasPending && (
            <>
              <span
                className={[
                  styles['v2-browse-channels__indicator'],
                  styles['v2-browse-channels__indicator--neutral'],
                ].join(' ')}
              >
                Pending
              </span>
              <span
                className={styles['v2-browse-channels__dot-separator']}
                aria-hidden
              />
            </>
          )}
          <span className={styles['v2-browse-channels__member-count']}>
            <Icon size="12" glyph={<AccountMultipleOutlineIcon />} />
            {channel.memberCount}
          </span>
          <span
            className={styles['v2-browse-channels__dot-separator']}
            aria-hidden
          />
          <span className={styles['v2-browse-channels__purpose']}>
            {channel.purpose}
          </span>
        </div>
      </div>
      <div className={styles['v2-browse-channels__row-action']}>
        <Button
          emphasis={variant === 'view' ? 'Secondary' : 'Primary'}
          size="Small"
          onClick={handleAction}
        >
          {variant === 'view'
            ? 'View'
            : variant === 'request'
              ? 'Request to Join'
              : 'Join'}
        </Button>
      </div>
    </li>
  );
}

interface ChannelTypeDropdownProps {
  value: 'all' | 'public' | 'private';
  onChange: (next: 'all' | 'public' | 'private') => void;
}

const TYPE_OPTIONS: Array<{
  key: ChannelTypeDropdownProps['value'];
  label: string;
}> = [
  { key: 'all', label: 'All' },
  { key: 'public', label: 'Public' },
  { key: 'private', label: 'Private' },
];

function ChannelTypeDropdown({ value, onChange }: ChannelTypeDropdownProps) {
  const [open, setOpen] = useState(false);
  const current = TYPE_OPTIONS.find((o) => o.key === value)?.label ?? 'All';
  return (
    <div className={styles['v2-browse-channels__dropdown']}>
      <button
        type="button"
        className={styles['v2-browse-channels__dropdown-trigger']}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>Channel type: {current}</span>
        <Icon size="12" glyph={<ChevronDownIcon />} />
      </button>
      {open && (
        <ul
          className={styles['v2-browse-channels__dropdown-menu']}
          role="listbox"
        >
          {TYPE_OPTIONS.map((o) => (
            <li key={o.key}>
              <button
                type="button"
                className={[
                  styles['v2-browse-channels__dropdown-item'],
                  o.key === value
                    ? styles['v2-browse-channels__dropdown-item--active']
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
