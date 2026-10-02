import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@mattermost/compass-ui/components/button';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import type { WorkspaceAgent } from '../agentsData';
import AgentAvatar from './AgentAvatar';
import styles from './AddAgentToChannelModal.module.scss';

const EXIT_MS = 150;
const CHANNEL_NAME = 'service-status';

type AddAgentToChannelModalProps = {
  open: boolean;
  agents: WorkspaceAgent[];
  onCancel: () => void;
  onConfirm: () => void;
};

function agentSubtitle(agent: WorkspaceAgent) {
  if (agent.managedBy) {
    return `Managed by ${agent.managedBy}`;
  }
  return agent.owner ? `Owned by ${agent.owner}` : agent.role;
}

export default function AddAgentToChannelModal({
  open,
  agents,
  onCancel,
  onConfirm,
}: AddAgentToChannelModalProps) {
  const { rendered, exiting } = useExitAnimation(open, EXIT_MS);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!rendered || agents.length === 0) {
    return null;
  }

  const single = agents.length === 1 ? agents[0] : null;
  const title = single
    ? `Add ${single.name} to #${CHANNEL_NAME}?`
    : `Add ${agents.length} agents to #${CHANNEL_NAME}?`;
  const subtitle = single
    ? `${single.name} isn’t a member of this channel yet. Add them so they can see this mention.`
    : `These agents aren’t members of this channel yet. Add them so they can see this mention.`;

  return createPortal(
    <div
      className={[
        styles['add-agent-channel-modal'],
        exiting ? styles['add-agent-channel-modal--exiting'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={styles['add-agent-channel-modal__backdrop']}
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        className={styles['add-agent-channel-modal__dialog']}
        role="presentation"
      >
        <Modal
          size="small"
          title={title}
          subtitle={subtitle}
          headerDivider={false}
          footerDivider={false}
          onClose={onCancel}
          footer={
            <div className={styles['add-agent-channel-modal__footer']}>
              <Button emphasis="tertiary" onClick={onCancel}>
                Cancel
              </Button>
              <Button emphasis="primary" onClick={onConfirm}>
                Add and send
              </Button>
            </div>
          }
        >
          <ul className={styles['add-agent-channel-modal__list']}>
            {agents.map((agent) => (
              <li
                key={agent.id}
                className={styles['add-agent-channel-modal__row']}
              >
                <AgentAvatar
                  shape={agent.shape}
                  color={agent.color}
                  size="sm"
                  eyes
                  trackEyes={false}
                  imageSrc={agent.customImageSrc}
                />
                <div className={styles['add-agent-channel-modal__meta']}>
                  <div className={styles['add-agent-channel-modal__name-row']}>
                    <span className={styles['add-agent-channel-modal__name']}>
                      {agent.name}
                    </span>
                    <Tag label={agent.role} size="x-small" />
                  </div>
                  <span className={styles['add-agent-channel-modal__detail']}>
                    {agentSubtitle(agent)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Modal>
      </div>
    </div>,
    document.body,
  );
}
