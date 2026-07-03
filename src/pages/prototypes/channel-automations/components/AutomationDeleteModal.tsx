import { Button, Modal } from '@mattermost/compass-ui';
import styles from './AutomationDeleteModal.module.scss';

export interface AutomationDeleteModalProps {
  automationName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function AutomationDeleteModal({
  automationName,
  onConfirm,
  onClose,
}: AutomationDeleteModalProps) {
  return (
    <div className={styles['layer']}>
      <div className={styles['layer__backdrop']} aria-hidden onClick={onClose} />
      <div className={styles['layer__dialog']}>
        <Modal
          size="Small"
          title="Delete automation"
          headerDivider={false}
          footerDivider={false}
          onClose={onClose}
          footer={
            <>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button emphasis="Primary" destructive onClick={onConfirm}>
                Delete
              </Button>
            </>
          }
        >
          <p className={styles['body-text']}>
            Are you sure you want to delete{' '}
            <span className={styles['body-text__name']}>{automationName}</span>?
            This action cannot be undone.
          </p>
        </Modal>
      </div>
    </div>
  );
}
