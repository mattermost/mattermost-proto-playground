/**
 * DPC V2 A1 — Click-through Walkthrough.
 *
 * Stakeholder-friendly demo. NO spec chrome: no ScreenCanvas wrappers, no
 * eyebrow labels, no review notes. The reviewer drives the prototype as
 * if it were the real Mattermost app, clicking between channels to see
 * each DPC phase.
 *
 * Layout: full ChannelShell with a custom interactive sidebar. Each row
 * in the sidebar represents a different DPC phase (S1, S2, S3, S5).
 * Clicking a row activates that channel and renders its feed + header.
 * The viewer is the channel admin of `ops-planning-q3` (S2) — that's the
 * interactive demo channel. Other channels are visual fixtures so the
 * reviewer can see what each state looks like in product.
 *
 * The Browse Channels modal, channel switcher (Cmd+K), Channel Settings
 * panel, RequestToJoinModal, ConfirmCommitModal, and DeclineModal all
 * wire end-to-end through the existing `useA1V2Store` reducer.
 */
import { useEffect, useMemo, useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import CloseIcon from '@mattermost/compass-icons/components/close';
import SettingsOutlineIcon from '@mattermost/compass-icons/components/settings-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import ToastBanner from '@/components/ui/ToastBanner/ToastBanner';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import sidebarStyles from '@/components/ui/ChannelsSidebar/ChannelsSidebar.module.scss';
import itemStyles from '@/components/ui/ChannelSidebarItem/ChannelSidebarItem.module.scss';
import { PrototypeShell, SUPPORTING_USERS } from '@/pages/dpc/shared';
import ConfirmCommitModal from '../a1/_states/ConfirmCommitModal';
import DeclineModal from '../a1/_states/DeclineModal';
import RequestToJoinModal from '../a1/_states/RequestToJoinModal';
import PendingRequestsRailContent from '../a1/_components/PendingRequestsRailContent';
import { useA1V2Store, type RollbackReason } from '../a1/useA1V2Store';
import {
  BROWSEABLE_CHANNELS,
  WALKTHROUGH_CHANNELS,
  getChannelById,
  type WalkthroughChannel,
} from './channels';
import RollbackModal from './RollbackModal';
import styles from './Walkthrough.module.scss';

// ── Sidebar row primitives ──────────────────────────────────────────────────

interface SidebarRowProps {
  channel: WalkthroughChannel;
  active: boolean;
  pendingDot?: boolean;
  unread?: boolean;
  mention?: number;
  onClick: () => void;
}

function SidebarRow({
  channel,
  active,
  pendingDot = false,
  unread = false,
  mention,
  onClick,
}: SidebarRowProps) {
  const rootClass = [
    itemStyles['channel-sidebar-item'],
    active ? itemStyles['channel-sidebar-item--active'] : '',
    mention
      ? itemStyles['channel-sidebar-item--status-mention']
      : unread
        ? itemStyles['channel-sidebar-item--status-unread']
        : itemStyles['channel-sidebar-item--status-read'],
  ]
    .filter(Boolean)
    .join(' ');

  let glyph: React.ReactNode;
  if (channel.kind === 'private-discoverable') {
    glyph = (
      <span className={styles['walkthrough__lockplus']} aria-hidden>
        <LockOutlineIcon size={16} />
        <PlusIcon size={10} className={styles['walkthrough__lockplus-plus']} />
      </span>
    );
  } else if (channel.kind === 'private') {
    glyph = <LockOutlineIcon size={16} />;
  } else {
    glyph = <PoundIcon size={16} />;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={rootClass}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {active && (
        <div className={itemStyles['channel-sidebar-item__active-border']} />
      )}
      <div className={itemStyles['channel-sidebar-item__left']}>
        <div className={itemStyles['channel-sidebar-item__icon-container']}>
          {glyph}
        </div>
        <div className={itemStyles['channel-sidebar-item__content']}>
          <span className={itemStyles['channel-sidebar-item__name']}>
            {channel.displayName}
          </span>
        </div>
      </div>
      <div className={itemStyles['channel-sidebar-item__right']}>
        {pendingDot && (
          <span
            className={styles['walkthrough__pending-dot']}
            aria-hidden
            title="Pending join requests"
          />
        )}
        {mention != null && mention > 0 && (
          <span className={styles['walkthrough__mention']}>{mention}</span>
        )}
        <span className={itemStyles['channel-sidebar-item__menu-button']}>
          <IconButton
            size="X-Small"
            style="Inverted"
            icon={<DotsVerticalIcon size={12} />}
            aria-label="Channel options"
          />
        </span>
      </div>
    </div>
  );
}

interface DmRow {
  name: string;
  avatarSrc: string;
}

function DmSidebarRow({ row }: { row: DmRow }) {
  return (
    <div className={itemStyles['channel-sidebar-item']} role="button" tabIndex={0}>
      <div className={itemStyles['channel-sidebar-item__left']}>
        <div className={itemStyles['channel-sidebar-item__icon-container']}>
          <UserAvatar src={row.avatarSrc} alt={row.name} size="20" status />
        </div>
        <div className={itemStyles['channel-sidebar-item__content']}>
          <span className={itemStyles['channel-sidebar-item__name']}>
            {row.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar (interactive) ───────────────────────────────────────────────────

interface SidebarProps {
  activeId: string;
  pendingCount: number;
  onSelect: (id: string) => void;
  onOpenBrowse: () => void;
  onOpenSwitcher: () => void;
}

function Sidebar({
  activeId,
  pendingCount,
  onSelect,
  onOpenBrowse,
  onOpenSwitcher,
}: SidebarProps) {
  const dms: DmRow[] = [
    { name: 'Aiko Tan', avatarSrc: avatarAiko },
    { name: 'Arjun Patel', avatarSrc: avatarArjun },
    { name: 'Danielle Okoro', avatarSrc: avatarDanielle },
  ];

  return (
    <div className={sidebarStyles['channels-sidebar']}>
      <div className={sidebarStyles['channels-sidebar__header']}>
        <div className={sidebarStyles['channels-sidebar__team-dropdown']}>
          <span className={sidebarStyles['channels-sidebar__team-name']}>
            Contributors
          </span>
          <span className={sidebarStyles['channels-sidebar__team-chevron']}>
            <ChevronDownIcon size={16} />
          </span>
        </div>
      </div>

      <div className={sidebarStyles['channels-sidebar__navigator']}>
        <IconButton
          aria-label="Filter channels"
          size="Small"
          style="Inverted"
          padding="Compact"
          icon={<Icon size="16" glyph={<FilterVariantIcon />} />}
          className={sidebarStyles['channels-sidebar__sidebar-icon-button']}
        />
        <button
          type="button"
          className={sidebarStyles['channels-sidebar__find-channels']}
          onClick={onOpenSwitcher}
          aria-label="Find channels"
        >
          <span className={sidebarStyles['channels-sidebar__find-channels-icon']}>
            <MagnifyIcon size={16} />
          </span>
          <span className={sidebarStyles['channels-sidebar__find-channels-label']}>
            Find channels
          </span>
        </button>
      </div>

      <div className={sidebarStyles['channels-sidebar__top-group']}>
        <div className={itemStyles['channel-sidebar-item']} role="button" tabIndex={0}>
          <div className={itemStyles['channel-sidebar-item__left']}>
            <div className={itemStyles['channel-sidebar-item__icon-container']}>
              <MessageTextOutlineIcon size={16} />
            </div>
            <div className={itemStyles['channel-sidebar-item__content']}>
              <span className={itemStyles['channel-sidebar-item__name']}>
                Threads
              </span>
            </div>
          </div>
        </div>
        <div className={itemStyles['channel-sidebar-item']} role="button" tabIndex={0}>
          <div className={itemStyles['channel-sidebar-item__left']}>
            <div className={itemStyles['channel-sidebar-item__icon-container']}>
              <SendOutlineIcon size={16} />
            </div>
            <div className={itemStyles['channel-sidebar-item__content']}>
              <span className={itemStyles['channel-sidebar-item__name']}>
                Drafts
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles['walkthrough__category']}>
        <span className={styles['walkthrough__category-chevron']}>
          <ChevronDownIcon size={12} />
        </span>
        <span className={styles['walkthrough__category-label']}>Channels</span>
        <button
          type="button"
          className={styles['walkthrough__category-action']}
          onClick={onOpenBrowse}
          aria-label="Browse channels"
          title="Browse channels"
        >
          <PlusIcon size={14} />
        </button>
      </div>
      <div className={styles['walkthrough__group']}>
        {WALKTHROUGH_CHANNELS.filter((c) => c.joined).map((channel) => (
          <SidebarRow
            key={channel.id}
            channel={channel}
            active={channel.id === activeId}
            pendingDot={channel.isAdmin && pendingCount > 0}
            unread={channel.id === 'wt-release-cadence'}
            mention={channel.id === 'wt-release-cadence' ? 3 : undefined}
            onClick={() => onSelect(channel.id)}
          />
        ))}
      </div>

      <div className={styles['walkthrough__category']}>
        <span className={styles['walkthrough__category-chevron']}>
          <ChevronDownIcon size={12} />
        </span>
        <span className={styles['walkthrough__category-label']}>
          Direct Messages
        </span>
      </div>
      <div className={styles['walkthrough__group']}>
        {dms.map((row) => (
          <DmSidebarRow key={row.name} row={row} />
        ))}
      </div>
    </div>
  );
}

// ── Channel header ─────────────────────────────────────────────────────────

interface ChHeaderProps {
  channel: WalkthroughChannel;
  onOpenSettings?: () => void;
}

function ChHeader({ channel, onOpenSettings }: ChHeaderProps) {
  return (
    <ChannelHeader
      type="Channel"
      name={channel.displayName}
      description={channel.purpose}
      memberCount={channel.memberCount}
      pinnedCount={2}
      // Real Mattermost pattern: clicking the channel name opens the channel
      // menu. For the walkthrough, we wire it to open Channel Settings when
      // the viewer is the admin of this channel.
      onNameClick={channel.isAdmin ? onOpenSettings : undefined}
    />
  );
}

// ── Channel feed ────────────────────────────────────────────────────────────

interface ChannelFeedProps {
  channel: WalkthroughChannel;
}

function ChannelFeed({ channel }: ChannelFeedProps) {
  return (
    <>
      <div className={shellStyles['channel-shell__messages']}>
        <Scrollbars>
          <div className={shellStyles['channel-shell__messages-list']}>
            <MessageSeparator type="Date" label="Today" />
            {channel.messages.length === 0 ? (
              <EmptyState
                title={`Welcome to #${channel.displayName}`}
                description={channel.purpose}
              />
            ) : (
              channel.messages.map((m, idx) => {
                const sender =
                  SUPPORTING_USERS.find((u) => u.username === m.authorId) ??
                  SUPPORTING_USERS[0];
                return (
                  <Message
                    key={idx}
                    avatarSrc={sender.avatarUrl}
                    avatarAlt={sender.displayName}
                    username={sender.displayName}
                    timestamp={m.timestamp}
                  >
                    <p className={shellStyles['channel-shell__post-text']}>
                      {m.body}
                    </p>
                  </Message>
                );
              })
            )}
          </div>
        </Scrollbars>
      </div>
      <div className={shellStyles['channel-shell__message-input']}>
        <MessageInput placeholder={`Write to ${channel.displayName}`} />
      </div>
    </>
  );
}

// ── Browse Channels modal ───────────────────────────────────────────────────

interface BrowseModalProps {
  open: boolean;
  onClose: () => void;
  onRequest: (channelId: string) => void;
  pendingRequestChannelIds: Set<string>;
}

function BrowseModal({
  open,
  onClose,
  onRequest,
  pendingRequestChannelIds,
}: BrowseModalProps) {
  const [query, setQuery] = useState('');
  const [hideJoined, setHideJoined] = useState(true);

  if (!open) return null;

  const joined = WALKTHROUGH_CHANNELS;
  const all = [...joined, ...BROWSEABLE_CHANNELS];
  const rows = all.filter((c) => {
    if (hideJoined && c.joined) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        c.displayName.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className={styles['walkthrough__overlay']} role="presentation">
      <section
        className={styles['walkthrough__browse-modal']}
        role="dialog"
        aria-modal="true"
        aria-label="Browse Channels"
      >
        <header className={styles['walkthrough__browse-header']}>
          <h2 className={styles['walkthrough__browse-title']}>Browse Channels</h2>
          <div className={styles['walkthrough__browse-actions']}>
            <Button emphasis="Secondary" size="Small">
              Create New Channel
            </Button>
            <IconButton
              aria-label="Close"
              size="Small"
              icon={<Icon size="16" glyph={<CloseIcon />} />}
              onClick={onClose}
            />
          </div>
        </header>
        <div className={styles['walkthrough__browse-search']}>
          <TextInput
            size="Medium"
            placeholder="Search channels"
            leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={styles['walkthrough__browse-filter-row']}>
          <span className={styles['walkthrough__browse-count']}>
            {rows.length} result{rows.length === 1 ? '' : 's'}
          </span>
          <Checkbox
            size="Small"
            checked={hideJoined}
            onChange={(e) => setHideJoined(e.target.checked)}
          >
            Hide joined
          </Checkbox>
        </div>
        <div className={styles['walkthrough__browse-list-wrap']}>
          <Scrollbars>
            {rows.length === 0 ? (
              <EmptyState title="No channels found." />
            ) : (
              <ul className={styles['walkthrough__browse-list']}>
                {rows.map((c) => (
                  <BrowseRow
                    key={c.id}
                    channel={c}
                    hasPending={pendingRequestChannelIds.has(c.id)}
                    onRequest={() => onRequest(c.id)}
                  />
                ))}
              </ul>
            )}
          </Scrollbars>
        </div>
      </section>
    </div>
  );
}

function BrowseRow({
  channel,
  hasPending,
  onRequest,
}: {
  channel: WalkthroughChannel;
  hasPending: boolean;
  onRequest: () => void;
}) {
  const isDpc = channel.kind === 'private-discoverable';
  const isPublic = channel.kind === 'public';

  let variant: 'view' | 'pending' | 'request' | 'join';
  if (channel.joined) variant = 'view';
  else if (hasPending) variant = 'pending';
  else if (isDpc) variant = 'request';
  else variant = 'join';

  return (
    <li className={styles['walkthrough__browse-row']}>
      <div className={styles['walkthrough__browse-row-content']}>
        <div className={styles['walkthrough__browse-row-top']}>
          {isDpc ? (
            <span
              className={styles['walkthrough__lockplus']}
              aria-label="Discoverable private channel"
              role="img"
            >
              <LockOutlineIcon size={16} />
              <PlusIcon
                size={10}
                className={styles['walkthrough__lockplus-plus']}
              />
            </span>
          ) : (
            <Icon
              size="16"
              glyph={isPublic ? <GlobeIcon /> : <LockOutlineIcon />}
            />
          )}
          <span className={styles['walkthrough__browse-row-name']}>
            {channel.displayName}
          </span>
        </div>
        <div className={styles['walkthrough__browse-row-bottom']}>
          {channel.joined && (
            <>
              <span className={styles['walkthrough__browse-indicator-joined']}>
                Joined
              </span>
              <span className={styles['walkthrough__browse-dot']} aria-hidden />
            </>
          )}
          {hasPending && (
            <>
              <span className={styles['walkthrough__browse-indicator-pending']}>
                Pending
              </span>
              <span className={styles['walkthrough__browse-dot']} aria-hidden />
            </>
          )}
          <span className={styles['walkthrough__browse-member-count']}>
            <Icon size="12" glyph={<AccountMultipleOutlineIcon />} />
            {channel.memberCount}
          </span>
          <span className={styles['walkthrough__browse-dot']} aria-hidden />
          <span className={styles['walkthrough__browse-purpose']}>
            {channel.purpose}
          </span>
        </div>
      </div>
      <div>
        <Button
          emphasis={
            variant === 'view'
              ? 'Secondary'
              : variant === 'pending'
                ? 'Tertiary'
                : 'Primary'
          }
          size="Small"
          onClick={() => {
            if (variant === 'request') onRequest();
          }}
          disabled={variant === 'view' || variant === 'pending' || variant === 'join'}
        >
          {variant === 'view'
            ? 'View'
            : variant === 'pending'
              ? 'Pending'
              : variant === 'request'
                ? 'Request to join'
                : 'Join'}
        </Button>
      </div>
    </li>
  );
}

// ── Channel switcher (Cmd+K) ────────────────────────────────────────────────

interface SwitcherProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onRequestDpc: (channelId: string) => void;
}

function SwitcherModal({
  open,
  onClose,
  onSelect,
  onRequestDpc,
}: SwitcherProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  const joined = WALKTHROUGH_CHANNELS.filter((c) => c.joined);
  const requestable = BROWSEABLE_CHANNELS.filter(
    (c) => c.kind === 'private-discoverable',
  );

  const q = query.trim().toLowerCase();
  const matchedJoined = q
    ? joined.filter((c) => c.displayName.toLowerCase().includes(q))
    : joined;
  const matchedRequestable = q
    ? requestable.filter((c) => c.displayName.toLowerCase().includes(q))
    : requestable;

  return (
    <div
      className={styles['walkthrough__overlay']}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={styles['walkthrough__switcher']}
        role="dialog"
        aria-modal="true"
        aria-label="Find channels"
      >
        <header className={styles['walkthrough__switcher-header']}>
          <h3 className={styles['walkthrough__switcher-title']}>
            Find channels
          </h3>
          <IconButton
            size="Small"
            icon={<CloseIcon size={20} />}
            aria-label="Close"
            onClick={onClose}
          />
        </header>
        <div className={styles['walkthrough__switcher-search']}>
          <TextInput
            size="Medium"
            placeholder="Search"
            leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className={styles['walkthrough__switcher-body']}>
          <Scrollbars>
            <SwitcherSection heading="Your channels">
              {matchedJoined.map((c) => (
                <SwitcherRow
                  key={c.id}
                  channel={c}
                  onClick={() => {
                    onSelect(c.id);
                    onClose();
                  }}
                />
              ))}
            </SwitcherSection>
            {matchedRequestable.length > 0 && (
              <SwitcherSection heading="Channels you can request to join">
                {matchedRequestable.map((c) => (
                  <SwitcherRow
                    key={c.id}
                    channel={c}
                    showRequestCta
                    onRequest={() => {
                      onRequestDpc(c.id);
                      onClose();
                    }}
                  />
                ))}
              </SwitcherSection>
            )}
            {matchedJoined.length === 0 &&
              matchedRequestable.length === 0 && (
                <div className={styles['walkthrough__switcher-empty']}>
                  <EmptyState title="No channels found." />
                </div>
              )}
          </Scrollbars>
        </div>
      </section>
    </div>
  );
}

function SwitcherSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles['walkthrough__switcher-section']}>
      <h4 className={styles['walkthrough__switcher-heading']}>{heading}</h4>
      <div>{children}</div>
    </section>
  );
}

function SwitcherRow({
  channel,
  showRequestCta = false,
  onClick,
  onRequest,
}: {
  channel: WalkthroughChannel;
  showRequestCta?: boolean;
  onClick?: () => void;
  onRequest?: () => void;
}) {
  const isDpc = channel.kind === 'private-discoverable';
  return (
    <div
      className={styles['walkthrough__switcher-row']}
      role="button"
      tabIndex={0}
      onClick={() => (showRequestCta ? null : onClick?.())}
    >
      <span className={styles['walkthrough__switcher-row-icon']}>
        {isDpc ? (
          <span className={styles['walkthrough__lockplus']} aria-hidden>
            <LockOutlineIcon size={16} />
            <PlusIcon
              size={10}
              className={styles['walkthrough__lockplus-plus']}
            />
          </span>
        ) : channel.kind === 'private' ? (
          <LockOutlineIcon size={16} />
        ) : (
          <PoundIcon size={16} />
        )}
      </span>
      <span className={styles['walkthrough__switcher-row-name']}>
        {channel.displayName}
      </span>
      <span className={styles['walkthrough__switcher-row-tail']}>
        {showRequestCta ? (
          <Button
            emphasis="Tertiary"
            size="X-Small"
            onClick={(e) => {
              e.stopPropagation();
              onRequest?.();
            }}
          >
            Request to join
          </Button>
        ) : (
          <span className={styles['walkthrough__switcher-row-team']}>
            Contributors
          </span>
        )}
      </span>
    </div>
  );
}

// ── Channel Settings modal (tabbed: Info + Membership Policies + …) ─────────

type SettingsTab =
  | 'info'
  | 'membership-policies'
  | 'configuration'
  | 'channel-actions'
  | 'archive';

interface PolicyRule {
  id: string;
  attribute: string;
  operator: string;
  values: string;
}

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  channel: WalkthroughChannel;
  store: ReturnType<typeof useA1V2Store>;
}

const SEED_POLICY_RULES: PolicyRule[] = [
  { id: 'r1', attribute: 'Program', operator: 'is', values: 'Dragon Spacecraft' },
  { id: 'r2', attribute: 'Clearance', operator: 'is', values: 'Confidential' },
];

function SettingsPanel({ open, onClose, channel, store }: SettingsPanelProps) {
  const [tab, setTab] = useState<SettingsTab>('info');
  const [dirty, setDirty] = useState(false);
  const [discoverableDraft, setDiscoverableDraft] = useState(
    store.state.channelDiscoverable,
  );
  const [rules, setRules] = useState<PolicyRule[]>(SEED_POLICY_RULES);
  const [autoAddDraft, setAutoAddDraft] = useState(store.state.autoAddEnabled);

  // Sync draft state when the modal opens or the underlying store changes.
  useEffect(() => {
    if (open) {
      setDiscoverableDraft(store.state.channelDiscoverable);
      setAutoAddDraft(store.state.autoAddEnabled);
      setDirty(false);
      setTab('info');
    }
  }, [open, store.state.channelDiscoverable, store.state.autoAddEnabled]);

  if (!open) return null;

  const handleSave = () => {
    // Discoverable toggle change fires the SG2 Confirm-and-Commit modal.
    if (discoverableDraft !== store.state.channelDiscoverable) {
      store.openToggleConfirm(
        'ops.coord',
        discoverableDraft ? 'enable-typical' : 'disable-with-pending',
      );
    }
    // Auto-add toggle persists directly — per VP-5 guidance auto-add is
    // existing functionality and doesn't require a DPC-specific modal.
    if (autoAddDraft !== store.state.autoAddEnabled) {
      store.setAutoAdd(autoAddDraft, 'ops.coord');
    }
    onClose();
  };

  const tabs: Array<{ key: SettingsTab; label: string; icon?: React.ReactNode }> = [
    { key: 'info', label: 'Info' },
    { key: 'membership-policies', label: 'Membership Policies' },
    { key: 'configuration', label: 'Configuration' },
    { key: 'channel-actions', label: 'Channel Actions' },
    { key: 'archive', label: 'Archive channel' },
  ];

  return (
    <div className={styles['walkthrough__overlay']} role="presentation">
      <section
        className={styles['walkthrough__settings-modal']}
        role="dialog"
        aria-modal="true"
        aria-label="Channel Settings"
      >
        <header className={styles['walkthrough__settings-header']}>
          <h2 className={styles['walkthrough__settings-title']}>
            Channel Settings
            <span className={styles['walkthrough__settings-sub']}>
              {channel.displayName}
            </span>
          </h2>
          <IconButton
            size="Small"
            icon={<CloseIcon size={20} />}
            aria-label="Close"
            onClick={onClose}
          />
        </header>

        <div className={styles['walkthrough__settings-shell']}>
          <nav
            className={styles['walkthrough__settings-sidebar']}
            aria-label="Settings sections"
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={[
                  styles['walkthrough__settings-tab'],
                  tab === t.key
                    ? styles['walkthrough__settings-tab--active']
                    : '',
                ].join(' ')}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className={styles['walkthrough__settings-main']}>
            <Scrollbars>
              <div className={styles['walkthrough__settings-content']}>
                {tab === 'info' && (
                  <InfoTab
                    channel={channel}
                    discoverableDraft={discoverableDraft}
                    onToggle={() => {
                      setDiscoverableDraft((v) => !v);
                      setDirty(true);
                    }}
                  />
                )}
                {tab === 'membership-policies' && (
                  <MembershipPoliciesTab
                    rules={rules}
                    onAddRule={() => {
                      setRules((r) => [
                        ...r,
                        {
                          id: `r${r.length + 1}`,
                          attribute: '',
                          operator: 'is',
                          values: '',
                        },
                      ]);
                      setDirty(true);
                    }}
                    onRemoveRule={(id) => {
                      setRules((r) => r.filter((row) => row.id !== id));
                      setDirty(true);
                    }}
                    autoAdd={autoAddDraft}
                    autoAddDisabled={rules.length === 0}
                    onToggleAutoAdd={() => {
                      setAutoAddDraft((v) => !v);
                      setDirty(true);
                    }}
                  />
                )}
                {tab === 'configuration' && (
                  <EmptyState
                    title="Configuration"
                    description="Configuration options not in scope for this walkthrough."
                  />
                )}
                {tab === 'channel-actions' && (
                  <EmptyState
                    title="Channel Actions"
                    description="Channel actions not in scope for this walkthrough."
                  />
                )}
                {tab === 'archive' && (
                  <EmptyState
                    title="Archive channel"
                    description="Archive controls not in scope for this walkthrough."
                  />
                )}
              </div>
            </Scrollbars>
          </div>
        </div>

        <footer className={styles['walkthrough__settings-footer-bar']}>
          <Button emphasis="Tertiary" size="Medium" onClick={onClose}>
            Cancel
          </Button>
          <Button
            emphasis="Primary"
            size="Medium"
            disabled={!dirty}
            onClick={handleSave}
          >
            Save changes
          </Button>
        </footer>
      </section>
    </div>
  );
}

// ── Settings — Info tab ─────────────────────────────────────────────────────

function InfoTab({
  channel,
  discoverableDraft,
  onToggle,
}: {
  channel: WalkthroughChannel;
  discoverableDraft: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles['walkthrough__info-tab']}>
      <SectionNotice
        type="Info"
        title="Channel name and purpose"
        description={
          <>
            <strong>{channel.displayName}</strong> — {channel.purpose}
          </>
        }
      />

      <div className={styles['walkthrough__settings-row']}>
        <div className={styles['walkthrough__settings-row-text']}>
          <div className={styles['walkthrough__settings-row-label']}>
            Discoverable
          </div>
          <div className={styles['walkthrough__settings-row-help']}>
            Allow eligible non-members to find this channel in Browse, the
            channel switcher, and permalink unfurls. Content stays private;
            they can request to join.
          </div>
        </div>
        <Switch
          checked={discoverableDraft}
          onChange={onToggle}
          aria-label="Discoverable"
        />
      </div>
    </div>
  );
}

// ── Settings — Membership Policies tab ──────────────────────────────────────

interface MembershipPoliciesTabProps {
  rules: PolicyRule[];
  onAddRule: () => void;
  onRemoveRule: (id: string) => void;
  autoAdd: boolean;
  autoAddDisabled: boolean;
  onToggleAutoAdd: () => void;
}

function MembershipPoliciesTab({
  rules,
  onAddRule,
  onRemoveRule,
  autoAdd,
  autoAddDisabled,
  onToggleAutoAdd,
}: MembershipPoliciesTabProps) {
  return (
    <div className={styles['walkthrough__policies-tab']}>
      <SectionNotice
        type="Info"
        title="System access policy applied to this channel"
        description={
          <>
            This channel has a system-level access policy applied:{' '}
            <strong>Confidential DS-BP</strong>. Any custom access rules you
            set here will be applied in addition to this policy.
          </>
        }
      />

      <div className={styles['walkthrough__policies-section']}>
        <div className={styles['walkthrough__policies-section-head']}>
          <h3 className={styles['walkthrough__policies-section-title']}>
            Membership Rules
          </h3>
          <p className={styles['walkthrough__policies-section-help']}>
            Select user attributes and values as rules to restrict channel
            membership
          </p>
        </div>

        <div className={styles['walkthrough__policies-table']}>
          <div className={styles['walkthrough__policies-table-header']}>
            <span>Attribute/Policy</span>
            <span>Operator</span>
            <span>Values</span>
            <span />
          </div>
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={styles['walkthrough__policies-table-row']}
            >
              <span className={styles['walkthrough__policies-cell-attr']}>
                <span className={styles['walkthrough__policies-cell-drag']}>
                  ⋮⋮
                </span>
                {rule.attribute}
              </span>
              <span className={styles['walkthrough__policies-cell-op']}>
                = {rule.operator}
              </span>
              <span className={styles['walkthrough__policies-cell-values']}>
                {rule.values}
              </span>
              <button
                type="button"
                className={styles['walkthrough__policies-cell-remove']}
                aria-label={`Remove ${rule.attribute} rule`}
                onClick={() => onRemoveRule(rule.id)}
              >
                <CloseIcon size={14} />
              </button>
            </div>
          ))}
          <div className={styles['walkthrough__policies-table-add']}>
            <Button emphasis="Tertiary" size="Small" onClick={onAddRule}>
              + Select attribute
            </Button>
          </div>
        </div>

        <div className={styles['walkthrough__policies-help-row']}>
          <p className={styles['walkthrough__policies-help-text']}>
            Each row is a single condition that must be met for a user to
            comply with the policy. All rules are combined with logical AND
            operator (&&).
          </p>
          <Button emphasis="Tertiary" size="Small">
            Test access rules
          </Button>
        </div>
      </div>

      <hr className={styles['walkthrough__policies-divider']} />

      <div className={styles['walkthrough__policies-autoadd']}>
        <Checkbox
          size="Small"
          checked={autoAdd}
          disabled={autoAddDisabled}
          onChange={onToggleAutoAdd}
        >
          Auto-add members based on access rules
        </Checkbox>
        <p className={styles['walkthrough__policies-autoadd-help']}>
          {autoAddDisabled
            ? 'Add at least one Membership Rule above to enable Auto-add.'
            : 'Users who match the configured attribute values will be automatically added as members.'}
        </p>
      </div>
    </div>
  );
}

// ── Channel-not-member empty state ──────────────────────────────────────────

function NonMemberView({
  channel,
  onRequest,
}: {
  channel: WalkthroughChannel;
  onRequest: () => void;
}) {
  return (
    <div className={styles['walkthrough__non-member']}>
      <EmptyState
        title={`#${channel.displayName} is a Discoverable private channel`}
        description={`${channel.purpose} You're not a member yet — a channel admin will review your request.`}
        action={{
          emphasis: 'Primary',
          children: 'Request to join',
          onClick: onRequest,
        }}
      />
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function Walkthrough() {
  return (
    <PrototypeShell label="DPC V2 A1: Click-through walkthrough">
      <WalkthroughInner />
    </PrototypeShell>
  );
}

function WalkthroughInner() {
  const store = useA1V2Store();
  const [activeId, setActiveId] = useState<string>('ops-planning-q3');
  const [browseOpen, setBrowseOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeChannel = useMemo(
    () => getChannelById(activeId) ?? WALKTHROUGH_CHANNELS[0],
    [activeId],
  );

  // Cmd/Ctrl+K opens the switcher.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSwitcherOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setBrowseOpen(false);
        setSwitcherOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-dismiss the post-save toast after 4s.
  useEffect(() => {
    if (!store.state.recentlySaved) return;
    const t = window.setTimeout(() => store.dismissToast(), 4000);
    return () => window.clearTimeout(t);
  }, [store, store.state.recentlySaved]);

  const pendingCount = store.state.pendingRequests.length;
  const pendingRequestChannelIds = useMemo(() => {
    const ids = new Set<string>();
    if (store.state.activeRequestChannelId)
      ids.add(store.state.activeRequestChannelId);
    return ids;
  }, [store.state.activeRequestChannelId]);

  const handleRequestDpc = (channelId: string) => {
    // For walkthrough purposes, all Request-to-join flows route through the
    // store's RequestToJoinModal page-overlay. The store's
    // activeRequestChannelId drives which channel the modal targets.
    store.openRequestToJoin(channelId);
  };

  // The interactive demo channel — ops-planning-q3 — exposes the Channel
  // Settings affordance + right-rail Pending Requests panel.
  const isInteractive = activeChannel.id === 'ops-planning-q3';

  // For S3-match channels the viewer is a member of (e.g., west-taskforce),
  // we render the regular channel feed. For BROWSEABLE channels (legal-
  // discuss etc.) the viewer is not a member — those can only be reached
  // by clicking a row in Browse / switcher and trigger the RTJ modal.

  return (
    <div className={styles['walkthrough']}>
      {store.state.recentlySaved && (
        <div className={styles['walkthrough__toast']}>
          <ToastBanner
            type="Success"
            message="Saved. Audit event recorded."
            onDismiss={() => store.dismissToast()}
          />
        </div>
      )}

      <ChannelShell
        channelsSidebar={
          <Sidebar
            activeId={activeId}
            pendingCount={pendingCount}
            onSelect={setActiveId}
            onOpenBrowse={() => setBrowseOpen(true)}
            onOpenSwitcher={() => setSwitcherOpen(true)}
          />
        }
        channelHeader={
          <ChHeader
            channel={activeChannel}
            onOpenSettings={
              isInteractive ? () => setSettingsOpen(true) : undefined
            }
          />
        }
        trailing={
          isInteractive ? (
            <PendingRequestsRailContent store={store} />
          ) : undefined
        }
      >
        {activeChannel.joined ? (
          <ChannelFeed channel={activeChannel} />
        ) : (
          <NonMemberView
            channel={activeChannel}
            onRequest={() => handleRequestDpc(activeChannel.id)}
          />
        )}
      </ChannelShell>

      {/* Floating "Channel Settings" pill — visible only on the interactive
          admin channel. Real Mattermost would expose Settings via the channel
          name dropdown; this pill is the unmistakable walkthrough affordance. */}
      {isInteractive && (
        <button
          type="button"
          className={styles['walkthrough__settings-fab']}
          onClick={() => setSettingsOpen(true)}
          aria-label="Channel settings"
        >
          <SettingsOutlineIcon size={16} />
          <span>Channel Settings</span>
        </button>
      )}

      <BrowseModal
        open={browseOpen}
        onClose={() => setBrowseOpen(false)}
        onRequest={(channelId) => {
          setBrowseOpen(false);
          handleRequestDpc(channelId);
        }}
        pendingRequestChannelIds={pendingRequestChannelIds}
      />

      <SwitcherModal
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        onSelect={setActiveId}
        onRequestDpc={handleRequestDpc}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        channel={activeChannel}
        store={store}
      />

      {/* Reviewer affordance — arm an atomicity rollback for the next
          Confirm-and-Commit. Hidden in production; visible in this
          walkthrough so stakeholders can exercise the §4.6 error path. */}
      <ReviewerToolbar store={store} />

      {/* Page-level overlays — render when triggered via store. */}
      <ConfirmCommitModal store={store} />
      <DeclineModal store={store} />
      <RequestToJoinModal store={store} />
      <RollbackModal store={store} />
    </div>
  );
}

// ── Reviewer affordance: simulate atomicity rollback ────────────────────────

function ReviewerToolbar({ store }: { store: ReturnType<typeof useA1V2Store> }) {
  const armed = store.state.simulateRollbackReason;
  const reasons: Array<{ key: RollbackReason; label: string }> = [
    { key: 'stale_policy_hash', label: 'stale_policy_hash' },
    { key: 'stale_channel_version', label: 'stale_channel_version' },
    { key: 'stale_pending_request_count', label: 'stale_pending_request_count' },
    { key: 'acknowledgment_token_expired', label: 'acknowledgment_token_expired' },
    { key: 'server_error', label: 'server_error' },
  ];
  return (
    <div className={styles['walkthrough__reviewer-toolbar']}>
      <span className={styles['walkthrough__reviewer-toolbar-label']}>
        Reviewer aid · arm rollback on next Confirm:
      </span>
      <select
        className={styles['walkthrough__reviewer-toolbar-select']}
        value={armed ?? ''}
        onChange={(e) =>
          store.simulateRollback(
            e.target.value === ''
              ? null
              : (e.target.value as RollbackReason),
          )
        }
        aria-label="Simulate rollback reason"
      >
        <option value="">(none — commit will succeed)</option>
        {reasons.map((r) => (
          <option key={r.key} value={r.key}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
