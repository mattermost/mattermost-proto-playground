import { Button } from '@mattermost/compass-ui/components/button';
import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { useOverlayContainer } from './OverlayContainer';
import styles from '../WeaveAutomationPermissions.module.scss';

interface ConfirmDeleteModalProps {
  open: boolean;
  groupName: string;
  onCancel: () => void;
  onConfirm: () => void;
  onExited?: () => void;
}

/** Confirms deleting a permission group before it is removed. */
export default function ConfirmDeleteModal({
  open,
  groupName,
  onCancel,
  onConfirm,
  onExited,
}: ConfirmDeleteModalProps) {
  const container = useOverlayContainer();
  return (
    <ModalOverlay
      open={open}
      onClose={onCancel}
      container={container}
      lockScroll={false}
      style={{ position: 'absolute' }}
    >
      <Modal
        open={open}
        onExited={onExited}
        onClose={onCancel}
        size="small"
        headerDivider={false}
        footerDivider={false}
        title={`Delete ${groupName || 'this group'}?`}
        footer={
          <>
            <Button emphasis="tertiary" onClick={onCancel}>
              Cancel
            </Button>
            <Button destructive onClick={onConfirm}>
              Delete group
            </Button>
          </>
        }
      >
        <p className={styles['weave-permissions__confirm-text']}>
          People who only get access through this group will lose the ability to
          create automations. This can&rsquo;t be undone.
        </p>
      </Modal>
    </ModalOverlay>
  );
}
