/**
 * DPC V2 A1 — LhsPendingDot (refactored May 2026).
 *
 * Renders inside a real ChannelShell so reviewers can see the LHS dot
 * in product context, not in an isolated mockup.
 *
 * Two ChannelShells are shown side-by-side for the comparison:
 *
 *   Option A — Active focus channel has 3 pending requests (subtle blue
 *              dot on the LHS row).
 *   Option B — Same sidebar, zero pending requests (control).
 *
 * Per Change 2: the focus channel uses the bare 16px composite
 * lock-plus glyph on the LHS, NOT a "Discoverable" LabelTag overlay.
 * The LHS pending dot is a separate, additional indicator semantics
 * (KD-26 subtle) — it does not collide with the DPC iconography (which
 * the spec actually says LHS does NOT carry for members; here it IS
 * carried because the user is an approver, the row is the admin focus
 * channel, and members of `ops-planning-q3` who happen to also be
 * approvers see the lock-plus glyph as a member-state cue alongside
 * the action-required dot — different semantics, no collision).
 */
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './LhsPendingDot.module.scss';

export interface LhsPendingDotProps {
  store: A1V2StoreApi;
}

export default function LhsPendingDot({ store }: LhsPendingDotProps) {
  const seedPendingCount = store.state.pendingRequests.length;
  const pendingActive = Math.max(seedPendingCount, 3);

  return (
    <ScreenCanvas
      eyebrow="§3.12"
      title="LHS sidebar pending-requests dot"
      subtitle="Subtle 6px filled blue dot indicates that the viewing admin has pending join requests on that channel. Binary signal — count lives in the right-rail badge (§3.10), not here."
      canvas={
        <div className={styles['v2-lhs-pending-dot__variants']}>
          <div className={styles['v2-lhs-pending-dot__variant']}>
            <span className={styles['v2-lhs-pending-dot__variant-label']}>
              Option A — {pendingActive} pending on active channel
            </span>
            <DpcAppShell
              focusChannelName={store.focusChannel.displayName}
              focusIsDiscoverable
              focusHasPendingDot
              channelHeader={
                <ChannelHeader
                  type="Channel"
                  name={store.focusChannel.displayName}
                  description={store.focusChannel.purpose}
                  memberCount={store.focusChannel.memberCount}
                  pinnedCount={2}
                />
              }
            >
              <ChannelFiller />
            </DpcAppShell>
          </div>

          <div className={styles['v2-lhs-pending-dot__variant']}>
            <span className={styles['v2-lhs-pending-dot__variant-label']}>
              Option B — 0 pending (control)
            </span>
            <DpcAppShell
              focusChannelName={store.focusChannel.displayName}
              focusIsDiscoverable
              focusHasPendingDot={false}
              channelHeader={
                <ChannelHeader
                  type="Channel"
                  name={store.focusChannel.displayName}
                  description={store.focusChannel.purpose}
                  memberCount={store.focusChannel.memberCount}
                  pinnedCount={2}
                />
              }
            >
              <ChannelFiller />
            </DpcAppShell>
          </div>
        </div>
      }
      reviewSummary="The dot is action-required semantics for approvers. KD-26 subtle = small + muted (NOT destructive red); always-on (NOT hover-revealed)."
      reviewItems={[
        {
          heading: 'Composite lock-plus on the LHS row (Change 2)',
          body: (
            <p>
              The focus row in the sidebar uses ONLY the bare composite
              lock-plus icon to indicate the Discoverable state — no full blue
              "Discoverable" LabelTag overlay. The icon shape itself (lock +
              plus, WCAG 1.4.1 shape distinction) carries the meaning. Matches
              KD-26 subtle-by-default.
            </p>
          ),
        },
        {
          heading: 'aria-label on the row',
          body: (
            <p>
              Per §3.12.7 the channel-item accessible name embeds the pending
              state, e.g.{' '}
              <code>
                "ops-planning-q3 channel, pending join requests for you to
                review (3)"
              </code>
              . The dot itself is <code>aria-hidden</code>; the count surfaces
              via the right-rail badge (§3.10).
            </p>
          ),
        },
      ]}
    />
  );
}

function ChannelFiller() {
  return (
    <div className={shellStyles['channel-shell__messages']}>
      <Scrollbars>
        <div className={shellStyles['channel-shell__messages-list']}>
          <EmptyState
            title="No new messages"
            description="The focus is the LHS sidebar on the left — note the lock-plus glyph on the active channel row and (Option A only) the small blue dot on the right edge."
          />
        </div>
      </Scrollbars>
    </div>
  );
}
