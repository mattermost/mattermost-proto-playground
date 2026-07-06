/**
 * DPC V2 A1 — PendingRequestsRail (refactored May 2026).
 *
 * Renders as the right-rail inside a real `ChannelShell` via the
 * `trailing` slot — reviewers see the rail in the real product
 * position next to the channel feed, not as a standalone card.
 *
 * The rail markup itself now lives in
 * `_components/PendingRequestsRailContent` so both this standalone
 * screen AND the consolidated PendingRequestIndicators showcase render
 * the same aside against the same SCSS module — no forked anatomy.
 *
 * Empty-state copy refreshed per §3.14.4. Deny → openDeclineModal()
 * unchanged from V1; the modal lives in `_states/DeclineModal.tsx`.
 */
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import PendingRequestsRailContent from '../_components/PendingRequestsRailContent';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi } from '../useA1V2Store';

export interface PendingRequestsRailProps {
  store: A1V2StoreApi;
}

export default function PendingRequestsRail({
  store,
}: PendingRequestsRailProps) {
  const { state, focusChannel } = store;
  const pending = state.pendingRequests;

  return (
    <ScreenCanvas
      eyebrow="§3.14"
      title="Members RHS with Pending Requests"
      subtitle="Right-rail inside the channel — approvers see the pending list at the top of the Members panel, with single-click Approve and Deny → DeclineModal."
      canvas={
        <DpcAppShell
          focusChannelName={focusChannel.displayName}
          focusIsDiscoverable
          focusHasPendingDot={pending.length > 0}
          channelHeader={
            <ChannelHeader
              type="Channel"
              name={focusChannel.displayName}
              description={focusChannel.purpose}
              memberCount={focusChannel.memberCount}
              pinnedCount={2}
              infoToggled
            />
          }
          trailing={<PendingRequestsRailContent store={store} />}
        >
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <EmptyState
                  title="Focus is the right-rail"
                  description="Pending requests render at the top of the Members panel for approvers."
                />
              </div>
            </Scrollbars>
          </div>
        </DpcAppShell>
      }
      reviewSummary="Approve is single-click (FR-7). Deny opens the two-step DeclineModal (§3.14.3 + §3.15) — no inline reason capture, no immediate deny dispatch."
      reviewItems={[
        {
          heading: 'Mobile parity',
          body: (
            <p>
              The structural anatomy and a11y semantics match V1 (per §3.14.2).
              On mobile (≤480px) the rail moves to a separate route — the
              prototype's mobile viewport hides the admin surfaces with the
              KD-8 "Web-only at launch" notice.
            </p>
          ),
        },
      ]}
    />
  );
}
