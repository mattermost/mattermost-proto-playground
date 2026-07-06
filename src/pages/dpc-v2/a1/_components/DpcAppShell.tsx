/**
 * DpcAppShell — wraps a DPC V2 state in a real ChannelShell so that
 * modals, rails, and feed messages render with the actual app chrome.
 *
 * The sidebar is customised for the DPC scenario: it includes the focus
 * channel ("ops-planning-q3") as an active private item, with a bare 16px
 * lock-plus icon as the row glyph (Change 2: no "Discoverable" LabelTag).
 *
 * Use the `overlay`, `channelHeader`, `children`, and `trailing` props to
 * compose modals, headers, feeds, and right-rails on top of the shell.
 */
import type { ReactNode } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import sidebarStyles from '@/components/ui/ChannelsSidebar/ChannelsSidebar.module.scss';
import itemStyles from '@/components/ui/ChannelSidebarItem/ChannelSidebarItem.module.scss';
import styles from './DpcAppShell.module.scss';

export interface DpcAppShellProps {
  channelHeader?: ReactNode;
  children?: ReactNode;
  trailing?: ReactNode;
  overlay?: ReactNode;
  /**
   * Override the active focus channel name shown in the LHS sidebar.
   * Default: 'ops-planning-q3'.
   */
  focusChannelName?: string;
  /**
   * Show the bare lock-plus glyph on the focus channel row (DPC channel).
   * Default: true.
   */
  focusIsDiscoverable?: boolean;
  /** Show pending-requests dot on the active focus row. Default: false. */
  focusHasPendingDot?: boolean;
  /**
   * Optional pending count on the active channel item.
   * Surface a small blue dot indicator (KD-26 subtle).
   */
  pendingDotChannels?: string[];
  className?: string;
}

interface ItemRow {
  name: string;
  type: 'public' | 'private' | 'dm' | 'gm' | 'private-discoverable';
  active?: boolean;
  unread?: boolean;
  mention?: number;
  avatarSrc?: string;
  avatarAlt?: string;
  pendingDot?: boolean;
}

/**
 * Single channel-row render that matches the production sidebar's shape but
 * supports the composite lock-plus glyph for Discoverable rows (bare icon —
 * no LabelTag overlay, per Change 2).
 */
function SidebarRow({ row }: { row: ItemRow }) {
  const rootClass = [
    itemStyles['channel-sidebar-item'],
    row.active ? itemStyles['channel-sidebar-item--active'] : '',
    row.mention
      ? itemStyles['channel-sidebar-item--status-mention']
      : row.unread
        ? itemStyles['channel-sidebar-item--status-unread']
        : itemStyles['channel-sidebar-item--status-read'],
  ]
    .filter(Boolean)
    .join(' ');

  let glyph: ReactNode;
  if (row.type === 'private-discoverable') {
    glyph = (
      <span className={styles['dpc-app-shell__lockplus']} aria-hidden>
        <LockOutlineIcon size={16} />
        <PlusIcon
          size={10}
          className={styles['dpc-app-shell__lockplus-plus']}
        />
      </span>
    );
  } else if (row.type === 'private') {
    glyph = <LockOutlineIcon size={16} />;
  } else if (row.type === 'dm') {
    glyph = (
      <UserAvatar
        src={row.avatarSrc ?? ''}
        alt={row.avatarAlt ?? row.name}
        size="20"
        status
      />
    );
  } else {
    glyph = <PoundIcon size={16} />;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={rootClass}
      aria-current={row.active ? 'page' : undefined}
    >
      {row.active && (
        <div className={itemStyles['channel-sidebar-item__active-border']} />
      )}
      <div className={itemStyles['channel-sidebar-item__left']}>
        <div className={itemStyles['channel-sidebar-item__icon-container']}>
          {glyph}
        </div>
        <div className={itemStyles['channel-sidebar-item__content']}>
          <span className={itemStyles['channel-sidebar-item__name']}>
            {row.name}
          </span>
        </div>
      </div>
      <div className={itemStyles['channel-sidebar-item__right']}>
        {row.pendingDot && (
          <span
            className={styles['dpc-app-shell__pending-dot']}
            aria-hidden
            title="Pending join requests"
          />
        )}
        {row.mention && (
          <span className={styles['dpc-app-shell__mention']}>{row.mention}</span>
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

function DpcSidebar({
  focusChannelName,
  focusIsDiscoverable,
  focusHasPendingDot,
  pendingDotChannels,
}: {
  focusChannelName: string;
  focusIsDiscoverable: boolean;
  focusHasPendingDot: boolean;
  pendingDotChannels: string[];
}) {
  const channels: ItemRow[] = [
    { name: 'town-square', type: 'public' },
    {
      name: focusChannelName,
      type: focusIsDiscoverable ? 'private-discoverable' : 'private',
      active: true,
      pendingDot: focusHasPendingDot,
    },
    {
      name: 'incident-response',
      type: 'private',
      pendingDot: pendingDotChannels.includes('incident-response'),
    },
    {
      name: 'release-cadence',
      type: 'public',
      unread: true,
      mention: 3,
    },
    {
      name: 'region-west-taskforce',
      type: 'private-discoverable',
    },
  ];

  const dms: ItemRow[] = [
    { name: 'Aiko Tan', type: 'dm', avatarSrc: avatarAiko, avatarAlt: 'Aiko Tan' },
    {
      name: 'Arjun Patel',
      type: 'dm',
      avatarSrc: avatarArjun,
      avatarAlt: 'Arjun Patel',
    },
    {
      name: 'Danielle Okoro',
      type: 'dm',
      avatarSrc: avatarDanielle,
      avatarAlt: 'Danielle Okoro',
    },
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
        <div className={sidebarStyles['channels-sidebar__find-channels']}>
          <span className={sidebarStyles['channels-sidebar__find-channels-icon']}>
            <MagnifyIcon size={16} />
          </span>
          <span className={sidebarStyles['channels-sidebar__find-channels-label']}>
            Find channels
          </span>
        </div>
      </div>

      <div className={sidebarStyles['channels-sidebar__top-group']}>
        <div className={itemStyles['channel-sidebar-item']}>
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
        <div className={itemStyles['channel-sidebar-item']}>
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

      <div className={styles['dpc-app-shell__category']}>
        <span className={styles['dpc-app-shell__category-chevron']}>
          <ChevronDownIcon size={12} />
        </span>
        <span className={styles['dpc-app-shell__category-label']}>
          Channels
        </span>
      </div>
      <div className={styles['dpc-app-shell__group']}>
        {channels.map((row) => (
          <SidebarRow key={row.name} row={row} />
        ))}
      </div>

      <div className={styles['dpc-app-shell__category']}>
        <span className={styles['dpc-app-shell__category-chevron']}>
          <ChevronDownIcon size={12} />
        </span>
        <span className={styles['dpc-app-shell__category-label']}>
          Direct Messages
        </span>
      </div>
      <div className={styles['dpc-app-shell__group']}>
        {dms.map((row) => (
          <SidebarRow key={row.name} row={row} />
        ))}
      </div>
    </div>
  );
}

export default function DpcAppShell({
  channelHeader,
  children,
  trailing,
  overlay,
  focusChannelName = 'ops-planning-q3',
  focusIsDiscoverable = true,
  focusHasPendingDot = false,
  pendingDotChannels = [],
  className,
}: DpcAppShellProps) {
  return (
    <div
      className={[styles['dpc-app-shell'], className].filter(Boolean).join(' ')}
    >
      <ChannelShell
        channelHeader={channelHeader}
        trailing={trailing}
        overlay={overlay}
        channelsSidebar={
          <DpcSidebar
            focusChannelName={focusChannelName}
            focusIsDiscoverable={focusIsDiscoverable}
            focusHasPendingDot={focusHasPendingDot}
            pendingDotChannels={pendingDotChannels}
          />
        }
      >
        {children}
      </ChannelShell>
    </div>
  );
}

export { shellStyles };
