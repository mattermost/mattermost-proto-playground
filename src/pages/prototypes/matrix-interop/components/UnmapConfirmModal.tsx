import { Button, Modal } from '@mattermost/compass-ui';
import type { SharedChannel } from '../matrixInteropTypes';
import modalStyles from './MatrixInteropModals.module.scss';

type UnmapConfirmModalProps = {
  channel: SharedChannel | { name: string; matrixRoomAlias: string };
  onClose: () => void;
  onConfirm: () => void;
};

export default function UnmapConfirmModal({
  channel,
  onClose,
  onConfirm,
}: UnmapConfirmModalProps) {
  const footer = (
    <div className={modalStyles['matrix-interop-modals__footer-actions']}>
      <Button emphasis="Tertiary" onClick={onClose}>
        Cancel
      </Button>
      <Button emphasis="Primary" destructive onClick={onConfirm}>
        Unmap
      </Button>
    </div>
  );

  return (
    <div className={modalStyles['matrix-interop-modals']}>
      <div
        className={modalStyles['matrix-interop-modals__backdrop']}
        aria-hidden
        onClick={onClose}
      />
      <div className={modalStyles['matrix-interop-modals__dialog']}>
        <Modal
          title="Unmap channel"
          size="Small"
          onClose={onClose}
          footer={footer}
        >
          <p className={modalStyles['matrix-interop-modals__confirm-text']}>
            Messages will stop syncing between{' '}
            <strong>{channel.name}</strong> and the Matrix room{' '}
            <strong>{channel.matrixRoomAlias}</strong>. Existing message
            history is not deleted.
          </p>
        </Modal>
      </div>
    </div>
  );
}
