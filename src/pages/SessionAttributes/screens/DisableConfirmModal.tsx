import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import styles from './DisableConfirmModal.module.scss';

interface DisableConfirmModalProps {
  displayName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DisableConfirmModal({
  displayName,
  onCancel,
  onConfirm,
}: DisableConfirmModalProps) {
  return (
    <Modal
      size="Small"
      title="Disable attribute"
      onClose={onCancel}
      footer={
        <div className={styles['footer']}>
          <Button emphasis="Tertiary" onClick={onCancel}>Cancel</Button>
          <Button emphasis="Primary" destructive onClick={onConfirm}>Disable</Button>
        </div>
      }
    >
      <p className={styles['body']}>
        Disabling <strong>{displayName}</strong> will make it unusable in permission
        policies based on attributes. Are you sure you want to disable the attribute?
      </p>
    </Modal>
  );
}
