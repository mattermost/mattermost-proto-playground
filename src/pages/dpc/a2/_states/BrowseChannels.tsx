/**
 * A2 — Browse Channels modal (end-user discovery surface).
 *
 * Visual chrome ported from the canonical Mattermost Figma (file
 * KfzKLsROKCZ7zm4S5Sdi7X, node 1364:21388): ~720px modal with a search input,
 * "Channel type" dropdown, "Hide joined" checkbox, and rows that render the
 * channel-type icon + name on top and a stack of small inline indicators
 * (Recommended, Joined, Discoverable, member count, purpose) on the bottom.
 *
 * Per §3.2.2 the wizard does not alter the end-user view — guest principals
 * still see the zero-result empty state (NFR-2 / FR-12). The A2 store's
 * `channelDiscoverableCommitted` bit overlays onto the target channel so the
 * wizard can be observed publishing the focus channel.
 */
import { useMemo, useState } from 'react';
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
import { CHANNELS, usePersona, type ChannelFixture } from '@/pages/dpc/shared';
import type { A2StoreApi } from '@/pages/dpc/a2/useA2Store';
import RequestToJoinModal from './RequestToJoinModal';
import styles from './BrowseChannels.module.scss';

export interface BrowseChannelsProps {
  store: A2StoreApi;
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
];

export default function BrowseChannels({ store }: BrowseChannelsProps) {
  const { persona } = usePersona();
  const [query, setQuery] = useState('');
  const [hideJoined, setHideJoined] = useState(false);
  const [channelType, setChannelType] = useState<'all' | 'public' | 'private'>(
    'all',
  );
  const [pendingFilter, setPendingFilter] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // Apply the wizard's committed Discoverable bit to the focus channel so the
  // list reflects the wizard outcome.
  const channels: BrowseChannel[] = useMemo(() => {
    const base: BrowseChannel[] = CHANNELS.map((c) =>
      c.id === store.targetChannel.id
        ? {
            ...c,
            discoverable: store.channelDiscoverableCommitted,
            displayName: 'loc-schwabing',
          }
        : c,
    );
    return [...base, ...EXTRA_CHANNELS];
  }, [store.targetChannel.id, store.channelDiscoverableCommitted]);

  const isGuest = persona === 'guest';

  const rows = channels.filter((c) => {
    if (isGuest) return false;
    // Public is always visible; private only when discoverable.
    if (c.kind === 'private' && !c.discoverable) return false;
    if (channelType !== 'all' && c.kind !== channelType) return false;
    if (hideJoined && store.joinedChannels.includes(c.id)) return false;
    if (pendingFilter && !store.myPendingRequests.includes(c.id)) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (
        !c.displayName.toLowerCase().includes(q) &&
        !c.purpose.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const activeChannel = activeChannelId
    ? channels.find((c) => c.id === activeChannelId) ?? null
    : null;

  return (
    <section className={styles['browse-channels']} aria-label="Browse Channels">
      <header className={styles['browse-channels__header']}>
        <div className={styles['browse-channels__header-top']}>
          <h2 className={styles['browse-channels__title']}>Browse Channels</h2>
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
          title="No channels available"
          description="Guests can only access channels they've been invited to. Ask a team admin for an invitation."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={
            pendingFilter
              ? "You don't have any pending requests."
              : 'No discoverable channels match this filter.'
          }
        />
      ) : (
        <ul className={styles['browse-channels__list']}>
          {rows.map((c) => (
            <BrowseRow
              key={c.id}
              channel={c}
              isJoined={store.joinedChannels.includes(c.id)}
              hasPending={store.myPendingRequests.includes(c.id)}
              onClick={() => setActiveChannelId(c.id)}
            />
          ))}
        </ul>
      )}

      {activeChannel && (
        <RequestToJoinModal
          store={store}
          channelId={activeChannel.id}
          channelName={activeChannel.displayName}
          channelPurpose={activeChannel.purpose}
          priorMembership={store.rejoinableChannels.includes(activeChannel.id)}
          onClose={() => setActiveChannelId(null)}
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
