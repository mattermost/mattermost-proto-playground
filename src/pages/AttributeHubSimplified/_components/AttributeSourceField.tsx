import Chip from '@/components/ui/Chip/Chip';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SyncPill from '@/pages/AttributeManagementHub/_components/SyncPill/SyncPill';
import {
  isSourceOwned,
  lastSyncedLabel,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import styles from './AttributeSourceField.module.scss';

/** Compact sync status shown above the values list when externally sourced. */
export function AttributeSourceStatus({ attribute }: { attribute: HubAttribute }) {
  const synced = isSourceOwned(attribute);
  const { source } = attribute;

  if (!synced || source.kind !== 'synced') {
    return null;
  }

  const lastSynced = lastSyncedLabel(source);

  return (
    <div className={styles['source__status']}>
      {source.state && <SyncPill state={source.state} system={source.system} />}
      {source.cadence && <Chip size="Small">{source.cadence}</Chip>}
      {source.pastBudget && (
        <LabelTag label="Sync overdue" type="Danger" size="X-Small" />
      )}
      {lastSynced && (
        <span className={styles['source__synced']}>{lastSynced}</span>
      )}
    </div>
  );
}
