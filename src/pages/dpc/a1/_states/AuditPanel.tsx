/**
 * DPC A1 — Audit-event panel (US-7, §3.1.7).
 *
 * Renders the last 10 FR-13 events the prototype has emitted, with full
 * NIST 800-53 AU-3 content (timestamp, actor, action, resource, outcome,
 * meta). The `acknowledgment_metadata` claim block — Phase 4 §7.3 mitigation
 * — and the `prior_membership` flag (§3.1.6) are surfaced verbatim so
 * reviewers can validate audit-event coverage during the flow.
 *
 * This is the system-admin landing surface in the prototype.
 */
import FileCodeOutlineIcon from '@mattermost/compass-icons/components/file-code-outline';
import Icon from '@/components/ui/Icon/Icon';
import type { A1StoreApi } from '../useA1Store';
import type { AuditEvent } from '@/pages/dpc/shared';
import styles from './AuditPanel.module.scss';

export interface AuditPanelProps {
  store: A1StoreApi;
}

const OUTCOME_LABEL: Record<AuditEvent['outcome'], string> = {
  success: 'success',
  denied: 'denied',
  error: 'error',
};

export default function AuditPanel({ store }: AuditPanelProps) {
  const { state } = store;
  const events = [...state.auditEvents].slice(-10).reverse();

  return (
    <section className={styles['audit-panel']} aria-label="Audit events">
      <header className={styles['audit-panel__header']}>
        <Icon size="20" glyph={<FileCodeOutlineIcon />} />
        <div>
          <h3 className={styles['audit-panel__title']}>FR-13 audit ledger</h3>
          <p className={styles['audit-panel__subtitle']}>
            Last {events.length} events · NIST 800-53 AU-3 shape · sysadmin view
          </p>
        </div>
      </header>

      <ul className={styles['audit-panel__list']}>
        {events.map((evt, idx) => (
          <li
            key={`${evt.ts}-${evt.action}-${idx}`}
            className={[
              styles['audit-panel__row'],
              evt.outcome === 'denied'
                ? styles['audit-panel__row--denied']
                : '',
              evt.outcome === 'error' ? styles['audit-panel__row--error'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles['audit-panel__row-head']}>
              <code className={styles['audit-panel__row-action']}>
                {evt.action}
              </code>
              <span
                className={[
                  styles['audit-panel__row-outcome'],
                  styles[
                    `audit-panel__row-outcome--${OUTCOME_LABEL[evt.outcome]}`
                  ],
                ].join(' ')}
              >
                {OUTCOME_LABEL[evt.outcome]}
              </span>
            </div>
            <div className={styles['audit-panel__row-meta']}>
              <span className={styles['audit-panel__row-ts']}>
                {new Date(evt.ts).toLocaleString()}
              </span>
              <span className={styles['audit-panel__row-sep']}>·</span>
              <span>
                actor=<code>{evt.actor}</code>
              </span>
              <span className={styles['audit-panel__row-sep']}>·</span>
              <span>
                resource=<code>{evt.resource}</code>
              </span>
            </div>
            {evt.meta && Object.keys(evt.meta).length > 0 && (
              <pre className={styles['audit-panel__row-payload']}>
                {JSON.stringify(evt.meta, null, 2)}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
