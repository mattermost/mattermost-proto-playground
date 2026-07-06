/**
 * DPC V2 A1 — DeclineModal (refactored May 2026).
 *
 * Renders as a modal OVER a real `ChannelShell` so reviewers see how the
 * dialog sits against the underlying members panel + channel chrome.
 *
 * The §3.15 contract is unchanged:
 *   Step 1 — "Decline join request" modal, neutral Primary button.
 *   Step 2 — Confirmation toast (auto-dismisses).
 *
 * Per Change 3: the "DM PREVIEW · WHAT @USER WILL RECEIVE" block that
 * previously sat inside the modal body has been moved out of the
 * product UI into the Review notes below the canvas. The dev note about
 * "Channel name intentionally omitted in §3.15.5..." has likewise been
 * moved out. The modal's body now contains only product UI: the
 * requester strip, the reason TextArea, the character counter, and the
 * neutral Primary button.
 *
 * The modal renders on its own canvas because the only way to reach it
 * from the rail is to click Deny — so this screen is the modal-as-focus
 * with the rail visible behind it.
 */
import { useEffect } from 'react';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Modal from '@/components/ui/Modal/Modal';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import TextArea from '@/components/ui/TextArea/TextArea';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { SUPPORTING_USERS } from '@/pages/dpc/shared';
import AppOverlay from '../_components/AppOverlay';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './DeclineModal.module.scss';

export interface DeclineModalProps {
  store: A1V2StoreApi;
  /**
   * When true, render inside a `ScreenCanvas` with a `ChannelShell`
   * background — used as a standalone review surface. When false
   * (default), render as a page-level overlay that floats over the
   * prototype canvas when triggered by Deny click.
   */
  standalone?: boolean;
}

const REASON_MAX = 500;

export default function DeclineModal({
  store,
  standalone = false,
}: DeclineModalProps) {
  const { state } = store;
  const open = state.declineModalOpen;
  const step = state.declineModalStep;
  const reason = state.declineModalReason;

  const target =
    state.pendingRequests.find((r) => r.id === state.declineModalRequestId) ??
    state.pendingRequests[0] ??
    null;

  const fallbackRequester = SUPPORTING_USERS[2];
  const requesterName = target?.requesterDisplayName ?? fallbackRequester.displayName;
  const requesterUsername = target?.requesterUsername ?? fallbackRequester.username;
  const requesterAvatar = target?.requesterAvatarUrl ?? fallbackRequester.avatarUrl;
  const channelName = store.focusChannel.displayName;

  useEffect(() => {
    if (step !== 'confirm') return;
    const timer = window.setTimeout(() => {
      store.closeDeclineModal();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [step, store]);

  if (!open && !standalone) return null;

  const handleDecline = () => {
    if (!target) {
      store.setDeclineStep('confirm');
      return;
    }
    store.setDeclineStep('confirm');
    window.setTimeout(() => {
      store.denyRequest('ops.coord', target.id, reason || undefined);
    }, 250);
  };

  const counterLabel = `${reason.length} / ${REASON_MAX}`;
  const counterAmber = reason.length >= 450 && reason.length < REASON_MAX;
  const counterFull = reason.length >= REASON_MAX;

  const dialog = (
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
            <Button emphasis="Primary" size="Medium" onClick={handleDecline}>
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
            @{requesterUsername} has been notified.
          </p>
          <p className={styles['v2-decline-modal__confirm-foot']}>
            This dialog will close automatically.
          </p>
        </div>
      )}
    </Modal>
  );

  if (!standalone) {
    return (
      <div
        className={styles['v2-decline-modal__page-overlay']}
        role="presentation"
      >
        {dialog}
      </div>
    );
  }

  return (
    <ScreenCanvas
      eyebrow="§3.15"
      title="Decline modal — two-step neutral register"
      subtitle="Modal over a real channel — Primary uses neutral emphasis (not destructive red) per the OPEN-E winner."
      canvas={
        <DpcAppShell
          focusChannelName={channelName}
          focusIsDiscoverable
          focusHasPendingDot
          channelHeader={
            <ChannelHeader
              type="Channel"
              name={channelName}
              description={store.focusChannel.purpose}
              memberCount={store.focusChannel.memberCount}
              pinnedCount={2}
              infoToggled
            />
          }
          overlay={<AppOverlay maxWidth={760}>{dialog}</AppOverlay>}
        >
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <EmptyState
                  title="Decline modal is the focus"
                  description="The modal is anchored over the channel. Click outside is a no-op (prevents slip-cancel mid-typing)."
                />
              </div>
            </Scrollbars>
          </div>
        </DpcAppShell>
      }
      reviewSummary='Primary "Decline" uses neutral emphasis, not destructive red. Destructive styling primes a defensive copy register; neutral matches the admin-routine register for decline-volume channels. Click-outside is a no-op (§3.15.3) to prevent slip-cancel.'
      reviewItems={[
        {
          heading: 'DM preview — what @' + requesterUsername + ' will receive',
          body: (
            <DmPreviewPane
              hasReason={reason.trim().length > 0}
              reason={reason}
              requesterUsername={requesterUsername}
              channelName={channelName}
            />
          ),
        },
        {
          heading: 'Channel name omission (§3.15.5)',
          body: (
            <p>
              Channel name is intentionally omitted from the production DM
              template to preserve silent-channel-existence in the S1 fallback
              case. Here <code>#{channelName}</code> is shown in the preview
              for reviewer context only — the real DM does not include it.
            </p>
          ),
        },
      ]}
    />
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
    <div className={styles['v2-decline-modal__dm']}>
      <div className={styles['v2-decline-modal__dm-header']}>
        <span className={styles['v2-decline-modal__dm-label']}>
          DM preview · what @{requesterUsername} will receive
        </span>
        <LabelTag
          label={hasReason ? 'With reason' : 'No reason'}
          type={hasReason ? 'Info' : 'Default'}
          size="X-Small"
          casing="Title Case"
        />
      </div>
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
      <p className={styles['v2-decline-modal__dm-meta']}>
        Production template omits <code>#{channelName}</code> per §3.15.5.
      </p>
    </div>
  );
}
