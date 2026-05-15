/**
 * A4 audit-events panel per §3.4.7.
 *
 * Renders the A4-specific event set:
 *   Allow_knocks_enabled / disabled
 *   Allow_knocks_<source>_enabled / disabled
 *   Recommendation_permission_changed
 *   Knock_submitted (with reference_source + reference_metadata)
 *   Knock_accepted / Knock_declined (with subject_id + decline_reason)
 *   Knock_withdrawn (with withdrawal_trigger)
 *   Recommendation_sent / Recommendation_rate_limited
 *   Guest_knock_blocked
 *   Permalink_reference_invalidated
 *   Mention_dismissed
 *   Channel_left
 *
 * Shape conforms to AU-3 (timestamp, actor, action, resource, outcome) per
 * NFR-4. Reference_source field is highlighted because it's the A4-specific
 * forensic anchor (per §3.4.13 prototype-scope notes).
 */
import { useState } from 'react';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Button from '@/components/ui/Button/Button';
import type { AuditEvent } from '@/pages/dpc/shared';
import styles from './AuditPanel.module.scss';

const A4_ACTIONS = new Set([
  'Allow_knocks_enabled',
  'Allow_knocks_disabled',
  'Allow_knocks_permalink_enabled',
  'Allow_knocks_permalink_disabled',
  'Allow_knocks_mention_enabled',
  'Allow_knocks_mention_disabled',
  'Allow_knocks_recommendation_enabled',
  'Allow_knocks_recommendation_disabled',
  'Allow_knocks_prior-membership_enabled',
  'Allow_knocks_prior-membership_disabled',
  'Recommendation_permission_changed',
  'Knock_submitted',
  'Knock_accepted',
  'Knock_declined',
  'Knock_withdrawn',
  'Recommendation_sent',
  'Recommendation_rate_limited',
  'Guest_knock_blocked',
  'Permalink_reference_invalidated',
  'Mention_dismissed',
  'Channel_left',
]);

export interface AuditPanelProps {
  events: AuditEvent[];
  /** Optional fabrication-trigger handler — sys-admin V-A4-1 demo. */
  onSimulateFabrication?: () => void;
}

export default function AuditPanel({
  events,
  onSimulateFabrication,
}: AuditPanelProps) {
  const [filter, setFilter] = useState<'all' | 'a4' | 'security'>('a4');

  const filtered = events.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'a4') return A4_ACTIONS.has(e.action);
    if (filter === 'security') {
      const meta = e.meta as Record<string, unknown> | undefined;
      return Boolean(meta?.v_vector);
    }
    return true;
  });

  return (
    <section className={styles['audit-panel']}>
      <header className={styles['audit-panel__header']}>
        <div>
          <h3 className={styles['audit-panel__title']}>Audit events</h3>
          <p className={styles['audit-panel__subtitle']}>
            AU-3 schema · Knock_submitted carries reference_source per §3.4.7
          </p>
        </div>

        <div className={styles['audit-panel__filters']}>
          <button
            type="button"
            className={[
              styles['audit-panel__filter'],
              filter === 'a4' ? styles['audit-panel__filter--active'] : '',
            ].join(' ')}
            onClick={() => setFilter('a4')}
          >
            A4 only
          </button>
          <button
            type="button"
            className={[
              styles['audit-panel__filter'],
              filter === 'security'
                ? styles['audit-panel__filter--active']
                : '',
            ].join(' ')}
            onClick={() => setFilter('security')}
          >
            Security vectors
          </button>
          <button
            type="button"
            className={[
              styles['audit-panel__filter'],
              filter === 'all' ? styles['audit-panel__filter--active'] : '',
            ].join(' ')}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
      </header>

      {onSimulateFabrication && (
        <div className={styles['audit-panel__demo']}>
          <Button
            emphasis="Secondary"
            size="Small"
            onClick={onSimulateFabrication}
          >
            Simulate reference fabrication (V-A4-1)
          </Button>
          <span className={styles['audit-panel__demo-help']}>
            Emits a Knock_submitted denied event with normalized response.
          </span>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className={styles['audit-panel__empty']}>
          No events match this filter.
        </p>
      ) : (
        <ol className={styles['audit-panel__list']}>
          {filtered.map((e, idx) => {
            const meta = e.meta as Record<string, unknown> | undefined;
            const refSource = meta?.reference_source as string | undefined;
            const vVector = meta?.v_vector as string | undefined;
            return (
              <li
                key={`${e.ts}-${idx}`}
                className={styles['audit-panel__row']}
              >
                <div className={styles['audit-panel__row-head']}>
                  <span className={styles['audit-panel__ts']}>{e.ts}</span>
                  <span className={styles['audit-panel__action']}>
                    {e.action}
                  </span>
                  <LabelTag
                    label={e.outcome}
                    type={
                      e.outcome === 'success'
                        ? 'Success'
                        : e.outcome === 'denied'
                          ? 'Danger'
                          : 'Warning'
                    }
                    size="X-Small"
                    casing="Title Case"
                  />
                </div>
                <div className={styles['audit-panel__row-meta']}>
                  <span>
                    <span className={styles['audit-panel__meta-label']}>
                      Actor
                    </span>{' '}
                    {e.actor}
                  </span>
                  <span>
                    <span className={styles['audit-panel__meta-label']}>
                      Resource
                    </span>{' '}
                    {e.resource}
                  </span>
                  {refSource && (
                    <span>
                      <span className={styles['audit-panel__meta-label']}>
                        Reference source
                      </span>{' '}
                      <code className={styles['audit-panel__code']}>
                        {refSource}
                      </code>
                    </span>
                  )}
                  {vVector && (
                    <LabelTag
                      label={vVector}
                      type="Warning"
                      size="X-Small"
                      casing="All Caps"
                    />
                  )}
                </div>
                {meta && Object.keys(meta).length > 0 && (
                  <details className={styles['audit-panel__details']}>
                    <summary>Raw meta</summary>
                    <pre className={styles['audit-panel__pre']}>
                      {JSON.stringify(meta, null, 2)}
                    </pre>
                  </details>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
