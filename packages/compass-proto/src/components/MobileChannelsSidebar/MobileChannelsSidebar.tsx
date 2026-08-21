import {useMemo, type ReactNode} from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import MobileChannelSidebarItem from '@/components/MobileChannelSidebarItem/MobileChannelSidebarItem';
import MobileSearchField from '@/components/MobileSearchField/MobileSearchField';
import { IconButton } from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import { Scrollbar } from '@mattermost/compass-ui';
import {
  applyChannelNameOverrides,
  type ChannelsSidebarItemModel,
  type ChannelsSidebarModel,
} from '@mattermost/compass-ui';
import { buildDefaultChannelsSidebarModel } from '@/fixtures/buildDefaultChannelsSidebarModel';
import styles from './MobileChannelsSidebar.module.scss';

function applyInteractivity(
  model: ChannelsSidebarModel,
  onItemClick?: (name: string) => void,
): ChannelsSidebarModel {
  const mapRow = (row: ChannelsSidebarItemModel) => {
    const {active: _active, ...rest} = row;
    return {
      ...rest,
      onClick: onItemClick ? () => onItemClick(row.name) : undefined,
    };
  };
  return {
    topGroupItems: model.topGroupItems.map(mapRow),
    groups: model.groups.map((g) => ({
      ...g,
      items: g.items.map(mapRow),
    })),
  };
}

export interface MobileChannelsSidebarProps {
  teamName?: string;
  /** Secondary line under the team title (e.g. organization). */
  subtitle?: string;
  showUnreadsCategory?: boolean;
  channelNameOverrides?: Record<string, string>;
  onItemClick?: (name: string) => void;
  /** Controlled value for the Find channels field. */
  findChannelsValue?: string;
  /** Called when the Find channels field changes. */
  onFindChannelsChange?: (value: string) => void;
  /** Find channels placeholder. Default: Find channels…. */
  findChannelsPlaceholder?: string;
  avatarAikoTan?: string;
  avatarArjunPatel?: string;
  avatarDanielleOkoro?: string;
  avatarDariusCole?: string;
  avatarDavidLiang?: string;
  avatarEmmaNovak?: string;
  avatarEthanBrooks?: string;
  model?: ChannelsSidebarModel;
  className?: string;
  /** Optional trailing content in the header (defaults to add button). */
  headerAction?: ReactNode;
}

/**
 * Mobile channel list — sibling of desktop ChannelsSidebar.
 * Rows do not show a selected/active state; tapping navigates to a separate page.
 */
export default function MobileChannelsSidebar({
  teamName = 'Contributors',
  subtitle = 'Community',
  showUnreadsCategory = true,
  channelNameOverrides,
  onItemClick,
  findChannelsValue = '',
  onFindChannelsChange,
  findChannelsPlaceholder = 'Find channels…',
  avatarAikoTan = '',
  avatarArjunPatel = '',
  avatarDanielleOkoro = '',
  avatarDariusCole = '',
  avatarDavidLiang = '',
  avatarEmmaNovak = '',
  avatarEthanBrooks = '',
  model: modelProp,
  className = '',
  headerAction,
}: MobileChannelsSidebarProps) {
  const model = useMemo(() => {
    const baseModel =
      modelProp ??
      buildDefaultChannelsSidebarModel({
        showUnreadsCategory,
        avatarAikoTan,
        avatarArjunPatel,
        avatarDanielleOkoro,
        avatarDariusCole,
        avatarDavidLiang,
        avatarEmmaNovak,
        avatarEthanBrooks,
      });
    const withOverrides = applyChannelNameOverrides(
      baseModel,
      channelNameOverrides,
    );
    return applyInteractivity(withOverrides, onItemClick);
  }, [
    modelProp,
    showUnreadsCategory,
    channelNameOverrides,
    onItemClick,
    avatarAikoTan,
    avatarArjunPatel,
    avatarDanielleOkoro,
    avatarDariusCole,
    avatarDavidLiang,
    avatarEmmaNovak,
    avatarEthanBrooks,
  ]);

  const rootClass = [styles['mobile-channels-sidebar'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['mobile-channels-sidebar__header']}>
        <div className={styles['mobile-channels-sidebar__header-text']}>
          <button
            type='button'
            className={styles['mobile-channels-sidebar__team-dropdown']}
          >
            <span className={styles['mobile-channels-sidebar__team-name']}>
              {teamName}
            </span>
            <span className={styles['mobile-channels-sidebar__team-chevron']}>
              <ChevronDownIcon size={20} />
            </span>
          </button>
          {subtitle && (
            <p className={styles['mobile-channels-sidebar__subtitle']}>
              {subtitle}
            </p>
          )}
        </div>
        {headerAction ?? (
          <IconButton
            aria-label='Add channels'
            size='Medium'
            style='Inverted'
            rounded
            icon={<Icon size='20' glyph={<PlusIcon />} />}
            className={styles['mobile-channels-sidebar__add']}
          />
        )}
      </div>

      <div className={styles['mobile-channels-sidebar__navigator']}>
        <MobileSearchField
          value={findChannelsValue}
          placeholder={findChannelsPlaceholder}
          aria-label='Find channels'
          onChange={(event) => onFindChannelsChange?.(event.target.value)}
        />
      </div>

      <div className={styles['mobile-channels-sidebar__top-group']}>
        {model.topGroupItems.map((row, i) => (
          <MobileChannelSidebarItem key={`top-${i}-${row.name}`} {...row} />
        ))}
      </div>

      <div className={styles['mobile-channels-sidebar__scroll-view']}>
        <Scrollbar color='--sidebar-text-rgb'>
          <div className={styles['mobile-channels-sidebar__channel-groups']}>
            {model.groups.map((group) => (
              <div
                key={group.key}
                className={styles['mobile-channels-sidebar__channel-group']}
              >
                <div
                  className={[
                    styles['mobile-channels-sidebar__category'],
                    !group.category.showChevron
                      ? styles['mobile-channels-sidebar__category--no-chevron']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div
                    className={
                      styles['mobile-channels-sidebar__category-left']
                    }
                  >
                    {group.category.showChevron !== false && (
                      <span
                        className={
                          styles['mobile-channels-sidebar__category-chevron']
                        }
                      >
                        <ChevronDownIcon size={16} />
                      </span>
                    )}
                    <span
                      className={
                        styles['mobile-channels-sidebar__category-label']
                      }
                    >
                      {group.category.label}
                    </span>
                  </div>
                </div>
                {group.items.map((row, index) => (
                  <MobileChannelSidebarItem
                    key={`${group.key}-${index}-${row.name}`}
                    {...row}
                  />
                ))}
              </div>
            ))}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}

export type {ChannelsSidebarModel as MobileChannelsSidebarModel};
