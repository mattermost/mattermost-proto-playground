import { Button, Modal } from '@mattermost/compass-ui';
import type { MatrixConnection } from '../matrixInteropTypes';
import modalStyles from './MatrixInteropModals.module.scss';

type DeleteConnectionConfirmModalProps = {
  connection: MatrixConnection;
  sharedChannelCount: number;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteConnectionConfirmModal({
  connection,
  sharedChannelCount,
  onClose,
  onConfirm,
}: DeleteConnectionConfirmModalProps) {
  const footer = (
    <div className={modalStyles['matrix-interop-modals__footer-actions']}>
      <Button emphasis="Tertiary" onClick={onClose}>
        Cancel
      </Button>
      <Button emphasis="Primary" destructive onClick={onConfirm}>
        Delete
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
          title="Delete connection"
          size="Small"
          onClose={onClose}
          footer={footer}
        >
          <div className={modalStyles['matrix-interop-modals__confirm-body']}>
            <p className={modalStyles['matrix-interop-modals__confirm-lead']}>
              Are you sure you want to delete the connection to{' '}
              <span
                className={modalStyles['matrix-interop-modals__confirm-emphasis']}
              >
                {connection.name}
              </span>
              ?
            </p>
            <ul className={modalStyles['matrix-interop-modals__confirm-list']}>
              <li>
                {sharedChannelCount > 0
                  ? `${sharedChannelCount} shared channel${sharedChannelCount === 1 ? '' : 's'} will stop syncing.`
                  : 'Any shared channels for this connection will stop syncing.'}
              </li>
              <li>Existing messages will remain in both systems.</li>
              <li>Matrix rooms will not be deleted.</li>
            </ul>
          </div>
        </Modal>
      </div>
    </div>
  );
}
