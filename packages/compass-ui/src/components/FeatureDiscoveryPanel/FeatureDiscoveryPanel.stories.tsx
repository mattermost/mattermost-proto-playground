import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import GroupsIllustration from '@/assets/illustrations/groups.svg?react';
import FeatureDiscoveryPanel from './FeatureDiscoveryPanel';

const meta = {
  title: 'Components/Admin Console/Feature Discovery Panel',
  component: FeatureDiscoveryPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 920, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeatureDiscoveryPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIllustration: Story = {
  args: {
    skuLabel: 'PROFESSIONAL',
    title: 'Synchronize your Active Directory/LDAP groups',
    description:
      'Use AD/LDAP groups to organize and apply actions to multiple users at once. Manage team and channel memberships, permissions, and more.',
    primaryAction: { children: 'Contact sales', onClick: fn() },
    secondaryAction: {
      emphasis: 'Tertiary',
      children: 'Learn more',
      onClick: fn(),
    },
    illustration: {
      children: <GroupsIllustration />,
      width: '276px',
      height: '170px',
      'aria-label': 'Groups illustration',
    },
  },
};

export const TextOnly: Story = {
  args: {
    skuLabel: 'PROFESSIONAL',
    title: 'Unlock advanced reporting',
    description:
      'Get deeper insights into your workspace with advanced analytics and custom dashboards available on the Professional plan.',
    primaryAction: { children: 'Upgrade now', onClick: fn() },
    secondaryAction: {
      emphasis: 'Tertiary',
      children: 'Learn more',
      onClick: fn(),
    },
  },
};

export const NoSkuTag: Story = {
  args: {
    skuLabel: null,
    title: 'Enable compliance exports',
    description:
      'Configure automated message exports for regulatory compliance.',
    primaryAction: { children: 'Enable', onClick: fn() },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 920 }}>
      <FeatureDiscoveryPanel
        skuLabel="PROFESSIONAL"
        title="Synchronize your Active Directory/LDAP groups"
        description="Use AD/LDAP groups to organize and apply actions to multiple users at once. Manage team and channel memberships, permissions, and more."
        primaryAction={{ children: 'Contact sales', onClick: fn() }}
        secondaryAction={{
          emphasis: 'Tertiary',
          children: 'Learn more',
          onClick: fn(),
        }}
        illustration={{
          children: <GroupsIllustration />,
          width: '276px',
          height: '170px',
          'aria-label': 'Groups illustration',
        }}
      />
      <FeatureDiscoveryPanel
        skuLabel="PROFESSIONAL"
        title="Unlock advanced reporting"
        description="Get deeper insights into your workspace with advanced analytics and custom dashboards available on the Professional plan."
        primaryAction={{ children: 'Upgrade now', onClick: fn() }}
        secondaryAction={{
          emphasis: 'Tertiary',
          children: 'Learn more',
          onClick: fn(),
        }}
      />
      <FeatureDiscoveryPanel
        skuLabel={null}
        title="Enable compliance exports"
        description="Configure automated message exports for regulatory compliance."
        primaryAction={{ children: 'Enable', onClick: fn() }}
      />
    </div>
  ),
};
