/**
 * DPC V2 A1 — BrowseChannels (refactored May 2026).
 *
 * Renders the Browse Channels modal OVER a real `ChannelShell` so the
 * underlying LHS sidebar is visible behind the modal backdrop. The
 * modal is the focus; the shell is contextual chrome.
 *
 * Per Change 2: row prefixes for Discoverable private channels use ONLY
 * the bare composite lock-plus icon — no "Discoverable" LabelTag overlay.
 * The icon shape (lock + plus, WCAG 1.4.1 shape distinction) is the
 * subtle indicator (KD-26).
 *
 * The "Hide joined" filter is ON by default per §3.3.3.
 */
import { useEffect, useState } from 'react';
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
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import TextInput from '@/components/ui/TextInput/TextInput';
import {
  CHANNELS,
  usePersona,
  type ChannelFixture,
} from '@/pages/dpc/shared';
import AppOverlay from '../_components/AppOverlay';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import ScreenCanvas from '../_components/ScreenCanvas';
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

type ChannelTypeFilter =
  | 'all'
  | 'public'
  | 'private'
  | 'discoverable'
  | 'pending';

export default function BrowseChannels({
  store,
  rejoinMode = false,
}: BrowseChannelsProps) {
  const { state } = store;
  const { persona, personaInfo } = usePersona();
  const [query, setQuery] = useState('');
  const [hideJoined, setHideJoined] = useState(true);
  const [channelType, setChannelType] = useState<ChannelTypeFilter>(
    rejoinMode ? 'pending' : 'all',
  );

  const isGuest = persona === 'guest';

  // v2.3 — guest-filter telemetry (aggregate; T-1 mitigation). Fire once
  // per guest-mount of the Browse surface.
  useEffect(() => {
    if (isGuest) store.recordGuestFilter('browse');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest]);

  const allChannels: BrowseChannel[] = [
    ...CHANNELS.filter(
      (c) => c.kind === 'public' || (c.kind === 'private' && c.discoverable),
    ).map<BrowseChannel>((c) => ({ ...c })),
    ...EXTRA_CHANNELS,
  ];

  const rows = allChannels.filter((c) => {
    if (isGuest) return false;
    if (rejoinMode && !state.rejoinableChannels.includes(c.id)) return false;

    // Channel type dropdown — single filter, mutually-exclusive options.
    if (channelType === 'public' && c.kind !== 'public') return false;
    if (channelType === 'private' && c.kind !== 'private') return false;
    if (
      channelType === 'discoverable' &&
      !(c.kind === 'private' && c.discoverable)
    ) {
      return false;
    }
    if (channelType === 'pending') {
      const myReq = store.myPendingRequestForChannel(c.id, persona);
      if (!myReq) return false;
    }

    if (hideJoined && state.joinedChannels.includes(c.id)) return false;
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

  const modalContent = (
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
        <div className={styles['v2-browse-channels__search']}>
          <TextInput
            size="Medium"
            placeholder="Search channels"
            leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <div className={styles['v2-browse-channels__filter-row']}>
        <span className={styles['v2-browse-channels__result-count']}>
          {rows.length} result{rows.length === 1 ? '' : 's'}
        </span>
        <div className={styles['v2-browse-channels__filter-right']}>
          <ChannelTypeDropdown value={channelType} onChange={setChannelType} />
          <Checkbox
            size="Small"
            checked={hideJoined}
            onChange={(e) => setHideJoined(e.target.checked)}
          >
            Hide joined
          </Checkbox>
        </div>
      </div>

      <div className={styles['v2-browse-channels__list-wrap']}>
        <Scrollbars>
          {isGuest ? (
            <EmptyState
              title="No discoverable channels in this team yet."
              description="Same response shape regardless of role — guest filter applied server-side (NFR-2)."
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title={
                channelType === 'pending'
                  ? "You don't have any pending requests."
                  : rejoinMode
                    ? "You haven't left any discoverable channels yet."
                    : channelType === 'discoverable'
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
                  onRequest={() => store.openRequestToJoin(c.id)}
                  onWithdraw={() => {
                    const req = store.myPendingRequestForChannel(
                      c.id,
                      persona,
                    );
                    if (req)
                      store.withdrawRequest(personaInfo.username, req.id);
                  }}
                />
              ))}
            </ul>
          )}
        </Scrollbars>
      </div>
    </section>
  );

  return (
    <ScreenCanvas
      eyebrow="§3.3"
      title="Browse Channels modal"
      subtitle="Modal over a real ChannelShell — the underlying LHS sidebar stays visible behind the backdrop. Row prefixes for Discoverable private channels use the bare lock-plus icon only (no LabelTag)."
      canvas={
        <DpcAppShell
          focusChannelName="general"
          focusIsDiscoverable={false}
          channelHeader={
            <ChannelHeader
              type="Channel"
              name="general"
              description="Team-wide announcements and broad coordination."
              memberCount={142}
              pinnedCount={3}
            />
          }
          overlay={<AppOverlay maxWidth={760}>{modalContent}</AppOverlay>}
        >
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <EmptyState title="" description="" />
              </div>
            </Scrollbars>
          </div>
        </DpcAppShell>
      }
      reviewSummary='The "Hide joined" filter is ON by default per §3.3.3. The lock-plus prefix is the only Discoverable indicator on rows (Change 2: no LabelTag overlay).'
      reviewItems={[
        {
          heading: 'Row prefix vocabulary',
          body: (
            <p>
              Public rows: <code>#</code> (globe glyph). Private rows
              (non-discoverable): plain lock. Discoverable private rows: the
              composite lock-plus glyph at 16px, low-emphasis foreground. The
              icon shape itself carries the meaning — KD-26 subtle, WCAG 1.4.1
              shape distinction.
            </p>
          ),
        },
        {
          heading: 'Guest persona',
          body: (
            <p>
              Server-side guest filter (NFR-2) means guests see the same
              zero-result response shape as a non-guest with no eligible
              channels. No distinguishable error, no enumeration vector — T-1
              mitigation per PRD §9.
            </p>
          ),
        },
      ]}
    />
  );
}

interface BrowseRowProps {
  channel: BrowseChannel;
  isJoined: boolean;
  hasPending: boolean;
  onRequest: () => void;
  onWithdraw: () => void;
}

function BrowseRow({
  channel,
  isJoined,
  hasPending,
  onRequest,
  onWithdraw,
}: BrowseRowProps) {
  const isPrivate = channel.kind === 'private';
  const isDiscoverable = isPrivate && channel.discoverable;

  const variant: 'join' | 'view' | 'request' | 'pending' = isJoined
    ? 'view'
    : hasPending
      ? 'pending'
      : isDiscoverable
        ? 'request'
        : 'join';

  const handleAction = () => {
    if (variant === 'request') onRequest();
    else if (variant === 'pending') onWithdraw();
  };

  return (
    <li className={styles['v2-browse-channels__row']}>
      <div className={styles['v2-browse-channels__row-content']}>
        <div className={styles['v2-browse-channels__row-top']}>
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
          emphasis={
            variant === 'view'
              ? 'Secondary'
              : variant === 'pending'
                ? 'Tertiary'
                : 'Primary'
          }
          size="Small"
          onClick={handleAction}
        >
          {variant === 'view'
            ? 'View'
            : variant === 'pending'
              ? 'Withdraw'
              : variant === 'request'
                ? 'Request to join'
                : 'Join'}
        </Button>
      </div>
    </li>
  );
}

interface ChannelTypeDropdownProps {
  value: ChannelTypeFilter;
  onChange: (next: ChannelTypeFilter) => void;
}

const TYPE_OPTIONS: Array<{
  key: ChannelTypeFilter;
  label: string;
}> = [
  { key: 'all', label: 'All' },
  { key: 'public', label: 'Public' },
  { key: 'private', label: 'Private' },
  { key: 'discoverable', label: 'Discoverable private channels' },
  { key: 'pending', label: 'My pending requests' },
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
