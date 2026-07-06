// Surface 2 — System-wide policy scope + static missing-attribute warning
// (FR-2 / FR-3). PRIMARY differentiator across approaches:
//   A — dense: adds an inline SM-2 coverage readout beside the static warning.
//   B — guided: the static warning is a required-acknowledgement guardrail step.
//   C — minimal: the locked static inline note only, no readout, no ack.
// Locked decisions honored: uniform Option A (no Option B toggle), static
// warning only (no interactive pre-save preview), new-channels-only backfill.

import { useState } from 'react';

import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import Radio from '@/components/ui/Radio/Radio';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';

import type { SurfaceScreenProps } from '../shared/types';
import { COVERAGE, POLICY_EXPRESSION } from '../shared/fixtures';
import shared from '../shared/shared.module.scss';

function ScopeSelector({ scope }: { scope: 'all' | 'per-channel' }) {
  return (
    <div className={shared['ack']}>
      <Radio name="policy-scope" checked={scope === 'all'} onChange={() => {}}>
        All channels — current and future
      </Radio>
      <Radio name="policy-scope" checked={scope === 'per-channel'} onChange={() => {}}>
        Selected channels
      </Radio>
    </div>
  );
}

// The locked static warning copy (FR-3 / AC-3b). Reads as product microcopy.
const STATIC_WARNING_TITLE = 'Channels without a classification are skipped';
const STATIC_WARNING_BODY =
  'This policy applies only to channels that have a classification value. Channels without one are not affected. Users without a clearance value are denied.';

export default function Surface2Scope({ approach, state }: SurfaceScreenProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const showExpression = state !== 'default';
  const scope: 'all' | 'per-channel' = state === 'default' ? 'per-channel' : 'all';

  return (
    <>
      <ConsolePanel
        title="Access policy"
        subtitle="Author an access rule once and choose where it applies. Policies are evaluated continuously, not only when a member joins."
      >
        <ConsoleSetting
          label="Rule"
          helpText="Reference channel.classification and user.clearance directly. The rule is enforced on the server."
        >
          <span className={shared['managed-value']}>
            {showExpression ? POLICY_EXPRESSION : 'Add a rule to continue'}
          </span>
        </ConsoleSetting>

        <ConsoleSetting
          label="Apply to"
          helpText="“All channels” covers every channel in this workspace, now and in the future."
        >
          <ScopeSelector scope={scope} />
        </ConsoleSetting>
      </ConsolePanel>

      {/* Static missing-attribute warning — rendered on populated + posture. */}
      {state !== 'default' && (
        <>
          {approach === 'c' && (
            // C — minimal passive inline note only.
            <SectionNotice
              type="Warning"
              title={STATIC_WARNING_TITLE}
              description={STATIC_WARNING_BODY}
            />
          )}

          {approach === 'a' && (
            // A — dense: warning + inline SM-2 coverage readout.
            <ConsolePanel
              title="Coverage"
              subtitle="A count of classified channels relative to this policy. This is a coverage check, not a list of affected channels."
            >
              <div className={shared['coverage']}>
                <div className={shared['coverage__figures']}>
                  <div className={shared['coverage__figure']}>
                    <span className={shared['coverage__value']}>{COVERAGE.classifiedChannels}</span>
                    <span className={shared['coverage__label']}>Classified channels covered</span>
                  </div>
                  <div className={shared['coverage__figure']}>
                    <span className={shared['coverage__value']}>{COVERAGE.unclassifiedChannels}</span>
                    <span className={shared['coverage__label']}>Channels skipped (no classification)</span>
                  </div>
                </div>
              </div>
              <SectionNotice
                type="Warning"
                title={STATIC_WARNING_TITLE}
                description={STATIC_WARNING_BODY}
              />
            </ConsolePanel>
          )}

          {approach === 'b' && (
            // B — guided: required-acknowledgement guardrail before save.
            <ConsolePanel
              title="Confirm before applying"
              subtitle="This rule will apply to every channel in the workspace. Confirm you understand what it does not cover."
            >
              <SectionNotice
                type="Warning"
                title={STATIC_WARNING_TITLE}
                description={STATIC_WARNING_BODY}
              />
              <div className={shared['ack']}>
                <Checkbox
                  checked={state === 'posture' ? true : acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                >
                  I understand channels without a classification are not covered by this rule.
                </Checkbox>
              </div>
            </ConsolePanel>
          )}
        </>
      )}
    </>
  );
}
