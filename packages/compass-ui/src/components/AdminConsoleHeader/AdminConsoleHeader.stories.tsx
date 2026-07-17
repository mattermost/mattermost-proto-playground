import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import Button from '@/components/Button/Button';
import AdminConsoleHeader from './AdminConsoleHeader';

const meta = {
  title: 'Components/Admin Console/Admin Console Header',
  component: AdminConsoleHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdminConsoleHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Page Header',
  },
};

export const WithEnterpriseBadge: Story = {
  args: {
    title: 'Page Header',
    enterpriseBadge: true,
  },
};

export const WithBack: Story = {
  args: {
    title: 'Page Header',
    showBack: true,
    enterpriseBadge: true,
    onBackClick: fn(),
  },
};

export const WithTrailingAction: Story = {
  args: {
    title: 'LDAP',
    enterpriseBadge: true,
    showBack: true,
    onBackClick: fn(),
  },
  render: (args) => (
    <AdminConsoleHeader
      {...args}
      trailing={
        <Button emphasis="Tertiary" size="Medium">
          Action
        </Button>
      }
    />
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <section>
        <AdminConsoleHeader title="Page Header" />
      </section>
      <section>
        <AdminConsoleHeader title="Page Header" enterpriseBadge />
      </section>
      <section>
        <AdminConsoleHeader
          title="Page Header"
          showBack
          enterpriseBadge
          onBackClick={fn()}
        />
      </section>
      <section>
        <AdminConsoleHeader
          title="LDAP"
          showBack
          enterpriseBadge
          onBackClick={fn()}
          trailing={
            <Button emphasis="Tertiary" size="Medium">
              Action
            </Button>
          }
        />
      </section>
    </div>
  ),
};
