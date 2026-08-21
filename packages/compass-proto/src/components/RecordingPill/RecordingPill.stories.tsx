import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import RecordingPill from './RecordingPill';
import type { RecordingPillState } from './RecordingPill';

const STATES: RecordingPillState[] = ['Initializing', 'Recording', 'Hover'];

const meta = {
  title: 'Proto/Calls/Recording Pill',
  component: RecordingPill,
  tags: ['autodocs'],
  argTypes: {
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<typeof RecordingPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initializing: Story = {
  args: {
    state: 'Initializing',
  },
};

export const Recording: Story = {
  args: {
    state: 'Recording',
  },
};

export const Hover: Story = {
  args: {
    state: 'Hover',
    onStop: fn(),
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <RecordingPill state="Initializing" />
      <RecordingPill state="Recording" />
      <RecordingPill state="Hover" onStop={fn()} />
    </div>
  ),
};
