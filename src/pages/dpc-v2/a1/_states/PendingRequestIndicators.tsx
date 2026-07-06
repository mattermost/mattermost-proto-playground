/**
 * DPC V2 A1 — PendingRequestIndicators (NEW, May 2026).
 *
 * Consolidates all three pending-request indicator surfaces into ONE
 * canvas so reviewers see the system together rather than scattered
 * across three separate screens (stakeholder feedback, May 2026 round).
 *
 * Surfaces shown together in product chrome:
 *
 *   1. LHS sidebar — pending dot on the active focus-channel row
 *      (DpcAppShell, focusHasPendingDot).
 *   2. Channel header — 6px theme-aware dot on the account-outline
 *      members button (MembersIconWithDot composed into a lightweight
 *      custom header that mirrors ChannelHeader's anatomy).
 *   3. Right-rail Members panel — Pending Requests queue with single-
 *      click Approve and two-step Deny (PendingRequestsRailContent).
 *
 * All three surfaces share `var(--sidebar-text-active-border)` so they
 * track across all five themes (denim / sapphire / quartz / indigo /
 * onyx). Spec reference: §3.24 cross-surface indicator system.
 *
 * The standalone Approve / Decline flow continues to live in
 * `_states/PendingRequestsRail.tsx` — this screen is an indicator
 * showcase, not a replacement for the admin-decision flow screen.
 */
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import channelHeaderStyles from '@/components/ui/ChannelHeader/ChannelHeader.module.scss';
import DpcAppShell, { shellStyles } from '../_components/DpcAppShell';
import MembersIconWithDot from '../_components/MembersIconWithDot';
import PendingRequestsRailContent from '../_components/PendingRequestsRailContent';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './PendingRequestIndicators.module.scss';

export interface PendingRequestIndicatorsProps {
  store: A1V2StoreApi;
}

/**
 * Lightweight channel header that mirrors `ChannelHeader`'s anatomy
 * but swaps the regular members IconButton for `MembersIconWithDot`.
 * Reuses `ChannelHeader.module.scss` for the outer chrome so the
 * header looks identical to the production component except for the
 * dot affordance — no parallel CSS module forked.
 */
function ChannelHeaderWithMembersDot({
  name,
  description,
  memberCount,
  pendingCount,
  pinnedCount,
}: {
  name: string;
  description?: string;
  memberCount: number;
  pendingCount: number;
  pinnedCount?: number;
}) {
  return (
    <div className={channelHeaderStyles['channel-header']}>
      <div className={channelHeaderStyles['channel-header__left']}>
        <div className={channelHeaderStyles['channel-header__top-row']}>
          <IconButton
            size="X-Small"
            aria-label="Add to favorites"
            icon={<StarOutlineIcon size={18} />}
          />
          <button
            className={channelHeaderStyles['channel-header__name-area']}
            type="button"
          >
            <span className={channelHeaderStyles['channel-header__name']}>
              {name}
            </span>
            <Icon size="16" glyph={<ChevronDownIcon />} />
          </button>

          <div className={channelHeaderStyles['channel-header__stat-icons']}>
            <MembersIconWithDot
              memberCount={memberCount}
              pendingCount={pendingCount}
            />
            {pinnedCount != null && (
              <IconButton
                size="X-Small"
                aria-label={`${pinnedCount} pinned messages`}
                count={pinnedCount}
                icon={<Icon size="12" glyph={<PinOutlineIcon />} />}
              />
            )}
            <IconButton
              size="X-Small"
              aria-label="Files"
              icon={<Icon size="12" glyph={<FileTextOutlineIcon />} />}
            />
          </div>
        </div>

        <div className={channelHeaderStyles['channel-header__description']}>
          {description ?? null}
        </div>
      </div>

      <div className={channelHeaderStyles['channel-header__right']}>
        <Button
          className={channelHeaderStyles['channel-header__call-btn']}
          emphasis="Quaternary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PhoneIcon />} />}
        >
          Start a Call
        </Button>
        <IconButton
          size="Small"
          aria-label="Channel info"
          icon={<Icon size="16" glyph={<InformationOutlineIcon />} />}
          toggled
        />
      </div>
    </div>
  );
}

export default function PendingRequestIndicators({
  store,
}: PendingRequestIndicatorsProps) {
  const { focusChannel, state } = store;
  const pendingCount = Math.max(state.pendingRequests.length, 3);

  return (
    <ScreenCanvas
      eyebrow="§3.24"
      title="Pending-request indicator system — three surfaces in context"
      subtitle="LHS row dot, channel-header members-button dot, and right-rail Pending Requests queue rendered together so reviewers see how the surfaces reinforce one another rather than scattered across separate canvases."
      canvas={
        <DpcAppShell
          focusChannelName={focusChannel.displayName}
          focusIsDiscoverable
          focusHasPendingDot
          channelHeader={
            <ChannelHeaderWithMembersDot
              name={focusChannel.displayName}
              description={focusChannel.purpose}
              memberCount={focusChannel.memberCount}
              pendingCount={pendingCount}
              pinnedCount={2}
            />
          }
          trailing={<PendingRequestsRailContent store={store} />}
        >
          <div className={shellStyles['channel-shell__messages']}>
            <div className={shellStyles['channel-shell__messages-list']}>
              <div className={styles['pending-indicators__callout-stack']}>
                <article className={styles['pending-indicators__callout']}>
                  <span className={styles['pending-indicators__callout-num']}>
                    1
                  </span>
                  <div>
                    <h3 className={styles['pending-indicators__callout-title']}>
                      LHS sidebar dot — ambient signal
                    </h3>
                    <p className={styles['pending-indicators__callout-body']}>
                      Subtle 6px dot on the right edge of the active channel
                      row. Tells approvers a queue exists from anywhere in the
                      app, even when they are reading another channel. Binary
                      — count lives on the right-rail badge, not here.
                    </p>
                  </div>
                </article>

                <article className={styles['pending-indicators__callout']}>
                  <span className={styles['pending-indicators__callout-num']}>
                    2
                  </span>
                  <div>
                    <h3 className={styles['pending-indicators__callout-title']}>
                      Channel-header members icon — in-view signal
                    </h3>
                    <p className={styles['pending-indicators__callout-body']}>
                      6px dot over the top-right corner of the 12px account-
                      outline glyph. Once an approver is reading the channel,
                      the dot signals action-required without competing with
                      the existing 48-member count.
                    </p>
                  </div>
                </article>

                <article className={styles['pending-indicators__callout']}>
                  <span className={styles['pending-indicators__callout-num']}>
                    3
                  </span>
                  <div>
                    <h3 className={styles['pending-indicators__callout-title']}>
                      Right-rail Members panel — actionable queue
                    </h3>
                    <p className={styles['pending-indicators__callout-body']}>
                      Pending Requests section sits at the top of the Members
                      panel. Single-click Approve (FR-7); Deny opens the
                      two-step DeclineModal. This is the only surface that
                      carries the precise pending count and per-request
                      actions.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </DpcAppShell>
      }
      reviewSummary="One canvas, three surfaces. The LHS dot is the ambient at-a-distance cue; the header dot confirms action-required once the channel is in view; the right-rail queue is the only place that exposes the precise count and the Approve / Deny controls."
      reviewItems={[
        {
          heading: 'Shared token — load-bearing across all three surfaces',
          body: (
            <p>
              Every dot resolves through{' '}
              <code>var(--sidebar-text-active-border)</code> — denim →{' '}
              <code>color-blue-300</code>, sapphire →{' '}
              <code>color-cyan-300</code>, quartz →{' '}
              <code>color-cyan-500</code>, indigo / onyx →{' '}
              <code>#4a7ce8</code>. Switching themes from the top bar
              recolours all three dots in lock-step; no surface drifts.
              Hardcoded hex is forbidden anywhere in this chain.
            </p>
          ),
        },
        {
          heading: 'Approver-permission gating',
          body: (
            <p>
              None of these surfaces render for members without approver
              permissions. The LHS dot, the header dot, and the right-rail
              Pending Requests section all key off the same backend signal
              (the viewing user is in the approver set for this channel).
              Non-approvers see the production app exactly as before — no
              dot, no queue, no whisper of the pending state.
            </p>
          ),
        },
        {
          heading: 'Why three, not one',
          body: (
            <p>
              The surfaces operate at different distances. The LHS dot
              works when the approver is in another channel entirely
              (ambient). The header dot is the in-view confirmation that
              survives the user's gaze landing anywhere in the channel
              chrome. The right-rail queue is the action surface. Each
              addresses a different OODA-loop moment; together they prevent
              the queue from being missed without any single surface
              shouting (KD-26 subtle-by-default).
            </p>
          ),
        },
        {
          heading: 'A11y across surfaces',
          body: (
            <p>
              All three dots are <code>aria-hidden</code> — they are
              decorative reinforcement. The channel row's accessible name
              embeds the pending state (per §3.12.7); the members button's{' '}
              <code>aria-label</code> appends{' '}
              <code>"(pending requests)"</code> when the dot is shown; the
              right-rail section heading carries the precise count
              (<code>"Pending Requests (3)"</code>). Screen-reader users
              do not depend on color to receive the signal.
            </p>
          ),
        },
      ]}
    />
  );
}
