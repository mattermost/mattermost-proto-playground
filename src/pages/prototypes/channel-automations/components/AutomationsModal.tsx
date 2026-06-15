import Button from '@/components/ui/Button/Button';
import { Modal } from '@/components/ui/Modal';
import type { Automation } from '../channelAutomationsData';
import AutomationsList from './AutomationsList';
import styles from './AutomationsModal.module.scss';

export interface AutomationsModalProps {
  automations: Automation[];
  onClose: () => void;
  onCreate: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Modal container — the management presentation alternative to the RHS panel. */
export default function AutomationsModal({
  automations,
  onClose,
  onCreate,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: AutomationsModalProps) {
  const subtitle = `UX Design · ${automations.length} ${
    automations.length === 1 ? 'automation' : 'automations'
  }`;

  return (
    <div className={styles['modal-layer']}>
      <div
        className={styles['modal-layer__backdrop']}
        aria-hidden
        onClick={onClose}
      />
      <div className={styles['modal-layer__dialog']}>
        <Modal
          title="Automations"
          subtitle={subtitle}
          size="Medium"
          onClose={onClose}
          footer={
            <Button emphasis="Tertiary" onClick={onClose}>
              Close
            </Button>
          }
        >
          <AutomationsList
            automations={automations}
            onCreate={onCreate}
            onToggle={onToggle}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </Modal>
      </div>
    </div>
  );
}
