import type { Meta, StoryObj } from '@storybook/react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import Button from './Button';
import type { ButtonAppearance, ButtonEmphasis, ButtonSize } from './Button';
import Icon from '../Icon/Icon';

const EMPHASES: ButtonEmphasis[] = [
  'Primary',
  'Secondary',
  'Tertiary',
  'Quaternary',
];

const SIZES: ButtonSize[] = ['X-Small', 'Small', 'Medium', 'Large'];

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    appearance: { control: 'select', options: ['Default', 'Inverted'] },
    emphasis: { control: 'select', options: EMPHASES },
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Label',
    emphasis: 'Primary',
    size: 'Medium',
  },
};

export const WithLeadingIcon: Story = {
  args: {
    children: 'Label',
    leadingIcon: <Icon glyph={<GlobeIcon />} size="16" />,
  },
};

function PermutationGrid({
  appearance,
  destructive,
  disabled,
}: {
  appearance: ButtonAppearance;
  destructive: boolean;
  disabled: boolean;
}) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {EMPHASES.map((emphasis) => (
        <div
          key={emphasis}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}
        >
          <span style={{ width: 96, fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {emphasis}
          </span>
          {SIZES.map((size) => (
            <Button
              key={size}
              appearance={appearance}
              emphasis={emphasis}
              destructive={destructive}
              disabled={disabled}
              size={size}
            >
              Label
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <section>
        <h3 style={{ marginBottom: 12 }}>Default</h3>
        <PermutationGrid appearance="Default" destructive={false} disabled={false} />
      </section>
      <section>
        <h3 style={{ marginBottom: 12 }}>Destructive</h3>
        <PermutationGrid appearance="Default" destructive disabled={false} />
      </section>
      <section>
        <h3 style={{ marginBottom: 12 }}>Disabled</h3>
        <PermutationGrid appearance="Default" destructive={false} disabled />
      </section>
      <section
        style={{
          padding: 16,
          borderRadius: 8,
          background: 'var(--color-sidebar-bg)',
        }}
      >
        <h3 style={{ marginBottom: 12 }}>Inverted</h3>
        <PermutationGrid appearance="Inverted" destructive={false} disabled={false} />
      </section>
    </div>
  ),
};
