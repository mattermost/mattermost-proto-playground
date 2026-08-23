import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import TextInput from './TextInput';
import type { TextInputProps, TextInputSize } from './TextInput';
import Icon from '../Icon/Icon';
import {
  ICON_NONE,
  iconSelectArgType,
  resolveStoryIcon,
} from '../../storybook/icons';

const SIZES: TextInputSize[] = ['Small', 'Medium', 'Large'];

type TextInputStoryArgs = Omit<
  TextInputProps,
  'leadingIcon' | 'trailingIcon'
> & {
  leadingIcon?: string;
  trailingIcon?: string;
};

const meta = {
  title: 'Components/Forms and Input/Text Input',
  component: TextInput,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    leadingIcon: iconSelectArgType({ optional: true }),
    trailingIcon: iconSelectArgType({ optional: true }),
  },
  args: {
    leadingIcon: ICON_NONE,
    trailingIcon: ICON_NONE,
  },
  render: ({ leadingIcon, trailingIcon, ...rest }) => (
    <TextInput
      {...rest}
      leadingIcon={
        resolveStoryIcon(leadingIcon, { wrapSize: '16' }) as ReactNode
      }
      trailingIcon={
        resolveStoryIcon(trailingIcon, { wrapSize: '16' }) as ReactNode
      }
    />
  ),
} satisfies Meta<TextInputStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          width: 144,
          fontSize: 12,
          color: 'var(--center-channel-color)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    size: 'Medium',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Display name',
    placeholder: 'Enter display name...',
    size: 'Medium',
  },
};

export const WithIcons: Story = {
  args: {
    label: 'Workspace',
    placeholder: 'Enter workspace...',
    leadingIcon: 'globe',
    trailingIcon: 'globe',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Row label="Sizes">
        {SIZES.map((size) => (
          <TextInput key={size} size={size} placeholder={size} />
        ))}
      </Row>
      <Row label="Label">
        <TextInput label="Label" placeholder="Placeholder" />
        <TextInput placeholder="No label" />
        <TextInput label="With value" defaultValue="Some text" />
      </Row>
      <Row label="Leading / trailing icons">
        <TextInput
          label="Search"
          placeholder="Search..."
          leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
        />
        <TextInput
          placeholder="Trailing only"
          trailingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
        />
        <TextInput
          label="Both"
          placeholder="Leading and trailing"
          leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
          trailingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
        />
      </Row>
      <Row label="Invalid">
        <TextInput label="Error" invalid placeholder="Invalid state" />
        <TextInput label="Error with value" invalid defaultValue="Invalid" />
      </Row>
      <Row label="Character counter">
        <TextInput
          label="Description"
          placeholder="Enter text..."
          maxLength={100}
          showCharacterCount
        />
        <TextInput
          label="With value"
          defaultValue="Already filled"
          maxLength={50}
          showCharacterCount
        />
      </Row>
      <Row label="Disabled / read-only">
        <TextInput label="Disabled" disabled placeholder="Disabled" />
        <TextInput label="Read-only" readOnly defaultValue="Read only value" />
      </Row>
    </div>
  ),
};
