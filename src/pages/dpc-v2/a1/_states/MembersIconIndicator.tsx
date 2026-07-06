/**
 * DPC V2 A1 — MembersIconIndicator (NEW, May 2026).
 *
 * The second surface of the pending-request indicator system (§3.24):
 * the channel-header members icon with a 6px theme-aware dot when the
 * current admin has pending join requests on this channel.
 *
 * Pattern source: Figma 4888:61576 — the Compass DS "Unread Badge"
 * pattern reused on the channel-header members icon.
 *
 * Anatomy per Figma 4888:61576:
 *
 *   Members Button (padding 6px):
 *     Content (flex row, gap 4px, items center, position relative):
 *       Icon Container (12px square):
 *         Icon (account-outline)
 *       Unread Badge (absolute, left 8px, top -2px, 6px)
 *       Count text ("48")
 *
 * The Unread Badge is positioned relative to the Content flex container
 * (NOT the entire button-with-count wrapper). With `left: 8px, top: -2px`
 * relative to Content, the dot sits over the top-right corner of the
 * 12px icon glyph — overlapping ~4px and extending ~2px past its right
 * edge.
 *
 * Color resolves via --sidebar-text-active-border, theme-aware across
 * all 5 themes (denim, sapphire, quartz, indigo, onyx) — same token as
 * the LHS row dot.
 *
 * Two variants render side-by-side for design review:
 *   Option A — 3 pending requests on this channel (dot visible).
 *   Option B — 0 pending requests (control, no dot).
 *
 * We build a custom MembersButtonWithDot that matches the Figma Members
 * Button exactly rather than overlaying a dot on the playground's
 * IconButton — the IconButton's structure does not give the dot the
 * correct reference frame.
 */
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import MembersIconWithDot from '../_components/MembersIconWithDot';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './MembersIconIndicator.module.scss';

export interface MembersIconIndicatorProps {
  store: A1V2StoreApi;
}

// MembersButtonWithDot anatomy now lives in
// `_components/MembersIconWithDot` so the consolidated
// PendingRequestIndicators screen and this isolated screen share a single
// source of truth for the dot styling.

export default function MembersIconIndicator({
  store,
}: MembersIconIndicatorProps) {
  const seedPending = store.state.pendingRequests.length;
  const pendingActive = Math.max(seedPending, 3);

  return (
    <ScreenCanvas
      eyebrow="§3.24"
      title="Channel header members icon — pending dot"
      subtitle="6px theme-aware dot (Figma 4888:61576 Unread Badge pattern) over the account-outline members button. Paired with the LHS row dot so the signal reinforces across both navigation and active-channel chrome."
      canvas={
        <div className={styles['v2-members-icon-indicator__variants']}>
          <div className={styles['v2-members-icon-indicator__variant']}>
            <span className={styles['v2-members-icon-indicator__variant-label']}>
              Option A — {pendingActive} pending on this channel
            </span>
            <div className={styles['v2-members-icon-indicator__chrome']}>
              <ChannelHeader
                type="Channel"
                name={store.focusChannel.displayName}
                description={store.focusChannel.purpose}
                memberCount={store.focusChannel.memberCount}
                pinnedCount={2}
              />
            </div>
            <div className={styles['v2-members-icon-indicator__detail']}>
              <span
                className={styles['v2-members-icon-indicator__detail-label']}
              >
                Detail (members button only)
              </span>
              <MembersIconWithDot
                memberCount={store.focusChannel.memberCount}
                pendingCount={pendingActive}
              />
            </div>
          </div>

          <div className={styles['v2-members-icon-indicator__variant']}>
            <span className={styles['v2-members-icon-indicator__variant-label']}>
              Option B — 0 pending (control)
            </span>
            <div className={styles['v2-members-icon-indicator__chrome']}>
              <ChannelHeader
                type="Channel"
                name={store.focusChannel.displayName}
                description={store.focusChannel.purpose}
                memberCount={store.focusChannel.memberCount}
                pinnedCount={2}
              />
            </div>
            <div className={styles['v2-members-icon-indicator__detail']}>
              <span
                className={styles['v2-members-icon-indicator__detail-label']}
              >
                Detail (members button only)
              </span>
              <MembersIconWithDot
                memberCount={store.focusChannel.memberCount}
                pendingCount={0}
              />
            </div>
          </div>
        </div>
      }
      reviewSummary="The dot is the action-required cue for approvers, lifted from the Compass DS Unread Badge pattern. Theme-aware via --sidebar-text-active-border — no hardcoded color."
      reviewItems={[
        {
          heading: 'Why a dot, not a count',
          body: (
            <p>
              The numeric pending count already lives on the right-rail
              Pending Requests queue (FR-9). Stacking a number here would
              compete with the existing 48-member count and add density
              without information. The dot is binary action-required
              semantics (KD-26 subtle-by-default); precision belongs in
              the queue.
            </p>
          ),
        },
        {
          heading: 'Theme awareness — load-bearing',
          body: (
            <p>
              The dot color resolves through{' '}
              <code>var(--sidebar-text-active-border)</code> which is
              defined per-theme in <code>themes.scss</code>: denim →{' '}
              <code>color-blue-300</code>, sapphire →{' '}
              <code>color-cyan-300</code>, quartz →{' '}
              <code>color-cyan-500</code>, indigo / onyx →{' '}
              <code>#4a7ce8</code>. No hardcoded hex. The same token
              drives the LHS-row dot so the two surfaces stay visually
              coherent across theme changes.
            </p>
          ),
        },
        {
          heading: 'A11y',
          body: (
            <p>
              When the dot is visible, the members button{' '}
              <code>aria-label</code> includes the suffix{' '}
              <code>"(pending requests)"</code> so screen-reader users
              receive the action-required signal without relying on
              color. The dot itself is <code>aria-hidden</code> — it is
              decorative reinforcement of the label.
            </p>
          ),
        },
        {
          heading: 'Placement metrics (Figma 4888:61576)',
          body: (
            <p>
              Dot is positioned <code>top: -2px</code>,{' '}
              <code>left: 8px</code> relative to the Content flex
              container (which starts at the icon's top-left after the
              6px button padding). Size <code>6x6 px</code> with{' '}
              <code>border-radius: 50%</code>. The dot sits over the
              top-right corner of the 12px account-outline icon —
              overlapping ~4px and extending ~2px past its right edge.
              Z-order sits above the icon so the dot remains visible
              during hover and press states.
            </p>
          ),
        },
      ]}
    />
  );
}
