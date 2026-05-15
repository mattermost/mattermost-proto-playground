/**
 * DPC A1 — Browse Channels modal (US-1).
 *
 * Visual chrome ported from the canonical Mattermost Figma (file
 * KfzKLsROKCZ7zm4S5Sdi7X, node 1364:21388): a ~720px modal with a Search
 * input, "Channel type" dropdown, "Hide joined" checkbox, and rows that
 * show channel-type icon + name on top and a stack of small inline indicators
 * (Recommended, Joined, Discoverable, member count, purpose) on the bottom.
 *
 * Per §3.1.2 the list combines public + discoverable private channels (NFR-1
 * exposes only name + purpose to non-members). Clicking a row opens the
 * existing two-step Request-to-Join modal.
 *
 * Guest persona renders the empty zero-result state (NFR-2 / T-1
 * enumeration-resistant response). The optional `rejoinMode` prop scopes the
 * list to channels the persona previously left and applies a "My Pending"
 * filter chip — kept for reviewer parity with the A1 L&R overlay surface.
 */
import { useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Button from '@/components/ui/Button/Button';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
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
import type { A1StoreApi } from '../useA1Store';
import RequestToJoinModal from './RequestToJoinModal';
import styles from './BrowseChannels.module.scss';

export interface BrowseChannelsProps {
  store: A1StoreApi;
  /** When rendering the L&R overlay, scopes the list to rejoinable channels. */
  rejoinMode?: boolean;
}

interface BrowseChannel extends ChannelFixture {
  recommended?: boolean;
}

// Extra catalogue rows so the Browse list reads like the Figma reference
// (more variety than the focus-channel fixture). These never trigger real
// store mutations — clicking them opens the standard Request-to-Join modal
// against a synthetic ChannelFixture.
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
];

export default function BrowseChannels({
  store,
  rejoinMode = false,
}: BrowseChannelsProps) {
  const { state } = store;
  const { persona } = usePersona();
  const [query, setQuery] = useState('');
  const [hideJoined, setHideJoined] = useState(false);
  const [channelType, setChannelType] = useState<'all' | 'public' | 'private'>(
    'all',
  );
  const [activeRequestChannelId, setActiveRequestChannelId] = useState<
    string | null
  >(null);
  const [pendingFilter, setPendingFilter] = useState(rejoinMode);

  const isGuest = persona === 'guest';

  // Combine focus fixtures + extra catalogue. loc-schwabing is rendered from
  // the focus channel (private + discoverable) so the Discoverable indicator
  // appears with its real fixture name.
  const allChannels: BrowseChannel[] = [
    ...CHANNELS.filter(
      (c) => c.kind === 'public' || (c.kind === 'private' && c.discoverable),
    ).map<BrowseChannel>((c) => ({
      ...c,
      // Treat the channel-admin focus channel display name as the
      // "loc-schwabing" reference channel — keeps the row visible in the list.
      displayName:
        c.id === 'ch-002' ? 'loc-schwabing' : c.displayName,
    })),
    ...EXTRA_CHANNELS,
  ];

  const rows = allChannels.filter((c) => {
    if (isGuest) return false;
    if (rejoinMode && !state.rejoinableChannels.includes(c.id)) return false;
    if (channelType !== 'all' && c.kind !== channelType) return false;
    if (hideJoined && state.joinedChannels.includes(c.id)) return false;
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

  const activeRequestChannel = activeRequestChannelId
    ? allChannels.find((c) => c.id === activeRequestChannelId) ?? null
    : null;

  return (
    <section
      className={styles['browse-channels']}
      aria-label={rejoinMode ? 'Channels you can rejoin' : 'Browse Channels'}
    >
      <header className={styles['browse-channels__header']}>
        <div className={styles['browse-channels__header-top']}>
          <h2 className={styles['browse-channels__title']}>
            {rejoinMode ? 'Channels you can rejoin' : 'Browse Channels'}
          </h2>
          <div className={styles['browse-channels__header-actions']}>
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
      </header>

      <div className={styles['browse-channels__filter-row']}>
        <span className={styles['browse-channels__result-count']}>
          {rows.length} result{rows.length === 1 ? '' : 's'}
        </span>
        <div className={styles['browse-channels__filter-controls']}>
          {pendingFilter && (
            <Chip
              size="Small"
              tone="info"
              onRemove={() => setPendingFilter(false)}
            >
              My Pending
            </Chip>
          )}
          <ChannelTypeDropdown value={channelType} onChange={setChannelType} />
          <span className={styles['browse-channels__hide-joined']}>
            <Checkbox
              size="Small"
              checked={hideJoined}
              onChange={(e) =>
                setHideJoined((e.target as HTMLInputElement).checked)
              }
            >
              Hide joined
            </Checkbox>
          </span>
          {!pendingFilter && (
            <Button
              emphasis="Quaternary"
              size="Small"
              onClick={() => setPendingFilter(true)}
            >
              My Pending
            </Button>
          )}
        </div>
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
                : 'No discoverable channels in this team yet.'
          }
        />
      ) : (
        <ul className={styles['browse-channels__list']}>
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

      {activeRequestChannel && (
        <RequestToJoinModal
          store={store}
          channel={activeRequestChannel}
          isRejoinFlow={
            rejoinMode ||
            state.rejoinableChannels.includes(activeRequestChannel.id)
          }
          onClose={() => setActiveRequestChannelId(null)}
        />
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

  // Hover-action variant selection per Figma node 1365:21984.
  //   Variant A — public + unjoined → solid "Join" (prototype no-op).
  //   Variant B — already joined → outlined "View" (no-op).
  //   Variant C — private + discoverable + unjoined → solid "Request to
  //   Join", opens the existing RequestToJoinModal via the row handler.
  const variant: 'join' | 'view' | 'request' = isJoined
    ? 'view'
    : isDiscoverable
      ? 'request'
      : 'join';

  const handleAction = () => {
    if (variant === 'request') onClick();
  };

  return (
    <li className={styles['browse-channels__row']}>
      <div className={styles['browse-channels__row-content']}>
        <div className={styles['browse-channels__row-top']}>
          <Icon
            size="16"
            glyph={isPrivate ? <LockOutlineIcon /> : <GlobeIcon />}
          />
          <span className={styles['browse-channels__row-name']}>
            {channel.displayName}
          </span>
        </div>
        <div className={styles['browse-channels__row-bottom']}>
          {channel.recommended && (
            <>
              <span
                className={[
                  styles['browse-channels__indicator'],
                  styles['browse-channels__indicator--info'],
                ].join(' ')}
              >
                <Icon size="12" glyph={<LightbulbOutlineIcon />} />
                Recommended
              </span>
              <span
                className={styles['browse-channels__dot-separator']}
                aria-hidden
              />
            </>
          )}
          {isJoined && (
            <>
              <span
                className={[
                  styles['browse-channels__indicator'],
                  styles['browse-channels__indicator--success'],
                ].join(' ')}
              >
                <Icon size="12" glyph={<CheckIcon />} />
                Joined
              </span>
              <span
                className={styles['browse-channels__dot-separator']}
                aria-hidden
              />
            </>
          )}
          {isDiscoverable && (
            <>
              <span
                className={[
                  styles['browse-channels__indicator'],
                  styles['browse-channels__indicator--info'],
                ].join(' ')}
              >
                <Icon size="12" glyph={<LockOutlineIcon />} />
                Discoverable
              </span>
              <span
                className={styles['browse-channels__dot-separator']}
                aria-hidden
              />
            </>
          )}
          {hasPending && (
            <>
              <span
                className={[
                  styles['browse-channels__indicator'],
                  styles['browse-channels__indicator--neutral'],
                ].join(' ')}
              >
                Pending
              </span>
              <span
                className={styles['browse-channels__dot-separator']}
                aria-hidden
              />
            </>
          )}
          <span className={styles['browse-channels__member-count']}>
            <Icon size="12" glyph={<AccountMultipleOutlineIcon />} />
            {channel.memberCount}
          </span>
          <span
            className={styles['browse-channels__dot-separator']}
            aria-hidden
          />
          <span className={styles['browse-channels__purpose']}>
            {channel.purpose}
          </span>
        </div>
      </div>
      <div className={styles['browse-channels__row-action']}>
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
    <div className={styles['browse-channels__dropdown']}>
      <button
        type="button"
        className={styles['browse-channels__dropdown-trigger']}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>Channel type: {current}</span>
        <Icon size="12" glyph={<ChevronDownIcon />} />
      </button>
      {open && (
        <ul
          className={styles['browse-channels__dropdown-menu']}
          role="listbox"
        >
          {TYPE_OPTIONS.map((o) => (
            <li key={o.key}>
              <button
                type="button"
                className={[
                  styles['browse-channels__dropdown-item'],
                  o.key === value
                    ? styles['browse-channels__dropdown-item--active']
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
