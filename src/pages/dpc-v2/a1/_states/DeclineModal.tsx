/**
 * DPC V2 A1 — DeclineModal (LOAD-BEARING, NEW in V2; Wave 2D implementation).
 *
 * §3.15 two-step neutral-register decline. OPEN-E Pattern B winner:
 *
 *   Step 1 — Modal open
 *     • Title: "Decline join request"
 *     • Body: "@user requested to join this channel. They'll receive a DM
 *       letting them know their request was declined."
 *     • Optional TextArea reason (max 500), placeholder
 *       "Reason (optional, shared with requester)" with N/500 counter.
 *     • Footer: Tertiary "Cancel" + Primary "Decline" — NEUTRAL emphasis,
 *       NOT destructive red (the entire reason OPEN-E exists).
 *   Step 2 — Confirmation toast
 *     • "Request declined" toast surface, rendered adjacent to the form.
 *
 * The modal also shows an adjacent DM preview pane so reviewers can read
 * the with-reason / without-reason DM templates side-by-side with the
 * reason input.
 *
 * Trigger contract — this component is rendered passively at the prototype
 * root; PendingRequestsRail (Wave 2C) calls store.openDeclineModal() on Deny
 * click and InChannelAdminSysMsg's "Decline…" button also routes through
 * the store. We expose a local "Reset" affordance so a reviewer can scrub
 * between steps without re-triggering the seed request.
 */
import { useEffect } from 'react';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import TextArea from '@/components/ui/TextArea/TextArea';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import { SUPPORTING_USERS } from '@/pages/dpc/shared';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './DeclineModal.module.scss';

export interface DeclineModalProps {
  store: A1V2StoreApi;
}

const REASON_MAX = 500;

export default function DeclineModal({ store }: DeclineModalProps) {
  const { state } = store;
  const open = state.declineModalOpen;
  const step = state.declineModalStep;
  const reason = state.declineModalReason;

  // Find the targeted pending request (fall back to first seed row when
  // the request was already cleared so the preview never goes blank).
  const target =
    state.pendingRequests.find((r) => r.id === state.declineModalRequestId) ??
    state.pendingRequests[0] ??
    null;

  const fallbackRequester = SUPPORTING_USERS[2];
  const requesterName = target?.requesterDisplayName ?? fallbackRequester.displayName;
  const requesterUsername = target?.requesterUsername ?? fallbackRequester.username;
  const requesterAvatar = target?.requesterAvatarUrl ?? fallbackRequester.avatarUrl;
  const channelName = store.focusChannel.displayName;

  // Auto-clear the optimistic "Step 2 — confirm" view after 4s so the
  // toast doesn't linger forever in the demo.
  useEffect(() => {
    if (step !== 'confirm') return;
    const timer = window.setTimeout(() => {
      store.closeDeclineModal();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [step, store]);

  if (!open) return null;

  const handleDecline = () => {
    if (!target) {
      // No real request to decline; just advance to the toast step for the
      // demo flow.
      store.setDeclineStep('confirm');
      return;
    }
    // denyRequest commits and resets the modal flags (see reducer); for the
    // V2 demo we want a brief Step 2 acknowledgment, so we set the step
    // before dispatching.
    store.setDeclineStep('confirm');
    window.setTimeout(() => {
      store.denyRequest('ops.coord', target.id, reason || undefined);
    }, 250);
  };

  const counterLabel = `${reason.length} / ${REASON_MAX}`;
  const counterAmber = reason.length >= 450 && reason.length < REASON_MAX;
  const counterFull = reason.length >= REASON_MAX;

  return (
    <div
      className={styles['v2-decline-modal__overlay']}
      role="presentation"
      onClick={(e) => {
        // Per §3.15.3 — click-outside is a NO-OP (prevents slip-cancel
        // mid-typing). We still surface the click outline visually.
        if (e.target === e.currentTarget) {
          // intentional no-op; modal stays open.
        }
      }}
    >
      <div className={styles['v2-decline-modal__shell']}>
        <Modal
          size="Medium"
          title="Decline join request"
          subtitle={`@${requesterUsername} requested to join #${channelName}`}
          onClose={() => store.closeDeclineModal()}
          footer={
            step === 'reason' ? (
              <div className={styles['v2-decline-modal__footer']}>
                <Button
                  emphasis="Tertiary"
                  size="Medium"
                  onClick={() => store.closeDeclineModal()}
                >
                  Cancel
                </Button>
                <Button
                  emphasis="Primary"
                  size="Medium"
                  onClick={handleDecline}
                >
                  Decline
                </Button>
              </div>
            ) : (
              <div className={styles['v2-decline-modal__footer']}>
                <Button
                  emphasis="Tertiary"
                  size="Medium"
                  onClick={() => store.closeDeclineModal()}
                >
                  Close
                </Button>
              </div>
            )
          }
        >
          {step === 'reason' ? (
            <div className={styles['v2-decline-modal__body']}>
              <div className={styles['v2-decline-modal__requester']}>
                <UserAvatar
                  alt={requesterName}
                  name={requesterName}
                  src={requesterAvatar}
                  size="40"
                />
                <div className={styles['v2-decline-modal__requester-meta']}>
                  <p className={styles['v2-decline-modal__requester-name']}>
                    {requesterName}{' '}
                    <span
                      className={styles['v2-decline-modal__requester-handle']}
                    >
                      @{requesterUsername}
                    </span>
                  </p>
                  <p className={styles['v2-decline-modal__requester-body']}>
                    @{requesterUsername} requested to join this channel.
                    They&apos;ll receive a DM letting them know their request
                    was declined.
                  </p>
                </div>
              </div>

              <div className={styles['v2-decline-modal__reason']}>
                <TextArea
                  size="Medium"
                  placeholder="Reason (optional, shared with requester)"
                  rows={4}
                  maxLength={REASON_MAX}
                  value={reason}
                  onChange={(e) => store.setDeclineReason(e.target.value)}
                  aria-label="Decline reason (optional, shared with requester). 500 character maximum."
                />
                <div
                  className={[
                    styles['v2-decline-modal__counter'],
                    counterAmber
                      ? styles['v2-decline-modal__counter--warn']
                      : '',
                    counterFull
                      ? styles['v2-decline-modal__counter--full']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-live="polite"
                >
                  {counterLabel}
                </div>
              </div>

              <DmPreviewPane
                hasReason={reason.trim().length > 0}
                reason={reason}
                requesterUsername={requesterUsername}
                channelName={channelName}
              />

              <p className={styles['v2-decline-modal__note']}>
                Per §3.15.3 — primary <strong>Decline</strong> uses neutral
                emphasis, <strong>not</strong> destructive red. Destructive
                styling primes a defensive copy register; neutral matches the
                admin-routine register for decline-volume channels. Click
                outside is a no-op to prevent slip-cancel.
              </p>
            </div>
          ) : (
            <div className={styles['v2-decline-modal__confirm']}>
              <LabelTag
                label="Request declined"
                type="Success"
                size="Small"
                casing="Title Case"
              />
              <p className={styles['v2-decline-modal__confirm-body']}>
                Request from <strong>@{requesterUsername}</strong> to join{' '}
                <strong>#{channelName}</strong> has been declined. A DM has
                been sent to the requester
                {reason.trim() ? ' with your reason.' : ' without a reason.'}{' '}
                Audit event <code>request_declined</code> emitted per FR-13.
              </p>
              <p className={styles['v2-decline-modal__confirm-foot']}>
                This dialog will close automatically.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

interface DmPreviewPaneProps {
  hasReason: boolean;
  reason: string;
  requesterUsername: string;
  channelName: string;
}

function DmPreviewPane({
  hasReason,
  reason,
  requesterUsername,
  channelName,
}: DmPreviewPaneProps) {
  return (
    <aside
      className={styles['v2-decline-modal__dm']}
      aria-label="DM preview as the requester will receive it"
    >
      <header className={styles['v2-decline-modal__dm-header']}>
        <span className={styles['v2-decline-modal__dm-label']}>
          DM preview · what @{requesterUsername} will receive
        </span>
        <LabelTag
          label={hasReason ? 'With reason' : 'No reason'}
          type={hasReason ? 'Info' : 'Default'}
          size="X-Small"
          casing="Title Case"
        />
      </header>
      <div className={styles['v2-decline-modal__dm-bubble']}>
        <p className={styles['v2-decline-modal__dm-line']}>
          Your request to join this <strong>Discoverable</strong> channel was
          declined.
        </p>
        {hasReason ? (
          <p className={styles['v2-decline-modal__dm-line']}>
            <strong>Reason from @ops.coord:</strong>{' '}
            <span className={styles['v2-decline-modal__dm-reason']}>
              {reason.slice(0, 500)}
            </span>
          </p>
        ) : null}
      </div>
      <p className={styles['v2-decline-modal__dm-foot']}>
        Channel name is intentionally omitted in §3.15.5 to preserve
        silent-channel-existence in the S1 fallback case; here #{channelName}{' '}
        is shown in the preview for reviewer context only.
      </p>
    </aside>
  );
}
