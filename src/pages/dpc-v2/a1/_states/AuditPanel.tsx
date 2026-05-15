/**
 * DPC V2 A1 — AuditPanel (Wave 1 stub).
 *
 * Carry-forward from V1. Wave 2 may extend the FR-13 event vocabulary to
 * include V2-only events (scheme change, decline-with-reason, permalink
 * silent-unfurl).
 */
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './AuditPanel.module.scss';

export interface AuditPanelProps {
  store: A1V2StoreApi;
}

export default function AuditPanel({ store }: AuditPanelProps) {
  return (
    <section className={styles['v2-audit-panel']}>
      <header className={styles['v2-audit-panel__header']}>
        Audit ledger (V2)
      </header>
      <div className={styles['v2-audit-panel__placeholder']}>
        Wave 2: carry-forward + V2 events. {store.state.auditEvents.length}{' '}
        entries seeded.
      </div>
    </section>
  );
}
