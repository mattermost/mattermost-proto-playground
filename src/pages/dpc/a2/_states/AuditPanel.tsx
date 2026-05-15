/**
 * A2 — System-admin audit visibility panel (§3.2.7).
 *
 * Extends the A1 baseline event set with three A2-specific wizard-lifecycle
 * events:
 *   - Discoverable_wizard_started
 *   - Discoverable_wizard_completed (with scope_choice)
 *   - Discoverable_wizard_abandoned (with last_step)
 *
 * Wizard-lifecycle events are visually tagged so the system admin can
 * triage them apart from runtime request events.
 */
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import type { LabelTagType } from '@/components/ui/LabelTag/LabelTag';
import type { A2StoreApi } from '@/pages/dpc/a2/useA2Store';
import type { AuditEvent } from '@/pages/dpc/shared';
import styles from './AuditPanel.module.scss';

export interface AuditPanelProps {
  store: A2StoreApi;
}

function outcomeTone(outcome: AuditEvent['outcome']): LabelTagType {
  if (outcome === 'denied') return 'Warning';
  if (outcome === 'error') return 'Danger';
  return 'Success';
}

function isWizardLifecycle(action: string): boolean {
  return action.startsWith('Discoverable_wizard_');
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return ts;
  return (
    date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC')
  );
}

function renderMeta(
  meta: Record<string, unknown> | undefined,
): string | null {
  if (!meta || Object.keys(meta).length === 0) return null;
  return Object.entries(meta)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(' · ');
}

export default function AuditPanel({ store }: AuditPanelProps) {
  return (
    <section className={styles['audit-panel']}>
      <header className={styles['audit-panel__header']}>
        <h3 className={styles['audit-panel__title']}>Audit events</h3>
        <p className={styles['audit-panel__caption']}>
          System-admin visibility · NIST 800-53 AU-3 schema (FR-13)
        </p>
      </header>

      <ul className={styles['audit-panel__list']}>
        {store.auditEvents.map((event, idx) => {
          const isWizard = isWizardLifecycle(event.action);
          const metaLine = renderMeta(event.meta);
          return (
            <li
              key={`${event.ts}-${idx}`}
              className={[
                styles['audit-panel__row'],
                isWizard ? styles['audit-panel__row--wizard'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles['audit-panel__row-head']}>
                <span className={styles['audit-panel__action']}>
                  {event.action}
                </span>
                {isWizard && (
                  <LabelTag
                    label="A2 wizard lifecycle"
                    type="Info Dim"
                    size="X-Small"
                  />
                )}
                <LabelTag
                  label={event.outcome}
                  type={outcomeTone(event.outcome)}
                  size="X-Small"
                  casing="All Caps"
                />
              </div>
              <div className={styles['audit-panel__row-meta']}>
                <span>{formatTimestamp(event.ts)}</span>
                <span>actor: {event.actor}</span>
                <span>resource: {event.resource}</span>
              </div>
              {metaLine && (
                <code className={styles['audit-panel__meta-line']}>
                  {metaLine}
                </code>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
