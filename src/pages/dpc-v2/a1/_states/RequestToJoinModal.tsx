/**
 * DPC V2 A1 — RequestToJoinModal (dual-mode, v2.3).
 *
 * Two modes:
 *
 *   1. `standalone` — review surface that renders Step 1 + Step 2
 *      side-by-side inside ScreenCanvas blocks. Used inside the persona
 *      screen stacks so reviewers can scrub both steps without firing
 *      the trigger. Identical layout to the prior 2026-05-18 review pass.
 *
 *   2. page-level overlay (default) — mounts only when
 *      `state.requestToJoinModalOpen` is true. Reads `state.requestToJoinStep`
 *      to choose Step 1 vs Step 2. This is the runtime behavior when a row
 *      in BrowseChannels / ChannelSwitcher / PermalinkUnfurl dispatches
 *      `store.openRequestToJoin(channelId)`.
 *
 * Copy compliance:
 *   - v2.3 §6.3 SG4 Step 1 body: "A channel admin will review your request."
 *     (Replaces the prior "will be notified about" wording.)
 *   - Withdraw remains Tertiary emphasis per KD-1 (non-destructive, two-step).
 */
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Modal from '@/components/ui/Modal/Modal';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import { CHANNELS, usePersona } from '@/pages/dpc/shared';
import AppOverlay from '../_components/AppOverlay';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './RequestToJoinModal.module.scss';

export interface RequestToJoinModalProps {
  store: A1V2StoreApi;
  /**
   * When true, renders the dual-step showcase inside ScreenCanvas wrappers.
   * When false (default), renders only when `state.requestToJoinModalOpen`
   * — the page-level overlay behavior triggered by row clicks elsewhere.
   */
  standalone?: boolean;
}

export default function RequestToJoinModal({
  store,
  standalone = false,
}: RequestToJoinModalProps) {
  const { state } = store;
  const { personaInfo } = usePersona();

  // ── Page-level overlay (default) ──────────────────────────────────────
  if (!standalone) {
    if (!state.requestToJoinModalOpen || !state.activeRequestChannelId) {
      return null;
    }

    const channelId = state.activeRequestChannelId;
    const channel =
      CHANNELS.find((c) => c.id === channelId) ?? store.focusChannel;
    const channelName = channel.displayName;
    const memberCount = channel.memberCount;

    const handleCancel = () => store.closeRequestToJoin();
    const handleClose = () => store.closeRequestToJoin();
    const handleSendRequest = () => {
      const priorMembership = state.rejoinableChannels.includes(channelId);
      store.submitRequest(personaInfo.username, channelId, priorMembership);
      store.setRequestStep('pending');
    };
    const handleWithdraw = () => {
      const req = state.pendingRequests.find(
        (r) =>
          r.channelId === channelId &&
          r.requesterUsername === personaInfo.username,
      );
      if (req) store.withdrawRequest(personaInfo.username, req.id);
      store.closeRequestToJoin();
    };

    const step = state.requestToJoinStep;

    return (
      <div
        className={styles['v2-request-modal__page-overlay']}
        role="presentation"
      >
        {step === 'preview' ? (
          <Modal
            size="Small"
            title={`Request to join #${channelName}`}
            subtitle={`${memberCount} members`}
            onClose={handleCancel}
            footer={
              <div className={styles['v2-request-modal__footer']}>
                <Button
                  emphasis="Tertiary"
                  size="Medium"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  emphasis="Primary"
                  size="Medium"
                  onClick={handleSendRequest}
                >
                  Send Request
                </Button>
              </div>
            }
          >
            <div className={styles['v2-request-modal__body']}>
              <p className={styles['v2-request-modal__copy']}>
                A channel admin will review your request. You&apos;ll receive a
                direct message once they&apos;ve approved or declined. You can
                withdraw your request at any time.
              </p>
            </div>
          </Modal>
        ) : (
          <Modal
            size="Small"
            title={`Request to join #${channelName}`}
            subtitle="Pending"
            onClose={handleClose}
            footer={
              <div className={styles['v2-request-modal__footer']}>
                <Button
                  emphasis="Tertiary"
                  size="Medium"
                  onClick={handleWithdraw}
                >
                  Withdraw Request
                </Button>
                <Button
                  emphasis="Primary"
                  size="Medium"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </div>
            }
          >
            <div
              className={styles['v2-request-modal__body']}
              role="status"
              aria-live="polite"
            >
              <p className={styles['v2-request-modal__copy']}>
                Your request to join <strong>#{channelName}</strong> has been
                sent. A channel admin will review it. You&apos;ll get a direct
                message once they&apos;ve decided.
              </p>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ── Standalone showcase (review surface) ──────────────────────────────
  const channel = store.focusChannel;
  const channelName = channel.displayName;

  const step1Dialog = (
    <Modal
      size="Small"
      title={`Request to join #${channelName}`}
      subtitle={`${channel.memberCount} members`}
      onClose={() => {}}
      footer={
        <div className={styles['v2-request-modal__footer']}>
          <Button emphasis="Tertiary" size="Medium">
            Cancel
          </Button>
          <Button emphasis="Primary" size="Medium">
            Send Request
          </Button>
        </div>
      }
    >
      <div className={styles['v2-request-modal__body']}>
        <p className={styles['v2-request-modal__copy']}>
          A channel admin will review your request. You&apos;ll receive a
          direct message once they&apos;ve approved or declined. You can
          withdraw your request at any time.
        </p>
      </div>
    </Modal>
  );

  const step2Dialog = (
    <Modal
      size="Small"
      title={`Request to join #${channelName}`}
      subtitle="Pending"
      onClose={() => {}}
      footer={
        <div className={styles['v2-request-modal__footer']}>
          <Button emphasis="Tertiary" size="Medium">
            Withdraw Request
          </Button>
          <Button emphasis="Primary" size="Medium">
            Close
          </Button>
        </div>
      }
    >
      <div
        className={styles['v2-request-modal__body']}
        role="status"
        aria-live="polite"
      >
        <p className={styles['v2-request-modal__copy']}>
          Your request to join <strong>#{channelName}</strong> has been sent. A
          channel admin will review it. You&apos;ll get a direct message once
          they&apos;ve decided.
        </p>
      </div>
    </Modal>
  );

  return (
    <>
      <ScreenCanvas
        eyebrow="§3.13 — Step 1"
        title="Request to Join modal — preview"
        subtitle="Consequence-focused: explains what happens after Send Request. No purpose text."
        canvas={
          <DpcAppShell
            focusChannelName="general"
            focusIsDiscoverable={false}
            channelHeader={
              <ChannelHeader
                type="Channel"
                name="general"
                description="Team-wide announcements and broad coordination."
                memberCount={142}
                pinnedCount={3}
              />
            }
            overlay={<AppOverlay maxWidth={620}>{step1Dialog}</AppOverlay>}
          >
            <div className={shellStyles['channel-shell__messages']}>
              <Scrollbars>
                <div className={shellStyles['channel-shell__messages-list']}>
                  <EmptyState
                    title="Request modal opens here"
                    description="Trigger is Request to join from Browse Channels, channel switcher, or a permalink unfurl card."
                  />
                </div>
              </Scrollbars>
            </div>
          </DpcAppShell>
        }
        reviewItems={[
          {
            heading: 'Modal copy (v2.3 §6.3 SG4)',
            body: (
              <p>
                Step 1 body: <code>&ldquo;A channel admin will review your
                request.&rdquo;</code> (Revised from the prior &ldquo;will be
                notified about&rdquo; wording to match spec literal.)
                Consequence-focused — channel-discovery work happens upstream
                in Browse Channels and the channel switcher.
              </p>
            ),
          },
          {
            heading: 'Member count kept in subtitle',
            body: (
              <p>
                Member count stays in the modal subtitle — confirms the channel
                is non-empty and matches the count on the Browse Channels row.
                No admin list, no activity preview, no purpose text.
              </p>
            ),
          },
        ]}
      />
      <ScreenCanvas
        eyebrow="§3.13 — Step 2"
        title="Request to Join modal — pending"
        subtitle='Post-submit confirmation. Withdraw is subdued (Tertiary, NOT destructive) per KD-1.'
        canvas={
          <DpcAppShell
            focusChannelName="general"
            focusIsDiscoverable={false}
            channelHeader={
              <ChannelHeader
                type="Channel"
                name="general"
                description="Team-wide announcements and broad coordination."
                memberCount={142}
                pinnedCount={3}
              />
            }
            overlay={<AppOverlay maxWidth={620}>{step2Dialog}</AppOverlay>}
          >
            <div className={shellStyles['channel-shell__messages']}>
              <Scrollbars>
                <div className={shellStyles['channel-shell__messages-list']}>
                  <EmptyState
                    title="Pending state shown after Send Request"
                    description='Step 2 confirms submission and offers a subdued Withdraw affordance. Status text is announced via a polite live region.'
                  />
                </div>
              </Scrollbars>
            </div>
          </DpcAppShell>
        }
        reviewItems={[
          {
            heading: 'Two-step pattern preserved',
            body: (
              <p>
                Step 1 (preview) &rarr; Send Request &rarr; Step 2 (pending).
                Step 2 copy reframes around the requester&apos;s next move
                without repeating Step 1 wording.
              </p>
            ),
          },
          {
            heading: 'Withdraw remains non-destructive (KD-1)',
            body: (
              <p>
                Withdraw is Tertiary emphasis, not destructive red. Primary
                action is Close.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
