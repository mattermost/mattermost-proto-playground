import type { HTMLAttributes } from 'react';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import BellOffOutlineIcon from '@mattermost/compass-icons/components/bell-off-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ExitToAppIcon from '@mattermost/compass-icons/components/exit-to-app';
import FolderMoveOutlineIcon from '@mattermost/compass-icons/components/folder-move-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import MarkAsUnreadIcon from '@mattermost/compass-icons/components/mark-as-unread';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import Icon from '@/components/Icon/Icon';
import MenuItem from '@/components/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@/components/PopoverMenu/PopoverMenu';

export interface ChannelMenuProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Narrow channel sidebar context menu (174px).
 */
export default function ChannelMenu({
  className = '',
  style,
  ...rest
}: ChannelMenuProps) {
  return (
    <PopoverMenu
      className={className}
      style={{ width: '174px', ...style }}
      {...rest}
    >
      <PopoverMenuGroup>
        <MenuItem
          label="Mark as read"
          leadingVisual={<Icon glyph={<MarkAsUnreadIcon />} size="16" />}
        />
        <MenuItem
          label="Favorite"
          leadingVisual={<Icon glyph={<StarOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Mute channel"
          leadingVisual={<Icon glyph={<BellOffOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Move to"
          leadingVisual={<Icon glyph={<FolderMoveOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Copy link"
          leadingVisual={<Icon glyph={<LinkVariantIcon />} size="16" />}
        />
        <MenuItem
          label="Add members"
          leadingVisual={<Icon glyph={<AccountPlusOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Leave channel"
          destructive
          leadingVisual={<Icon glyph={<ExitToAppIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
