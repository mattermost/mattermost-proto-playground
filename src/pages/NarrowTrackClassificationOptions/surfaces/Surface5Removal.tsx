// Surface 5 — Continuous re-eval / membership removal notice (FR-10).
// SECONDARY differentiator, and the only field-facing surface:
//   A — verbose explanatory panel (desktop-detailed).
//   B — concise, plain-language, field-legible message (aria-live, degrades
//       to plain text) — best-tuned for the field operator.
//   C — standard system notification (existing pattern), not field-tuned.
// The policy label reads "evaluated continuously" (AC-10b) in all approaches.

import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import SyncIcon from '@mattermost/compass-icons/components/sync';

import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import ToastBanner from '@/components/ui/ToastBanner/ToastBanner';
import Icon from '@/components/ui/Icon/Icon';
import EmptyState from '@/components/ui/EmptyState/EmptyState';

import type { SurfaceScreenProps } from '../shared/types';
import { REMOVAL_EVENT, levelById } from '../shared/fixtures';
import shared from '../shared/shared.module.scss';

export default function Surface5Removal({ approach, state }: SurfaceScreenProps) {
  const required = levelById(REMOVAL_EVENT.requiredLevelId);
  const channelName = REMOVAL_EVENT.channel.name;

  const liveLabel = (
    <span className={shared['live-label']}>
      <Icon size="12" glyph={<SyncIcon />} />
      Access to this channel is evaluated continuously as clearance changes.
    </span>
  );

  if (state === 'default') {
    // Before any removal — the live-evaluated status only.
    return (
      <ConsolePanel
        title="Channel access"
        subtitle="Membership reflects live trust. Access is re-checked whenever clearance changes, not only when a member joins."
      >
        {liveLabel}
      </ConsolePanel>
    );
  }

  if (state === 'populated') {
    // The removed user's own view of why access ended — the live-status panel
    // plus the notice, at each approach's fidelity.
    return (
      <ConsolePanel
        title="Channel access"
        subtitle=""
      >
        {liveLabel}
        {approach === 'a' && (
          <div className={shared['removal']} role="status" aria-live="polite">
            <SectionNotice
              type="Danger"
              title={`You were removed from ${channelName}`}
              description={
                <>
                  <span className={shared['removal__detail']}>{REMOVAL_EVENT.cause}</span>
                  <br />
                  <span className={shared['removal__meta']}>
                    This channel requires {required?.label} clearance. Access is re-checked
                    continuously, so membership was removed automatically when your clearance
                    changed. Contact your security officer if you believe this is an error.
                  </span>
                </>
              }
            />
          </div>
        )}
        {approach === 'b' && (
          <div className={`${shared['removal']} ${shared['removal--concise']}`} role="status" aria-live="polite">
            <SectionNotice
              type="Danger"
              icon={<Icon size="20" glyph={<LockOutlineIcon />} />}
              title={`Removed from ${channelName}`}
              description={`${REMOVAL_EVENT.cause} Requires ${required?.label}.`}
            />
          </div>
        )}
        {approach === 'c' && (
          <div role="status" aria-live="polite">
            <ToastBanner
              type="Danger"
              message={`You were removed from ${channelName}. Your clearance no longer meets the requirement.`}
            />
          </div>
        )}
      </ConsolePanel>
    );
  }

  // posture — the field/low-bandwidth legibility posture of the notice.
  return (
    <ConsolePanel
      title="Channel access"
      subtitle="How the removal notice reads when it reaches an operator."
    >
      {liveLabel}
      {approach === 'b' && (
        // Plain-text fallback that stays legible with no styling / low bandwidth.
        <div className={`${shared['removal']} ${shared['removal--concise']}`} role="status" aria-live="assertive">
          <p className={shared['removal__detail']}>
            Removed from {channelName} — clearance no longer meets {required?.label}.
          </p>
        </div>
      )}
      {approach === 'a' && (
        <div className={shared['removal']} role="status" aria-live="polite">
          <SectionNotice
            type="Danger"
            title={`You were removed from ${channelName}`}
            description={`This channel requires ${required?.label} clearance. ${REMOVAL_EVENT.cause}`}
          />
        </div>
      )}
      {approach === 'c' && (
        <EmptyState
          title="Standard notification"
          description={`The removal uses the standard system notification pattern: “You were removed from ${channelName}.”`}
        />
      )}
    </ConsolePanel>
  );
}
