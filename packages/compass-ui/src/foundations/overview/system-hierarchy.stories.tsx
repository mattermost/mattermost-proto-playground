import type { Meta, StoryObj } from '@storybook/react';
import { GuidelineStory } from '../_components/GuidelineStory';
import Guideline from '@/guidelines/foundations/system-hierarchy/system-hierarchy.guideline.mdx';

const meta = {
  title: 'Foundations/Overview/System Hierarchy',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Docs: Story = {
  render: () => (
    <GuidelineStory>
      <Guideline />
    </GuidelineStory>
  ),
};
