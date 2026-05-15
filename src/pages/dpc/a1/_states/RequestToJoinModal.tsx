/**
 * DPC A1 — Request-to-Join modal (US-2, two-step).
 *
 * Step 1 — Preview state per §3.1.3:
 *   • Name + purpose ONLY (NFR-1 — no description, no member count, no admin
 *     list, no message preview)
 *   • Explicit "Send Request" primary action (FR-8 — not "Withdraw")
 *   • No auto-focus on primary (WCAG 2.4.3; Phase 4 §7.3)
 *
 * Step 2 — Pending state:
 *   • Confirmation status + "your request was sent"
 *   • Primary action becomes "Close"
 *   • Subdued (non-destructive) "Withdraw Request" — KD-1 (Critical Feedback #1)
 *
 * Annotated state flow:
 *   user-click "Send Request" → SUBMIT_REQUEST dispatch → step transitions
 *   user-click "Withdraw" → WITHDRAW_REQUEST dispatch → modal closes
 *
 * Rejoin (L&R) flow: `isRejoinFlow=true` is still consumed by the audit
 * pipeline so the FR-13 event payload carries `prior_membership: true`, but
 * there is no longer a user-visible "Previously a member" caption — removed
 * per PRD AC-3.1 (side-channel avoidance, May 2026 design review).
 */
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import { usePersona, type ChannelFixture } from '@/pages/dpc/shared';
import type { A1StoreApi } from '../useA1Store';
import styles from './RequestToJoinModal.module.scss';

export interface RequestToJoinModalProps {
  store: A1StoreApi;
  channel: ChannelFixture;
  isRejoinFlow: boolean;
  onClose: () => void;
}

export default function RequestToJoinModal({
  store,
  channel,
  isRejoinFlow,
  onClose,
}: RequestToJoinModalProps) {
  const { personaInfo, persona } = usePersona();
  const myReq = store.myPendingRequestForChannel(channel.id, persona);
  const isPending = myReq != null;

  const handleSubmit = () => {
    // User-action boundary → SUBMIT_REQUEST. priorMembership captured here
    // so the audit event payload carries §3.1.6's required flag.
    store.submitRequest(personaInfo.username, channel.id, isRejoinFlow);
  };

  const handleWithdraw = () => {
    if (!myReq) return;
    store.withdrawRequest(personaInfo.username, myReq.id);
    onClose();
  };

  return (
    <div className={styles['rtj-modal__overlay']} role="presentation">
      <Modal
        size="Small"
        title={isPending ? 'Request pending' : 'Request to join'}
        onClose={onClose}
        footer={
          <div className={styles['rtj-modal__footer']}>
            {isPending ? (
              <>
                <Button
                  emphasis="Tertiary"
                  size="Medium"
                  onClick={handleWithdraw}
                >
                  Withdraw Request
                </Button>
                <Button emphasis="Primary" size="Medium" onClick={onClose}>
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button emphasis="Tertiary" size="Medium" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  emphasis="Primary"
                  size="Medium"
                  onClick={handleSubmit}
                >
                  Send Request
                </Button>
              </>
            )}
          </div>
        }
      >
        <div className={styles['rtj-modal__channel-row']}>
          <Icon size="20" glyph={<LockOutlineIcon />} />
          <span className={styles['rtj-modal__channel-name']}>
            {channel.displayName}
          </span>
        </div>
        <p className={styles['rtj-modal__channel-purpose']}>{channel.purpose}</p>

        {isPending ? (
          <div className={styles['rtj-modal__pending']}>
            <Icon size="20" glyph={<CheckCircleIcon />} />
            <div>
              <p className={styles['rtj-modal__pending-headline']}>
                Your request was sent.
              </p>
              <p className={styles['rtj-modal__pending-body']}>
                A channel admin will review it and you'll receive a DM with the
                outcome.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className={styles['rtj-modal__intro']}>
              When you request to join:
            </p>
            <ul className={styles['rtj-modal__bullets']}>
              <li>A channel admin will review your request.</li>
              <li>
                You'll receive a DM when your request is approved or declined.
              </li>
              <li>You'll see this channel under "My Pending" until then.</li>
            </ul>
          </>
        )}
      </Modal>
    </div>
  );
}
