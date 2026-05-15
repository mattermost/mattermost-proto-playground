/**
 * AuditPanel — system-admin audit visibility surface (§3.3.7).
 *
 * Renders FR-13 audit events emitted by the prototype's state machine,
 * including the three new A3 event types:
 *   - Directory_entry_added
 *   - Directory_entry_removed
 *   - Directory_entry_orphaned
 *
 * Plus the standard Request_* and ABAC_* events which continue to
 * reference channel_id (never directory_entry_id) so the join lifecycle is
 * reconstructable from channel-scoped events alone (§3.3.7).
 *
 * Note: the prototype emits to local state — a real audit pipeline
 * integration is Phase 7 spec scope.
 */
import { useMemo, useState } from 'react';
import Chip from '@/components/ui/Chip/Chip';
import Tags from '@/components/ui/Tags/Tags';
import type { AuditEvent } from '@/pages/dpc/shared';
import type { A3Store } from '../useA3Store';
import styles from './AuditPanel.module.scss';

interface AuditPanelProps {
  store: A3Store;
}

const A3_EVENT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'directory', label: 'Directory_*' },
  { key: 'request', label: 'Request_*' },
  { key: 'abac', label: 'ABAC_*' },
] as const;

type FilterKey = (typeof A3_EVENT_FILTERS)[number]['key'];

function classifyEvent(event: AuditEvent): FilterKey {
  if (event.action.startsWith('Directory_')) return 'directory';
  if (event.action.startsWith('Request_')) return 'request';
  if (event.action.startsWith('ABAC_') || event.action === 'abac.auto_join') {
    return 'abac';
  }
  return 'all';
}

function eventTone(event: AuditEvent): 'success' | 'warning' | 'danger' | 'info' {
  if (event.outcome === 'denied') return 'danger';
  if (event.outcome === 'error') return 'danger';
  if (event.action === 'Directory_entry_orphaned') return 'warning';
  if (event.action.startsWith('Directory_')) return 'info';
  return 'success';
}

export default function AuditPanel({ store }: AuditPanelProps) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return store.state.auditEvents;
    return store.state.auditEvents.filter(
      (e) => classifyEvent(e) === filter,
    );
  }, [store.state.auditEvents, filter]);

  return (
    <section className={styles['dpc-audit']} aria-label="Audit panel">
      <header className={styles['dpc-audit__header']}>
        <h3 className={styles['dpc-audit__title']}>Audit Stream</h3>
        <p className={styles['dpc-audit__subtitle']}>
          FR-13 + §3.3.7 · system-admin visibility · {filtered.length} events
        </p>
      </header>

      <div className={styles['dpc-audit__filters']} role="tablist">
        {A3_EVENT_FILTERS.map((f) => (
          <Chip
            key={f.key}
            as="button"
            size="Small"
            tone={filter === f.key ? 'info' : 'neutral'}
            colored={filter === f.key}
            onClick={() => setFilter(f.key)}
            role="tab"
            aria-pressed={filter === f.key}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      <ul className={styles['dpc-audit__list']}>
        {filtered.length === 0 && (
          <li className={styles['dpc-audit__empty']}>
            No events match this filter yet.
          </li>
        )}
        {filtered.slice(0, 24).map((e, idx) => (
          <li
            key={`${e.ts}-${e.action}-${idx}`}
            className={styles['dpc-audit__row']}
          >
            <div className={styles['dpc-audit__row-header']}>
              <Tags
                size="X-Small"
                type={
                  eventTone(e) === 'success'
                    ? 'Success'
                    : eventTone(e) === 'danger'
                      ? 'Danger'
                      : eventTone(e) === 'warning'
                        ? 'Warning'
                        : 'Info'
                }
              >
                {e.action}
              </Tags>
              <span className={styles['dpc-audit__row-ts']}>
                {new Date(e.ts).toLocaleTimeString()}
              </span>
            </div>
            <div className={styles['dpc-audit__row-body']}>
              <span>
                <strong>actor</strong> @{e.actor}
              </span>
              <span>
                <strong>resource</strong> {e.resource}
              </span>
              <span>
                <strong>outcome</strong> {e.outcome}
              </span>
            </div>
            {e.meta != null && Object.keys(e.meta).length > 0 && (
              <pre className={styles['dpc-audit__row-meta']}>
                {JSON.stringify(e.meta, null, 2)}
              </pre>
            )}
          </li>
        ))}
      </ul>

      <footer className={styles['dpc-audit__footer']}>
        NIST 800-53 AU-3 schema · NFR-4 durable persistence · DoD ZT Pillar
        6 capability activities 6.1–6.3.
      </footer>
    </section>
  );
}
