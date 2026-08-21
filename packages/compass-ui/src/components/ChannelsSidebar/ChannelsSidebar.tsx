import { useMemo, type ReactNode } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import ChannelSidebarItem from '@/components/ChannelSidebarItem/ChannelSidebarItem';
import MoreUnreadsBanner from '@/components/MoreUnreadsBanner/MoreUnreadsBanner';
import IconButton from '@/components/IconButton/IconButton';
import Icon from '@/components/Icon/Icon';
import Scrollbar from '@/components/Scrollbar/Scrollbar';
import {
  applyChannelNameOverrides,
  type ChannelsSidebarItemModel,
  type ChannelsSidebarModel,
} from './channelsSidebarModel';
import styles from './ChannelsSidebar.module.scss';

function applyChannelSidebarInteractivity(
  model: ChannelsSidebarModel,
  activeChannelName: string | undefined,
  onItemClick?: (name: string) => void,
): ChannelsSidebarModel {
  const mapRow = (row: ChannelsSidebarItemModel) => ({
    ...row,
    active:
      activeChannelName === undefined
        ? row.active
        : row.name === activeChannelName,
    onClick: onItemClick ? () => onItemClick(row.name) : row.onClick,
  });
  return {
    topGroupItems: model.topGroupItems.map(mapRow),
    groups: model.groups.map((g) => ({
      ...g,
      items: g.items.map(mapRow),
    })),
  };
}

export interface ChannelsSidebarHeaderProps {
  teamName: string;
}

/** Team row + Add control; same markup as the top of `ChannelsSidebar`. */
export function ChannelsSidebarHeader({ teamName }: ChannelsSidebarHeaderProps) {
  return (
    <div className={styles['channels-sidebar__header']}>
      <div className={styles['channels-sidebar__team-dropdown']}>
        <span className={styles['channels-sidebar__team-name']}>
          {teamName}
        </span>
        <span className={styles['channels-sidebar__team-chevron']}>
          <ChevronDownIcon size={16} />
        </span>
      </div>
      <IconButton
        aria-label="Add channels"
        size="Small"
        style="Inverted"
        padding="Compact"
        rounded
        icon={<Icon size="16" glyph={<PlusIcon />} />}
        className={styles['channels-sidebar__sidebar-icon-button']}
      />
    </div>
  );
}

export interface ChannelsSidebarNavigatorProps {
  showFilter?: boolean;
}

/** Find channels row + optional unread filter control; same markup as `ChannelsSidebar`. */
export function ChannelsSidebarNavigator({
  showFilter = false,
}: ChannelsSidebarNavigatorProps) {
  return (
    <div className={styles['channels-sidebar__navigator']}>
      {showFilter && (
        <IconButton
          aria-label="Filter channels"
          size="Small"
          style="Inverted"
          padding="Compact"
          icon={<Icon size="16" glyph={<FilterVariantIcon />} />}
          className={styles['channels-sidebar__sidebar-icon-button']}
        />
      )}
      <div className={styles['channels-sidebar__find-channels']}>
        <span className={styles['channels-sidebar__find-channels-icon']}>
          <MagnifyIcon size={16} />
        </span>
        <span className={styles['channels-sidebar__find-channels-label']}>
          Find channels
        </span>
      </div>
    </div>
  );
}

export interface ChannelsSidebarCategoryProps {
  label: string;
  showChevron?: boolean;
  showPlusButton?: boolean;
  /** When set, shown instead of the expand chevron (e.g. System Console categories). */
  leadingIcon?: ReactNode;
  /** Pin category row to the top of the scroll container while scrolling (e.g. first console section). */
  sticky?: boolean;
  /** Full-opacity label + leading icon (System Console categories). Default: toned like channel sidebar. */
  opaqueCategory?: boolean;
}

export function ChannelsSidebarCategory({
  label,
  showChevron = true,
  showPlusButton = false,
  leadingIcon,
  sticky = false,
  opaqueCategory = false,
}: ChannelsSidebarCategoryProps) {
  const hasLeadingIcon = Boolean(leadingIcon);
  const showChevronRow = showChevron && !hasLeadingIcon;

  const categoryClass = [
    styles['channels-sidebar__category'],
    hasLeadingIcon ? styles['channels-sidebar__category--with-leading-icon'] : '',
    opaqueCategory ? styles['channels-sidebar__category--opaque'] : '',
    !showChevronRow && !hasLeadingIcon
      ? styles['channels-sidebar__category--no-chevron']
      : '',
    showPlusButton ? styles['channels-sidebar__category--has-action'] : '',
    sticky ? styles['channels-sidebar__category--sticky'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={categoryClass}>
      <div className={styles['channels-sidebar__category-left']}>
        {hasLeadingIcon && (
          <span className={styles['channels-sidebar__category-leading-icon']}>
            {leadingIcon}
          </span>
        )}
        {showChevronRow && (
          <span className={styles['channels-sidebar__category-chevron']}>
            <ChevronDownIcon size={12} />
          </span>
        )}
        <span className={styles['channels-sidebar__category-label']}>
          {label}
        </span>
      </div>
      {showPlusButton && (
        <IconButton
          aria-label={`New ${label.toLowerCase()}`}
          size="X-Small"
          style="Inverted"
          icon={<Icon size="12" glyph={<PlusIcon />} />}
        />
      )}
    </div>
  );
}

export interface ChannelsSidebarProps {
  teamName?: string;
  showUnreadsCategory?: boolean;
  showFilter?: boolean;
  showDialPad?: boolean;
  moreUnreadsAbove?: boolean;
  moreUnreadsBelow?: boolean;
  /**
   * Rename built-in channel/DM items without editing the model.
   * Keys are the default names; values are the display names to use instead.
   * Applies to `name` and `avatarAlt` on each item (same as the legacy hardcoded list).
   */
  channelNameOverrides?: Record<string, string>;
  /**
   * Match against **resolved** item names (after `channelNameOverrides`).
   * Omit to keep each row’s fixture `active` value; pass `''` to clear selection.
   */
  activeChannelName?: string;
  /** Receives the row's visible `name` (after overrides). */
  onItemClick?: (name: string) => void;
  avatarAikoTan?: string;
  avatarArjunPatel?: string;
  avatarDanielleOkoro?: string;
  avatarDariusCole?: string;
  avatarDavidLiang?: string;
  avatarEmmaNovak?: string;
  avatarEthanBrooks?: string;
  /** When set, overrides the default channel tree (for per-prototype sidebars). */
  model?: ChannelsSidebarModel;
}

export default function ChannelsSidebar({
  teamName = 'Contributors',
  showFilter = false,
  moreUnreadsAbove = false,
  moreUnreadsBelow = false,
  channelNameOverrides,
  activeChannelName,
  onItemClick,
  model: modelProp,
}: ChannelsSidebarProps) {
  const model = useMemo(() => {
    const baseModel = modelProp ?? { topGroupItems: [], groups: [] };
    const withOverrides = applyChannelNameOverrides(baseModel, channelNameOverrides);
    return applyChannelSidebarInteractivity(
      withOverrides,
      activeChannelName,
      onItemClick,
    );
  }, [
    modelProp,
    channelNameOverrides,
    activeChannelName,
    onItemClick,
  ]);

  return (
    <div className={styles['channels-sidebar']}>
      <ChannelsSidebarHeader teamName={teamName} />
      <ChannelsSidebarNavigator showFilter={showFilter} />

      <div className={styles['channels-sidebar__top-group']}>
        {model.topGroupItems.map((row, i) => (
          <ChannelSidebarItem key={`top-${i}-${row.name}`} {...row} />
        ))}
      </div>

      <div className={styles['channels-sidebar__scroll-view']}>
        <Scrollbar color="--sidebar-text-rgb">
          <div className={styles['channels-sidebar__channel-groups']}>
            {model.groups.map((group) => (
              <div
                key={group.key}
                className={styles['channels-sidebar__channel-group']}
              >
                <ChannelsSidebarCategory
                  label={group.category.label}
                  showChevron={group.category.showChevron}
                  showPlusButton={group.category.showPlusButton}
                />
                {group.items.map((row, index) => (
                  <ChannelSidebarItem
                    key={`${group.key}-${index}-${row.name}`}
                    {...row}
                  />
                ))}
              </div>
            ))}
          </div>
        </Scrollbar>

        {moreUnreadsAbove && (
          <MoreUnreadsBanner
            direction="Up"
            className={`${styles['channels-sidebar__more-unreads']} ${styles['channels-sidebar__more-unreads--above']}`}
          />
        )}
        {moreUnreadsBelow && (
          <MoreUnreadsBanner
            direction="Down"
            className={`${styles['channels-sidebar__more-unreads']} ${styles['channels-sidebar__more-unreads--below']}`}
          />
        )}
      </div>
    </div>
  );
}

export type { ChannelsSidebarModel } from './channelsSidebarModel';
