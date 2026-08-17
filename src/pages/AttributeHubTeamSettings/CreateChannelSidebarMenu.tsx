import PlusIcon from '@mattermost/compass-icons/components/plus';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import FolderPlusOutlineIcon from '@mattermost/compass-icons/components/folder-plus-outline';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@/components/ui/PopoverMenu/PopoverMenu';

export interface CreateChannelSidebarMenuProps {
  onCreateChannel: () => void;
}

export default function CreateChannelSidebarMenu({
  onCreateChannel,
}: CreateChannelSidebarMenuProps) {
  return (
    <PopoverMenu aria-label="Add channels">
      <PopoverMenuGroup>
        <MenuItem
          label="Create new channel"
          leadingVisual={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={onCreateChannel}
        />
        <MenuItem
          label="Browse channels"
          leadingVisual={<Icon size="16" glyph={<GlobeIcon />} />}
        />
        <MenuItem
          label="Open a direct message"
          leadingVisual={<Icon size="16" glyph={<AccountOutlineIcon />} />}
        />
        <MenuItem
          label="Create new user group"
          leadingVisual={<Icon size="16" glyph={<AccountPlusOutlineIcon />} />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Create new category"
          leadingVisual={<Icon size="16" glyph={<FolderPlusOutlineIcon />} />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Invite people"
          secondaryLabel="Add people to the team"
          leadingVisual={<Icon size="16" glyph={<AccountPlusOutlineIcon />} />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
