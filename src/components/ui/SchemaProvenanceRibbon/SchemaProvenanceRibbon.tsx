import type { ReactNode } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import Icon from '@/components/ui/Icon/Icon';
import styles from './SchemaProvenanceRibbon.module.scss';

export type SyncState = 'fresh' | 'stale' | 'failed' | 'never-synced';

export interface SchemaProvenanceRibbonProps {
  /** External UAS plugin name (e.g., "Jade UAS Connector"). Never reference customer names. */
  source: string;
  /** Relative timestamp for the last successful sync (e.g., "5m ago"). */
  lastSyncRelative: string;
  /** ISO timestamp for absolute display in tooltip. */
  lastSyncAbsolute: string;
  /** Last-known-good relative timestamp (may differ from lastSync when stale). */
  lastKnownGoodRelative?: string;
  /** ISO timestamp for last-known-good absolute display in tooltip. */
  lastKnownGoodAbsolute?: string;
  /** Sync state. Per resolved PRD-VPM-1: no proactive warning UI; the state is shown but not flagged. */
  syncState?: SyncState;
  /** Compact rendering for inline table-row use. Default: false (full ribbon). */
  compact?: boolean;
  /** Optional trailing slot — e.g., a "View sync history" link. */
  trailing?: ReactNode;
}

/**
 * SchemaProvenanceRibbon — single shared component for UAS-sourced schema provenance.
 *
 * Resolves VP4-3 from the Phase 4 ideation matrix (cross-direction concern: lock + sync-status
 * ribbon must render identically across System Console row, modal header, and policy editor banner).
 * Reused identically in D1's inline row + popover + modal, and in D2's modal header.
 *
 * Per resolved PRD-VPM-1: no proactive stale banner; admin discovers staleness via fail-secure
 * denials, support tickets, and the audit log. This component renders the timestamps and
 * last-known-good only — it does not surface warning chrome even when stale.
 */
export default function SchemaProvenanceRibbon({
  source,
  lastSyncRelative,
  lastSyncAbsolute,
  lastKnownGoodRelative,
  lastKnownGoodAbsolute,
  syncState: _syncState = 'fresh',
  compact = false,
  trailing,
}: SchemaProvenanceRibbonProps) {
  return (
    <div
      className={[
        styles['ribbon'],
        compact && styles['ribbon--compact'],
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-label={`UAS-sourced schema mastered by ${source}. Last sync ${lastSyncRelative}.`}
    >
      <div className={styles['ribbon__lock']}>
        <Icon size="16" glyph={<LockOutlineIcon />} />
      </div>
      <div className={styles['ribbon__content']}>
        <span className={styles['ribbon__label']}>
          <span className={styles['ribbon__label-key']}>Mastered by:</span>{' '}
          <span className={styles['ribbon__label-value']}>{source}</span>
        </span>
        <span className={styles['ribbon__sep']} aria-hidden="true">
          ·
        </span>
        <span
          className={styles['ribbon__sync']}
          title={`Last sync: ${lastSyncAbsolute}`}
        >
          <Icon size="12" glyph={<SyncIcon />} />
          <span>Last sync {lastSyncRelative}</span>
        </span>
        {lastKnownGoodRelative && lastKnownGoodAbsolute && (
          <>
            <span className={styles['ribbon__sep']} aria-hidden="true">
              ·
            </span>
            <span
              className={styles['ribbon__lkg']}
              title={`Last-known-good: ${lastKnownGoodAbsolute}`}
            >
              Last-known-good {lastKnownGoodRelative}
            </span>
          </>
        )}
      </div>
      {trailing && <div className={styles['ribbon__trailing']}>{trailing}</div>}
    </div>
  );
}
