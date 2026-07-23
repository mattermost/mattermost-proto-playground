import type { Meta, StoryObj } from '@storybook/react';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import Icon from '../Icon/Icon';
import MenuItem from '../MenuItem/MenuItem';
import ChannelCategoryMenu from '../ChannelCategoryMenu/ChannelCategoryMenu';
import ChannelHeaderMenu from '../ChannelHeaderMenu/ChannelHeaderMenu';
import ChannelMenu from '../ChannelMenu/ChannelMenu';
import HelpMenu from '../HelpMenu/HelpMenu';
import MessageMoreOptionsMenu from '../MessageMoreOptionsMenu/MessageMoreOptionsMenu';
import PlusMenu from '../PlusMenu/PlusMenu';
import ProductSwitcherMenu from '../ProductSwitcherMenu/ProductSwitcherMenu';
import TeamMenu from '../TeamMenu/TeamMenu';
import ThreadActionsMenu from '../ThreadActionsMenu/ThreadActionsMenu';
import PopoverMenu from './PopoverMenu';

const meta = {
  title: 'Patterns/Popover Menu',
  component: PopoverMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof PopoverMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ChannelHeaderMenuExample: Story = {
  name: 'Channel header menu',
  render: () => <ChannelHeaderMenu />,
};

export const ProductSwitcherMenuExample: Story = {
  name: 'Product switcher menu',
  render: () => (
    <ProductSwitcherMenu
      selectedProduct="agents"
      additionalProducts={[
        {
          id: 'agents',
          label: 'Agents',
          icon: <CreationOutlineIcon />,
        },
      ]}
    />
  ),
};

export const ChannelMenuExample: Story = {
  name: 'Channel menu',
  render: () => <ChannelMenu />,
};

export const HelpMenuExample: Story = {
  name: 'Help menu',
  render: () => <HelpMenu />,
};

export const TeamMenuExample: Story = {
  name: 'Team menu',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
      <TeamMenu />
      <TeamMenu adminOptions createTeamPermission joinTeamPermission />
    </div>
  ),
};

export const PlusMenuExample: Story = {
  name: 'Plus menu',
  render: () => <PlusMenu />,
};

export const ChannelCategoryMenuExample: Story = {
  name: 'Channel category menu',
  render: () => <ChannelCategoryMenu />,
};

export const MessageMoreOptionsMenuExample: Story = {
  name: 'Message more options menu',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
      <MessageMoreOptionsMenu />
      <MessageMoreOptionsMenu permissionToEdit={false} showFlagOption={false} />
    </div>
  ),
};

export const ThreadActionsMenuExample: Story = {
  name: 'Thread actions menu',
  render: () => <ThreadActionsMenu />,
};

export const ChildMenu: Story = {
  name: 'Child menu',
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
          Product switcher menu
        </h3>
        <ProductSwitcherMenu
          selectedProduct="agents"
          additionalProducts={[
            {
              id: 'agents',
              label: 'Agents',
              icon: <CreationOutlineIcon />,
            },
          ]}
        />
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
          Help menu
        </h3>
        <HelpMenu />
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Team menu
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <TeamMenu />
          <TeamMenu adminOptions createTeamPermission joinTeamPermission />
        </div>
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Plus menu
        </h3>
        <PlusMenu />
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Channel category menu
        </h3>
        <ChannelCategoryMenu />
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Message more options menu
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <MessageMoreOptionsMenu />
          <MessageMoreOptionsMenu
            permissionToEdit={false}
            showFlagOption={false}
          />
        </div>
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Thread actions menu
        </h3>
        <ThreadActionsMenu />
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
