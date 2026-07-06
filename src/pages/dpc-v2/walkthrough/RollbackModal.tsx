/**
 * DPC V2 — RollbackModal (atomicity rollback overlay, §4.6).
 *
 * Opens when an admin commits the Confirm-and-Commit modal but the server
 * rejects it. Five rejection reason codes are supported (stale_policy_hash,
 * stale_channel_version, stale_pending_request_count,
 * acknowledgment_token_expired, server_error). The UX is deliberately opaque
 * from a security posture standpoint: the modal acknowledges the failure,
 * surfaces the reason in plain language, resets the dirty toggle UI to its
 * server-persisted value, and offers a single CTA to dismiss.
 *
 * First-pass freehand design — open to feedback from the user before lock.
 */
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import type { A1V2StoreApi, RollbackReason } from '../a1/useA1V2Store';
import styles from './RollbackModal.module.scss';

export interface RollbackModalProps {
  store: A1V2StoreApi;
}

interface ReasonCopy {
  title: string;
  body: string;
}

const REASON_COPY: Record<RollbackReason, ReasonCopy> = {
  stale_policy_hash: {
    title: 'The Membership Policy changed while you were reviewing this dialog.',
    body: 'The matched-user count you saw may no longer be accurate. Reopen the dialog to see the current state and try again.',
  },
  stale_channel_version: {
    title: 'The channel was modified by another admin.',
    body: 'Channel settings changed while you were reviewing this dialog. Reload to see the latest state and try again.',
  },
  stale_pending_request_count: {
    title: 'New join requests came in while you were reviewing this dialog.',
    body: 'The auto-approval cascade count has changed. Reload to see the current count and try again.',
  },
  acknowledgment_token_expired: {
    title: 'This dialog has been open for too long.',
    body: 'For your security, changes need to be confirmed within 10 minutes. Reload and try again.',
  },
  server_error: {
    title: 'We couldn’t save your changes.',
    body: 'Something went wrong on our end. The channel state was not changed. Try again in a moment.',
  },
};

export default function RollbackModal({ store }: RollbackModalProps) {
  const open = store.state.rollbackModalOpen;
  const reason = store.state.rollbackModalReason;
  if (!open || !reason) return null;

  const copy = REASON_COPY[reason];

  return (
    <div className={styles['rollback-modal__overlay']} role="presentation">
      <Modal
        size="Small"
        title="Channel state not changed"
        onClose={() => store.closeRollbackModal()}
        footer={
          <div className={styles['rollback-modal__footer']}>
            <Button
              emphasis="Primary"
              size="Medium"
              onClick={() => store.closeRollbackModal()}
            >
              Close and reload
            </Button>
          </div>
        }
      >
        <div
          className={styles['rollback-modal__body']}
          role="alertdialog"
          aria-live="assertive"
        >
          <div className={styles['rollback-modal__icon']}>
            <AlertCircleOutlineIcon size={24} />
          </div>
          <div className={styles['rollback-modal__text']}>
            <p className={styles['rollback-modal__title']}>{copy.title}</p>
            <p className={styles['rollback-modal__detail']}>{copy.body}</p>
            <p className={styles['rollback-modal__sr-only']}>
              The Discoverable toggle has been reset to its previous state.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
