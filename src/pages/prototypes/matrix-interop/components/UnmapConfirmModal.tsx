import { Button, Modal } from '@mattermost/compass-ui';
import type { SharedChannel } from '../matrixInteropTypes';
import modalStyles from './MatrixInteropModals.module.scss';

type UnmapConfirmModalProps = {
  channel: SharedChannel | { name: string; matrixRoomAlias: string };
  connectionName: string;
  connectionDomain: string;
  onClose: () => void;
  onConfirm: () => void;
};

function formatMatrixRoomAddress(alias: string, domain: string): string {
  const trimmed = alias.trim();
  if (trimmed.startsWith('#') && trimmed.includes(':')) {
    return trimmed;
  }

  const slug = trimmed.toLowerCase().replace(/\s+/g, '-');
  return domain ? `#${slug}:${domain}` : `#${slug}`;
}

export default function UnmapConfirmModal({
  channel,
  connectionName,
  connectionDomain,
  onClose,
  onConfirm,
}: UnmapConfirmModalProps) {
  const matrixRoomAddress = formatMatrixRoomAddress(
    channel.matrixRoomAlias,
    connectionDomain,
  );

  const footer = (
    <div className={modalStyles['matrix-interop-modals__footer-actions']}>
      <Button emphasis="Tertiary" onClick={onClose}>
        Cancel
      </Button>
      <Button emphasis="Primary" destructive onClick={onConfirm}>
        Unshare
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
          title="Remove shared channel"
          size="Small"
          onClose={onClose}
          footer={footer}
        >
          <div className={modalStyles['matrix-interop-modals__confirm-body']}>
            <p className={modalStyles['matrix-interop-modals__confirm-lead']}>
              This will stop synchronization between the{' '}
              <span className={modalStyles['matrix-interop-modals__confirm-emphasis']}>
                {channel.name}
              </span>{' '}
              Mattermost channel and the linked{' '}
              <span className={modalStyles['matrix-interop-modals__confirm-emphasis']}>
                {connectionName}
              </span>{' '}
              Matrix room{' '}
              <span className={modalStyles['matrix-interop-modals__confirm-emphasis']}>
                {matrixRoomAddress}
              </span>
              .
            </p>
            <ul className={modalStyles['matrix-interop-modals__confirm-list']}>
              <li>No new messages will be synced in either direction.</li>
              <li>Existing messages will remain in both systems.</li>
              <li>The Matrix room will not be deleted.</li>
            </ul>
          </div>
        </Modal>
      </div>
    </div>
  );
}
