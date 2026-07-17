import type { Meta, StoryObj } from '@storybook/react';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import BellOffOutlineIcon from '@mattermost/compass-icons/components/bell-off-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import ExitToAppIcon from '@mattermost/compass-icons/components/exit-to-app';
import FolderMoveOutlineIcon from '@mattermost/compass-icons/components/folder-move-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import MarkAsUnreadIcon from '@mattermost/compass-icons/components/mark-as-unread';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import AppsIcon from '@mattermost/compass-icons/components/apps';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import Icon from '../Icon/Icon';
import MenuItem from '../MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from './PopoverMenu';

function ChannelHeaderMenu() {
  return (
    <PopoverMenu>
      <PopoverMenuGroup>
        <MenuItem
          label="View info"
          leadingVisual={<Icon glyph={<InformationOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Mute channel"
          leadingVisual={<Icon glyph={<BellOffOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Notification preferences"
          leadingVisual={<Icon glyph={<BellOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Channel settings"
          leadingVisual={<Icon glyph={<CogOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
        />
        <MenuItem
          label="Bookmarks bar"
          leadingVisual={<Icon glyph={<BookmarkOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Members"
          leadingVisual={<Icon glyph={<AccountOutlineIcon />} size="16" />}
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
        <MenuItem
          label="More actions"
          leadingVisual={<Icon glyph={<AppsIcon />} size="16" />}
          trailingElement
          trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Leave channel"
          destructive
          leadingVisual={<Icon glyph={<ExitToAppIcon />} size="16" />}
        />
        <MenuItem
          label="Archive channel"
          destructive
          leadingVisual={<Icon glyph={<ArchiveOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}

function ChannelMenu() {
  return (
    <PopoverMenu style={{ width: '174px' }}>
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

const meta = {
  title: 'Patterns/Popover Menu',
  component: PopoverMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof PopoverMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ChannelHeaderMenuExample: Story = {
  render: () => <ChannelHeaderMenu />,
};

export const ChannelMenuExample: Story = {
  render: () => <ChannelMenu />,
};

export const ChildMenu: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <PopoverMenu>
        <MenuItem
          label="Channel settings"
          trailingElement
          trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
        />
      </PopoverMenu>
      <PopoverMenu variant="child">
        <MenuItem label="Rename channel" />
        <MenuItem label="Convert to private" />
      </PopoverMenu>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Channel header menu
        </h3>
        <ChannelHeaderMenu />
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Channel menu
        </h3>
        <ChannelMenu />
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Child menu (elevation 5)
        </h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <PopoverMenu>
            <MenuItem
              label="Channel settings"
              trailingElement
              trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
            />
          </PopoverMenu>
          <PopoverMenu variant="child">
            <MenuItem label="Rename channel" />
            <MenuItem label="Convert to private" />
          </PopoverMenu>
        </div>
      </section>
    </div>
  ),
};
