/**
 * DPC V2 A1 — AuditPanel (full implementation, v2.3).
 *
 * Renders every audit event in `state.auditEvents` (newest first). Internal
 * review/debug surface, not a product UI — reviewers use it to verify that
 * each user action emits the right FR-13 event with the right payload.
 *
 * Columns: timestamp · actor · action · resource · outcome · meta.
 */
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './AuditPanel.module.scss';

export interface AuditPanelProps {
  store: A1V2StoreApi;
}

export default function AuditPanel({ store }: AuditPanelProps) {
  const events = [...store.state.auditEvents].reverse();

  return (
    <section className={styles['v2-audit-panel']}>
      <header className={styles['v2-audit-panel__header']}>
        Audit ledger
        <span className={styles['v2-audit-panel__count']}>
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
      </header>
      <div className={styles['v2-audit-panel__table-wrap']}>
        <Scrollbars>
          <table className={styles['v2-audit-panel__table']}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Outcome</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr className={styles['v2-audit-panel__empty']}>
                  <td colSpan={6}>No events yet.</td>
                </tr>
              ) : (
                events.map((e, idx) => {
                  const outcome = e.outcome ?? 'allow';
                  const metaStr =
                    e.meta && Object.keys(e.meta).length > 0
                      ? JSON.stringify(e.meta)
                      : '';
                  return (
                    <tr key={`${e.ts}-${idx}`}>
                      <td className={styles['v2-audit-panel__cell-mono']}>
                        {formatTs(e.ts)}
                      </td>
                      <td className={styles['v2-audit-panel__cell-mono']}>
                        {e.actor}
                      </td>
                      <td className={styles['v2-audit-panel__cell-mono']}>
                        {e.action}
                      </td>
                      <td className={styles['v2-audit-panel__cell-mono']}>
                        {e.resource}
                      </td>
                      <td>
                        <span
                          className={[
                            styles['v2-audit-panel__chip'],
                            outcome === 'denied'
                              ? styles['v2-audit-panel__chip--denied']
                              : styles['v2-audit-panel__chip--allow'],
                          ].join(' ')}
                        >
                          {outcome}
                        </span>
                      </td>
                      <td
                        className={styles['v2-audit-panel__cell-meta']}
                        title={metaStr}
                      >
                        {metaStr}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Scrollbars>
      </div>
    </section>
  );
}

function formatTs(iso: string): string {
  // Show HH:MM:SS for compactness — reviewer doesn't need full ISO date in the
  // canvas, just relative ordering. Falls back to raw value on parse failure.
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString().slice(11, 19);
  } catch {
    return iso;
  }
}
