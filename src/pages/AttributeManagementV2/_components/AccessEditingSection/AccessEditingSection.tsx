import { useState } from 'react';
import RefreshIcon from '@mattermost/compass-icons/components/refresh';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import CheckIcon from '@mattermost/compass-icons/components/check';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Button from '@/components/ui/Button/Button';
import Switch from '@/components/ui/Switch/Switch';
import Icon from '@/components/ui/Icon/Icon';
import Section from '../Section/Section';
import SourceHealthBadge from '../SourceHealthBadge/SourceHealthBadge';
import DisabledControl from '../DisabledControl/DisabledControl';
import {
  isEligibleForPolicies,
  freshnessCaveat,
  textTypeCaveat,
  DISABLED_REASONS,
  type Attribute,
} from '../../data';
import styles from './AccessEditingSection.module.scss';

export interface AccessEditingSectionProps {
  attribute: Attribute;
  onSelfEditToggle: (next: boolean) => void;
  onVisibilityChange: (next: 'Visible' | 'Restricted') => void;
  onSyncNow?: () => void;
  onCopyRunId?: () => void;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.max(1, Math.round((now - then) / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffD = Math.round(diffHr / 24);
  return `${diffD}d ago`;
}

/** Absolute-ish "in 2h" string for the next scheduled run. */
function formatUntil(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((then - now) / 60000);
  if (diffMin <= 0) return 'due now';
  if (diffMin < 60) return `in ${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `in ${diffHr}h`;
  const diffD = Math.round(diffHr / 24);
  return `in ${diffD}d`;
}

export default function AccessEditingSection({
  attribute,
  onSelfEditToggle,
  onVisibilityChange,
  onSyncNow,
  onCopyRunId,
}: AccessEditingSectionProps) {
  const synced =
    attribute.source.kind === 'synced' ? attribute.source : null;
  const appliesToUsers = attribute.appliesTo.some(
    (b) => b.resource === 'Users',
  );
  const eligibility = isEligibleForPolicies(attribute);
  // Finding 1 + 4: freshness and text-type are caveats ON TOP of rule-eligibility.
  const fresh = freshnessCaveat(attribute);
  const textCaveat = textTypeCaveat(attribute);
  // Finding 6: self-edit flips eligibility, so on a policy-bound attribute it
  // gets the same lock treatment as value order.
  const selfEditLockedByPolicy =
    appliesToUsers && !attribute.externallyOwned && attribute.inUseByPolicies > 0;

  // Inline "Sync now" result note (finding 2). Local-only demo affordance.
  const [syncResult, setSyncResult] = useState<{
    tone: 'ok' | 'err';
    text: string;
  } | null>(null);

  const handleSyncNow = () => {
    onSyncNow?.();
    if (!synced) return;
    // Reflect a realistic outcome: Failed retries surface the error;
    // Stale retries succeed (the demo recovery path).
    if (synced.state === 'Stale') {
      setSyncResult({
        tone: 'ok',
        text: `Sync started — completed, ${attribute.values.length || 'all'} records refreshed.`,
      });
    } else {
      setSyncResult({
        tone: 'err',
        text: `Retry failed — ${synced.reason ?? 'the source did not respond.'}`,
      });
    }
  };

  return (
    <Section
      title="Access &amp; editing"
      description="Where this attribute&apos;s values come from, who can edit them, and how access decisions use it."
    >
      <div className={styles['access']}>
        {/* Source / sync */}
        <div className={styles['access__block']}>
          <div className={styles['access__block-head']}>
            <span className={styles['access__block-label']}>Value source</span>
            {synced && <SourceHealthBadge state={synced.state} />}
          </div>
          {synced ? (
            <div className={styles['access__sync']}>
              {/* Finding 2: unhealthy reason / last error, plain-language. */}
              {synced.state !== 'Synced' && synced.reason && (
                <div
                  className={`${styles['access__reason']} ${styles[`access__reason--${synced.state.toLowerCase()}`]}`}
                  role="alert"
                >
                  <span className={styles['access__reason-icon']} aria-hidden>
                    <AlertOutlineIcon size={16} />
                  </span>
                  <span className={styles['access__reason-text']}>
                    <span className={styles['access__reason-head']}>
                      {synced.state === 'Stale'
                        ? 'Source is stale'
                        : 'Last sync failed'}
                    </span>
                    {synced.reason}
                  </span>
                </div>
              )}
              <div className={styles['access__sync-row']}>
                <span className={styles['access__sync-key']}>System</span>
                <span className={styles['access__sync-value']}>
                  {synced.system}
                </span>
              </div>
              <div className={styles['access__sync-row']}>
                <span className={styles['access__sync-key']}>Cadence</span>
                <span className={styles['access__sync-value']}>
                  {synced.cadence}
                </span>
              </div>
              <div className={styles['access__sync-row']}>
                <span className={styles['access__sync-key']}>Last success</span>
                <span className={styles['access__sync-value']}>
                  {formatRelative(synced.lastSuccessISO)}
                </span>
              </div>
              <div className={styles['access__sync-row']}>
                <span className={styles['access__sync-key']}>Last attempt</span>
                <span
                  className={`${styles['access__sync-value']} ${synced.state !== 'Synced' ? styles['access__sync-value--warn'] : ''}`}
                >
                  {formatRelative(synced.lastAttemptISO)}
                  {synced.state !== 'Synced' && (
                    <span className={styles['access__sync-attempt-note']}>
                      (failed)
                    </span>
                  )}
                </span>
              </div>
              {synced.nextRunISO && (
                <div className={styles['access__sync-row']}>
                  <span className={styles['access__sync-key']}>
                    Next scheduled run
                  </span>
                  <span className={styles['access__sync-value']}>
                    {formatUntil(synced.nextRunISO)}
                  </span>
                </div>
              )}
              <div className={styles['access__sync-row']}>
                <span className={styles['access__sync-key']}>Run ID</span>
                <span className={styles['access__sync-value']}>
                  <code className={styles['access__code']}>{synced.runId}</code>
                  <button
                    type="button"
                    className={styles['access__copy']}
                    onClick={onCopyRunId}
                    aria-label="Copy run ID"
                  >
                    <ContentCopyIcon size={12} />
                  </button>
                </span>
              </div>
              <div className={styles['access__sync-fieldmap']}>
                <span className={styles['access__sync-key']}>Field map</span>
                <code className={styles['access__code']}>
                  {synced.fieldMap}
                </code>
              </div>
              {/* Finding 2: Sync now is a visible PRIMARY action for unhealthy
                  sources (not buried in ⋯), with an inline result note. */}
              {synced.state !== 'Synced' && (
                <div className={styles['access__sync-actions']}>
                  <Button
                    emphasis="Primary"
                    size="Small"
                    leadingIcon={<Icon glyph={<RefreshIcon />} size="16" />}
                    onClick={handleSyncNow}
                  >
                    Sync now
                  </Button>
                  {syncResult && (
                    <span
                      className={`${styles['access__sync-result']} ${syncResult.tone === 'ok' ? styles['access__sync-result--ok'] : styles['access__sync-result--err']}`}
                      role="status"
                    >
                      <span
                        className={styles['access__sync-result-icon']}
                        aria-hidden
                      >
                        {syncResult.tone === 'ok' ? (
                          <CheckIcon size={14} />
                        ) : (
                          <AlertOutlineIcon size={14} />
                        )}
                      </span>
                      {syncResult.text}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={styles['access__manual']}>
              <span>Values are set here in Mattermost.</span>
            </div>
          )}
        </div>

        {/* Self-edit (Users-bound only) */}
        {appliesToUsers && (
          <div className={styles['access__block']}>
            <div className={styles['access__block-head']}>
              <span className={styles['access__block-label']}>
                User self-edit
              </span>
            </div>
            {attribute.externallyOwned ? (
              <DisabledControl reason={DISABLED_REASONS.selfEditExternal}>
                <Switch
                  checked={attribute.selfEdit}
                  onChange={() => undefined}
                  secondaryLabel="Users can change their own value from their profile."
                  semiBold
                  disabled
                >
                  {attribute.selfEdit ? 'On' : 'Off'}
                </Switch>
              </DisabledControl>
            ) : selfEditLockedByPolicy ? (
              // Finding 6: same lock treatment as A-05's order lock. The switch
              // reads as guarded; a click routes through the self-edit dry-run.
              <div className={styles['access__guarded']}>
                <DisabledControl
                  reason={DISABLED_REASONS.selfEditLockedByPolicy(
                    attribute.inUseByPolicies,
                  )}
                >
                  <Switch
                    checked={attribute.selfEdit}
                    onChange={() => undefined}
                    secondaryLabel="Users can change their own value from their profile."
                    semiBold
                    disabled
                  >
                    {attribute.selfEdit ? 'On' : 'Off'}
                  </Switch>
                </DisabledControl>
                <button
                  type="button"
                  className={styles['access__guarded-review']}
                  onClick={() => onSelfEditToggle(true)}
                >
                  Used by {attribute.inUseByPolicies} active{' '}
                  {attribute.inUseByPolicies === 1 ? 'policy' : 'policies'} —
                  review impact
                </button>
              </div>
            ) : (
              <Switch
                checked={attribute.selfEdit}
                onChange={(e) =>
                  onSelfEditToggle((e.target as HTMLInputElement).checked)
                }
                secondaryLabel="Users can change their own value from their profile."
                semiBold
              >
                {attribute.selfEdit ? 'On' : 'Off'}
              </Switch>
            )}
          </div>
        )}

        {/* Derived eligibility readout */}
        <div className={styles['access__block']}>
          <div className={styles['access__block-head']}>
            <span className={styles['access__block-label']}>
              Usable in access policies
            </span>
          </div>
          <div
            className={`${styles['access__eligibility']} ${
              !eligibility.eligible
                ? styles['access__eligibility--no']
                : fresh
                  ? styles['access__eligibility--caveat']
                  : styles['access__eligibility--yes']
            }`}
          >
            <span className={styles['access__eligibility-state']}>
              {!eligibility.eligible
                ? 'No'
                : fresh
                  ? `Yes, but ${fresh.long}`
                  : textCaveat
                    ? 'Yes, but values are free text'
                    : 'Yes'}
            </span>
            <span className={styles['access__eligibility-reason']}>
              {eligibility.reason}
            </span>
          </div>
          {/* Finding 4: text-type caveat is shown even when the source is fresh. */}
          {eligibility.eligible && textCaveat && (
            <p className={styles['access__eligibility-note']}>
              Policies match the exact string — {textCaveat.replace(
                'values are free text — ',
                '',
              )}
              . Casing or format drift will silently break a match.
            </p>
          )}
          {/* Finding 1: when stale/failed, spell out the access consequence. */}
          {eligibility.eligible && fresh && (
            <p className={styles['access__eligibility-note']}>
              Eligible by rule, but the source is {fresh.state.toLowerCase()} —
              access checks may be evaluating an out-of-date value.
            </p>
          )}
        </div>

        {/* Value visibility */}
        <div className={styles['access__block']}>
          <div className={styles['access__block-head']}>
            <span className={styles['access__block-label']}>
              Value visibility
            </span>
          </div>
          <div
            className={styles['access__visibility']}
            role="radiogroup"
            aria-label="Value visibility"
          >
            {(['Visible', 'Restricted'] as const).map((v) => {
              const active = attribute.valueVisibility === v;
              return (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`${styles['access__visibility-btn']} ${active ? styles['access__visibility-btn--active'] : ''}`}
                  onClick={() => onVisibilityChange(v)}
                >
                  <span className={styles['access__visibility-title']}>
                    {v}
                  </span>
                  <span className={styles['access__visibility-desc']}>
                    {v === 'Visible'
                      ? 'Anyone who can see the resource can see the value.'
                      : 'Only members who match the value can see it.'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
