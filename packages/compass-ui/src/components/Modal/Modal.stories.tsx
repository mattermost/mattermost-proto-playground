import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { fn } from '@storybook/test';
import Button from '../Button/Button';
import TextInput from '../TextInput/TextInput';
import Modal from './Modal';
import type { ModalSize } from './Modal';

const SIZES: ModalSize[] = ['Small', 'Medium', 'Large'];

const modalFooter = (
  <>
    <Button emphasis="Tertiary">Cancel</Button>
    <Button destructive>Delete Channel</Button>
  </>
);

const modalBody = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-l)' }}>
    <p style={{ margin: 0, color: 'var(--center-channel-color)' }}>
      This will permanently delete <strong>#design</strong> and all its messages.
      Members will lose access immediately. This action cannot be undone.
    </p>
    <TextInput label='Type "design" to confirm' placeholder="design" />
  </div>
);

function ModalCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        height: 480,
        background: 'var(--center-channel-bg)',
        border: '1px solid rgba(var(--center-channel-color-rgb), 0.12)',
        borderRadius: 'var(--radius-l)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-l)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

const meta = {
  title: 'Patterns/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ModalCanvas>
      <Modal
        title="Delete Channel"
        size="Small"
        footer={modalFooter}
        onClose={fn()}
      >
        {modalBody}
      </Modal>
    </ModalCanvas>
  ),
};

export const WithSubtitle: Story = {
  render: () => (
    <ModalCanvas>
      <Modal
        title="Invite members"
        subtitle="Add people to #design"
        size="Medium"
        footer={
          <>
            <Button emphasis="Tertiary">Cancel</Button>
            <Button emphasis="Primary">Send invites</Button>
          </>
        }
        onClose={fn()}
      >
        <TextInput label="Email addresses" placeholder="name@example.com" />
      </Modal>
    </ModalCanvas>
  ),
};

export const WithBackButton: Story = {
  render: () => (
    <ModalCanvas>
      <Modal
        title="Confirm deletion"
        size="Small"
        showBackButton
        onBack={fn()}
        onClose={fn()}
        footer={modalFooter}
      >
        {modalBody}
      </Modal>
    </ModalCanvas>
  ),
};

export const WithoutDividers: Story = {
  render: () => (
    <ModalCanvas>
      <Modal
        title="Delete Channel"
        size="Small"
        headerDivider={false}
        footerDivider={false}
        footer={modalFooter}
        onClose={fn()}
      >
        {modalBody}
      </Modal>
    </ModalCanvas>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      {SIZES.map((size) => (
        <div key={size}>
          <p
            style={{
              marginBottom: 8,
              fontSize: 12,
              color: 'rgba(var(--center-channel-color-rgb), 0.56)',
            }}
          >
            {size}
          </p>
          <ModalCanvas>
            <Modal title={`${size} modal`} size={size} onClose={fn()}>
              <p style={{ margin: 0, color: 'var(--center-channel-color)' }}>
                Modal body content for the {size.toLowerCase()} size variant.
              </p>
            </Modal>
          </ModalCanvas>
        </div>
      ))}
    </div>
  ),
};
