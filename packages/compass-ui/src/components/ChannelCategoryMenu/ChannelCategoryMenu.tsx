import type { HTMLAttributes } from 'react';
import BellOffOutlineIcon from '@mattermost/compass-icons/components/bell-off-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import FolderMoveOutlineIcon from '@mattermost/compass-icons/components/folder-move-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import SortAlphabeticalAscendingIcon from '@mattermost/compass-icons/components/sort-alphabetical-ascending';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/Icon/Icon';
import MenuItem from '@/components/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@/components/PopoverMenu/PopoverMenu';
import styles from './ChannelCategoryMenu.module.scss';

export interface ChannelCategoryMenuProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Label shown in the Sort row trailing detail. Default: Alphabetically. */
  sortLabel?: string;
}

/**
 * Channel category context menu — mute/rename/delete, sort, browse/create.
 */
export default function ChannelCategoryMenu({
  sortLabel = 'Alphabetically',
  className = '',
  style,
  ...rest
}: ChannelCategoryMenuProps) {
  const rootClass = [styles['channel-category-menu'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <PopoverMenu
      className={rootClass}
      style={{ width: '247px', ...style }}
      {...rest}
    >
      <PopoverMenuGroup>
        <MenuItem
          label="Mute category"
          leadingVisual={<Icon glyph={<BellOffOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Rename category"
          leadingVisual={<Icon glyph={<PencilOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Delete category"
          destructive
          leadingVisual={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Sort"
          leadingVisual={
            <Icon glyph={<SortAlphabeticalAscendingIcon />} size="16" />
          }
          trailingElement
          trailingVisual={
            <span className={styles['channel-category-menu__sort-trailing']}>
              <span
                className={styles['channel-category-menu__sort-label']}
              >
                {sortLabel}
              </span>
              <Icon glyph={<ChevronRightIcon />} size="16" />
            </span>
          }
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Browse channels"
          leadingVisual={<Icon glyph={<GlobeIcon />} size="16" />}
        />
        <MenuItem
          label="Create new channel"
          leadingVisual={<Icon glyph={<PlusIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Create new category"
          leadingVisual={<Icon glyph={<FolderMoveOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
