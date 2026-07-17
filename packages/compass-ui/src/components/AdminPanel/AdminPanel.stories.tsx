import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import AdminPanel, { type AdminPanelExpandedState } from './AdminPanel';

const meta = {
  title: 'Patterns/Admin Console/Admin Panel',
  component: AdminPanel,
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
} satisfies Meta<typeof AdminPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Section Title',
    subtitle: 'Section sub-title',
    children: 'Section content',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Section Title',
    children: 'Section content',
  },
};

export const FullHeaderExpanded: Story = {
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
    expandable: true,
    defaultExpandedState: 'Expanded',
    children: 'Section content — body hides when collapsed and expandable.',
  },
};

export const ExpandableCollapsed: Story = {
  args: {
    title: 'Section Title',
    subtitle: 'Section sub-title',
    expandable: true,
    defaultExpandedState: 'Collapsed',
    showSwitch: true,
    switchLabel: 'Off',
    children: 'Content appears after expand.',
  },
};

export const ControlledExpand: Story = {
  render: function ControlledExpandStory() {
    const [expandedState, setExpandedState] =
      useState<AdminPanelExpandedState>('Expanded');

    return (
      <AdminPanel
        title="Section Title"
        subtitle="Section sub-title"
        iconLeft
        leadingIcon={<Icon size="20" glyph={<GlobeIcon />} />}
        expandable
        expandedState={expandedState}
        onExpandedStateChange={setExpandedState}
        headerActions={
          <IconButton
            type="button"
            style="Default"
            size="Medium"
            aria-label="Help"
            icon={<Icon size="20" glyph={<InformationOutlineIcon />} />}
          />
        }
      >
        Controlled via parent state ({expandedState}).
      </AdminPanel>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 920 }}>
      <AdminPanel
        title="Section Title"
        subtitle="Section sub-title"
        iconLeft
        showEnterpriseLabel
        showBeta
        showSwitch
        switchLabel="Off"
        showButton
        buttonLabel="Button"
        expandable
        defaultExpandedState="Expanded"
      >
        Section content — body hides when collapsed and expandable.
      </AdminPanel>
      <AdminPanel
        title="Section Title"
        subtitle="Section sub-title"
        expandable
        defaultExpandedState="Collapsed"
        showSwitch
        switchLabel="Off"
      >
        Content appears after expand.
      </AdminPanel>
      <AdminPanel title="Section Title" subtitle="Section sub-title">
        Section content
      </AdminPanel>
      <AdminPanel title="Section Title">Section content</AdminPanel>
    </div>
  ),
};
