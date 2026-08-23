import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import MenuItem from './MenuItem';
import type { MenuItemProps } from './MenuItem';
import {
  ICON_DEFAULT,
  iconSelectArgType,
  resolveStoryIcon,
} from '../../storybook/icons';

const menuDemoStyle = {
  display: 'grid',
  gap: 2,
  width: 280,
  padding: 4,
  borderRadius: 8,
  background: 'var(--center-channel-bg)',
  border: '1px solid rgba(var(--center-channel-color-rgb), 0.08)',
} as const;

type MenuItemStoryArgs = Omit<MenuItemProps, 'leadingVisual'> & {
  leadingVisual?: string;
};

const meta = {
  title: 'Components/Navigation/Menu Item',
  component: MenuItem,
  tags: ['autodocs'],
  argTypes: {
    leadingVisual: iconSelectArgType({
      includeDefault: true,
      description:
        'Leading icon glyph. Default uses the built-in emoticon placeholder. Turn off leadingElement to hide the slot.',
    }),
  },
  args: {
    leadingVisual: ICON_DEFAULT,
  },
  render: ({ leadingVisual, ...rest }) => (
    <MenuItem
      {...rest}
      leadingVisual={
        leadingVisual === ICON_DEFAULT
          ? undefined
          : (resolveStoryIcon(leadingVisual, { wrapSize: '16' }) as ReactNode)
      }
    />
  ),
} satisfies Meta<MenuItemStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Menu Item',
  },
};

export const WithTrailingCheck: Story = {
  args: {
    label: 'With trailing check',
    trailingElement: true,
  },
};

export const SecondaryLabelBelow: Story = {
  args: {
    label: 'Menu Item',
    secondaryLabel: 'Descriptive text below',
  },
};

export const SecondaryLabelInline: Story = {
  args: {
    label: 'Menu Item',
    secondaryLabel: 'Inline text',
    secondaryLabelPosition: 'Inline',
  },
};

export const WithTag: Story = {
  args: {
    label: 'New feature',
    tag: true,
  },
};

export const Destructive: Story = {
  args: {
    label: 'Delete item',
    destructive: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Default
        </h3>
        <div style={menuDemoStyle}>
          <MenuItem label="Menu Item" />
          <MenuItem label="With trailing check" trailingElement />
          <MenuItem label="No leading visual" leadingElement={false} />
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
          Secondary label
        </h3>
        <div style={menuDemoStyle}>
          <MenuItem label="Menu Item" secondaryLabel="Descriptive text below" />
          <MenuItem
            label="Menu Item"
            secondaryLabel="Inline text"
            secondaryLabelPosition="Inline"
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
          Badges and tag
        </h3>
        <div style={menuDemoStyle}>
          <MenuItem label="New feature" tag />
          <MenuItem label="Mentions" mentionCount={3} />
          <MenuItem label="Custom status" customStatusEmoji="🏄" />
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
          Destructive
        </h3>
        <div style={menuDemoStyle}>
          <MenuItem label="Delete item" destructive />
          <MenuItem label="Delete item" destructive trailingElement />
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
          Disabled
        </h3>
        <div style={menuDemoStyle}>
          <MenuItem label="Menu Item" disabled />
          <MenuItem label="With badge" disabled mentionCount={2} />
          <MenuItem label="Destructive" destructive disabled />
        </div>
      </section>
    </div>
  ),
};
