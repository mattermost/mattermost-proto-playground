import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@mattermost/compass-ui/components/button';
import { Combobox } from '@mattermost/compass-ui/components/combobox';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { buildWorkspaceDirectory, type CreatedAgent } from '../agentsData';
import AgentAvatar from './AgentAvatar';
import { agentAvatarChipSrc } from './agentAvatarShapes';
import styles from './NewAgentGroupChatModal.module.scss';

const EXIT_MS = 150;
const MIN_MEMBERS = 2;

type NewAgentGroupChatModalProps = {
  open: boolean;
  customAgents: CreatedAgent[];
  onClose: () => void;
  onStart: (memberIds: string[]) => void;
};

export default function NewAgentGroupChatModal({
  open,
  customAgents,
  onClose,
  onStart,
}: NewAgentGroupChatModalProps) {
  const { rendered, exiting } = useExitAnimation(open, EXIT_MS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuPortal, setMenuPortal] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedIds([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const options = useMemo(
    () =>
      buildWorkspaceDirectory(customAgents).map((agent) => ({
        value: agent.id,
        label: agent.name,
        secondaryLabel: agent.role,
        leadingVisual: (
          <AgentAvatar
            shape={agent.shape}
            color={agent.color}
            size="xs"
            eyes
            trackEyes={false}
            imageSrc={agent.customImageSrc}
          />
        ),
        // Chips: leadingAvatar → UserAvatar (circle by default; modal CSS
        // unmasks). leadingVisual alone → Chip leadingIcon → Icon, not AgentAvatar.
        leadingAvatar: {
          src:
            agent.customImageSrc ??
            agentAvatarChipSrc(agent.shape, agent.color),
          alt: agent.name,
        },
      })),
    [customAgents],
  );

  const canStart = selectedIds.length >= MIN_MEMBERS;

  if (!rendered) return null;

  return createPortal(
    <div
      ref={setMenuPortal}
      className={[
        styles['new-agent-group-chat-modal'],
        exiting ? styles['new-agent-group-chat-modal--exiting'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={styles['new-agent-group-chat-modal__backdrop']}
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={styles['new-agent-group-chat-modal__dialog']}
        role="presentation"
      >
        <Modal
          size="small"
          title="New agent group chat"
          subtitle="Select the agents that should join this conversation."
          headerDivider={false}
          footerDivider={false}
          onClose={onClose}
          footer={
            <div className={styles['new-agent-group-chat-modal__footer']}>
              <Button emphasis="tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="primary"
                disabled={!canStart}
                onClick={() => {
                  if (!canStart) return;
                  onStart(selectedIds);
                  onClose();
                }}
              >
                Start chat
              </Button>
            </div>
          }
        >
          <Combobox
            aria-label="Agents"
            placeholder="Search agents"
            multiple
            options={options}
            value={selectedIds}
            onChange={(next) =>
              setSelectedIds(
                Array.isArray(next) ? next : next ? [next] : [],
              )
            }
            emptyMessage="No agents match"
            portalContainer={menuPortal}
            zIndex={1400}
          />
        </Modal>
      </div>
    </div>,
    document.body,
  );
}
