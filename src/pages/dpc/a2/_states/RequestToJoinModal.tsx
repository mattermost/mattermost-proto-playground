/**
 * A2 — Two-step Request-to-Join modal (§3.2.3 — same as A1 §3.1.3).
 *
 * Step 1: explicit Send Request CTA.
 * Step 2: pending state with non-destructive Withdraw Request affordance.
 *
 * Submits via store.submitRequest; emits Request_submitted audit event.
 * priorMembership is wired through so rejoin requests carry the PRD AC-3.2
 * payload field.
 */
import { useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import { usePersona } from '@/pages/dpc/shared';
import type { A2StoreApi } from '@/pages/dpc/a2/useA2Store';
import styles from './RequestToJoinModal.module.scss';

export interface RequestToJoinModalProps {
  store: A2StoreApi;
  channelId: string;
  channelName: string;
  channelPurpose: string;
  priorMembership: boolean;
  onClose: () => void;
}

export default function RequestToJoinModal({
  store,
  channelId,
  channelName,
  channelPurpose,
  priorMembership,
  onClose,
}: RequestToJoinModalProps) {
  const { personaInfo } = usePersona();
  const [step, setStep] = useState<1 | 2>(
    store.myPendingRequests.includes(channelId) ? 2 : 1,
  );

  const handleSubmit = () => {
    store.submitRequest(channelId, personaInfo.username, priorMembership);
    setStep(2);
  };

  const handleWithdraw = () => {
    store.withdrawRequest(channelId, personaInfo.username);
    onClose();
  };

  return (
    <div className={styles['request-modal']} role="presentation">
      <div className={styles['request-modal__backdrop']} aria-hidden />
      <Modal
        size="Small"
        title={step === 1 ? 'Request to join' : 'Request pending'}
        onClose={onClose}
        footer={
          step === 1 ? (
            <>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button emphasis="Primary" onClick={handleSubmit}>
                Send Request
              </Button>
            </>
          ) : (
            <>
              <Button emphasis="Tertiary" onClick={handleWithdraw}>
                Withdraw Request
              </Button>
              <Button emphasis="Primary" onClick={onClose}>
                Close
              </Button>
            </>
          )
        }
      >
        <div className={styles['request-modal__body']}>
          <div className={styles['request-modal__channel']}>
            <Icon glyph={<LockOutlineIcon />} size="20" />
            <div className={styles['request-modal__channel-text']}>
              <span className={styles['request-modal__channel-name']}>
                #{channelName}
              </span>
              <span className={styles['request-modal__channel-purpose']}>
                {channelPurpose}
              </span>
            </div>
          </div>

          {step === 1 ? (
            <ul className={styles['request-modal__bullets']}>
              <li>A channel admin will review your request.</li>
              <li>
                You&apos;ll receive a DM when your request is approved or
                declined.
              </li>
              <li>
                You&apos;ll see this channel under &ldquo;My Pending&rdquo;
                until then.
              </li>
              {priorMembership && (
                <li className={styles['request-modal__bullet-meta']}>
                  Your prior membership of this channel is included in the
                  request payload (admin-visible only).
                </li>
              )}
            </ul>
          ) : (
            <div className={styles['request-modal__pending']}>
              <Icon glyph={<CheckCircleOutlineIcon />} size="20" />
              <div>
                <p className={styles['request-modal__pending-headline']}>
                  Your request was sent.
                </p>
                <p className={styles['request-modal__pending-body']}>
                  A channel admin will review it and you&apos;ll receive a DM
                  with the outcome.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
