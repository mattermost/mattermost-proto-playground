import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import ChannelSidebarItem from '@/components/ui/ChannelSidebarItem/ChannelSidebarItem';
import MoreUnreadsBanner from '@/components/ui/MoreUnreadsBanner/MoreUnreadsBanner';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import {
  applyChannelNameOverrides,
  buildDefaultChannelsSidebarModel,
  type ChannelsSidebarModel,
} from './channelsSidebarModel';
import styles from './ChannelsSidebar.module.scss';

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

interface SidebarCategoryProps {
  label: string;
  showChevron?: boolean;
  showPlusButton?: boolean;
}

function SidebarCategory({
  label,
  showChevron = true,
  showPlusButton = false,
}: SidebarCategoryProps) {
  const categoryClass = [
    styles['channels-sidebar__category'],
    !showChevron ? styles['channels-sidebar__category--no-chevron'] : '',
    showPlusButton ? styles['channels-sidebar__category--has-action'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={categoryClass}>
      <div className={styles['channels-sidebar__category-left']}>
        {showChevron && (
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
  moreUnreadsAbove?: boolean;
  moreUnreadsBelow?: boolean;
  /**
   * Rename built-in channel/DM items without editing the model.
   * Keys are the default names; values are the display names to use instead.
   * Applies to `name` and `avatarAlt` on each item (same as the legacy hardcoded list).
   */
  channelNameOverrides?: Record<string, string>;
  avatarAikoTan?: string;
  avatarArjunPatel?: string;
  avatarDanielOkoro?: string;
  avatarDariusCole?: string;
  avatarDavidLiang?: string;
  avatarEmmaNovak?: string;
  avatarEthanBrooks?: string;
  /** When set, overrides the default channel tree (for per-prototype sidebars). */
  model?: ChannelsSidebarModel;
}

export default function ChannelsSidebar({
  teamName = 'Contributors',
  showUnreadsCategory = false,
  showFilter = false,
  moreUnreadsAbove = false,
  moreUnreadsBelow = false,
  channelNameOverrides,
  avatarAikoTan = '',
  avatarArjunPatel = '',
  avatarDanielOkoro = '',
  avatarDariusCole = '',
  avatarDavidLiang = '',
  avatarEmmaNovak = '',
  avatarEthanBrooks = '',
  model: modelProp,
}: ChannelsSidebarProps) {
  const baseModel =
    modelProp ??
    buildDefaultChannelsSidebarModel({
      showUnreadsCategory,
      avatarAikoTan,
      avatarArjunPatel,
      avatarDanielOkoro,
      avatarDariusCole,
      avatarDavidLiang,
      avatarEmmaNovak,
      avatarEthanBrooks,
    });
  const model = applyChannelNameOverrides(baseModel, channelNameOverrides);

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
        <Scrollbars color="--sidebar-text-rgb">
          <div className={styles['channels-sidebar__channel-groups']}>
            {model.groups.map((group) => (
              <div
                key={group.key}
                className={styles['channels-sidebar__channel-group']}
              >
                <SidebarCategory
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
        </Scrollbars>

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
