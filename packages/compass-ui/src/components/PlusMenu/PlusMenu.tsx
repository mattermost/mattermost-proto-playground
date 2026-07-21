import type { HTMLAttributes } from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import FolderPlusOutlineIcon from '@mattermost/compass-icons/components/folder-plus-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/Icon/Icon';
import MenuItem from '@/components/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@/components/PopoverMenu/PopoverMenu';

export interface PlusMenuProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Channel sidebar “+” menu — browse/create channels, DM, category, invite.
 */
export default function PlusMenu({
  className = '',
  style,
  ...rest
}: PlusMenuProps) {
  return (
    <PopoverMenu
      className={className}
      style={{ width: '260px', ...style }}
      {...rest}
    >
      <PopoverMenuGroup>
        <MenuItem
          label="Browse channels"
          leadingVisual={<Icon glyph={<GlobeIcon />} size="16" />}
        />
        <MenuItem
          label="Create new channel"
          leadingVisual={<Icon glyph={<PlusIcon />} size="16" />}
        />
        <MenuItem
          label="Open a direct message"
          leadingVisual={<Icon glyph={<AccountOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Create new category"
          leadingVisual={<Icon glyph={<FolderPlusOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Invite people"
          secondaryLabel="Add or invite people to team"
          leadingVisual={<Icon glyph={<AccountPlusOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
