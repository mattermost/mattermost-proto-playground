import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import AdminPanelHeader, {
  type AdminPanelExpandedState,
} from './AdminPanelHeader';

function HeaderChrome({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid rgba(var(--center-channel-color-rgb), 0.12)',
        borderRadius: 'var(--radius-m)',
        background: 'var(--center-channel-bg)',
        boxShadow: 'var(--elevation-1)',
        overflow: 'hidden',
        maxWidth: 920,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

type AdminPanelHeaderStoryProps = Omit<
  ComponentProps<typeof AdminPanelHeader>,
  'titleId'
>;

function AdminPanelHeaderStory(props: AdminPanelHeaderStoryProps) {
  const titleId = useId();
  return (
    <HeaderChrome>
      <AdminPanelHeader titleId={titleId} {...props} />
    </HeaderChrome>
  );
}

const meta = {
  title: 'Components/Admin Console/Admin Panel Header',
  component: AdminPanelHeaderStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof AdminPanelHeaderStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Section Title',
    subtitle: 'Section sub-title',
    showDivider: true,
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Section Title',
    showDivider: true,
  },
};

export const FullHeader: Story = {
  args: {
    title: 'Section Title',
    subtitle: 'Section sub-title',
    iconLeft: true,
    showEnterpriseLabel: true,
    showBeta: true,
    showSwitch: true,
    switchLabel: 'Off',
    showButton: true,
    buttonLabel: 'Button',
    onButtonClick: fn(),
    showDivider: true,
  },
};

export const ExpandableCollapsed: Story = {
  args: {
    title: 'Section Title',
    subtitle: 'Section sub-title',
    expandable: true,
    isExpanded: false,
    onToggleExpand: fn(),
    showDivider: false,
    showSwitch: true,
    switchLabel: 'Off',
  },
};

export const ExpandableExpanded: Story = {
  args: {
    title: 'Section Title',
    subtitle: 'Section sub-title',
    expandable: true,
    isExpanded: true,
    onToggleExpand: fn(),
    showDivider: true,
    showSwitch: true,
    switchLabel: 'Off',
  },
};

export const ControlledExpand: Story = {
  render: function ControlledExpandStory() {
    const titleId = useId();
    const [expanded, setExpanded] =
      useState<AdminPanelExpandedState>('Expanded');

    return (
      <HeaderChrome>
        <AdminPanelHeader
          titleId={titleId}
          title="Section Title"
          subtitle="Section sub-title"
          iconLeft
          leadingIcon={<Icon size="20" glyph={<GlobeIcon />} />}
          expandable
          isExpanded={expanded === 'Expanded'}
          onToggleExpand={() =>
            setExpanded((state) =>
              state === 'Expanded' ? 'Collapsed' : 'Expanded',
            )
          }
          showDivider={expanded === 'Expanded'}
          headerActions={
            <IconButton
              type="button"
              style="Default"
              size="Medium"
              aria-label="Help"
              icon={<Icon size="20" glyph={<InformationOutlineIcon />} />}
            />
          }
        />
      </HeaderChrome>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 920 }}>
      <section>
        <AdminPanelHeaderStory
          title="Section Title"
          subtitle="Section sub-title"
          iconLeft
          showEnterpriseLabel
          showBeta
          showSwitch
          switchLabel="Off"
          showButton
          buttonLabel="Button"
          showDivider
        />
      </section>
      <section>
        <AdminPanelHeaderStory
          title="Section Title"
          subtitle="Section sub-title"
          expandable
          isExpanded={false}
          onToggleExpand={fn()}
          showDivider={false}
          showSwitch
          switchLabel="Off"
        />
      </section>
      <section>
        <AdminPanelHeaderStory
          title="Section Title"
          subtitle="Section sub-title"
          showDivider
        />
      </section>
      <section>
        <AdminPanelHeaderStory title="Section Title" showDivider />
      </section>
    </div>
  ),
};
