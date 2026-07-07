import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SyncPill from '@/pages/AttributeManagementHub/_components/SyncPill/SyncPill';
import {
  isSourceOwned,
  lastSyncedLabel,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import styles from './AttributeSourceField.module.scss';

export interface AttributeSourceFieldProps {
  attribute: HubAttribute;
  onManage: () => void;
}

/** Compact sync status shown below the values list when an external source is connected. */
export default function AttributeSourceField({
  attribute,
  onManage,
}: AttributeSourceFieldProps) {
  const synced = isSourceOwned(attribute);
  const { source } = attribute;

  if (!synced || source.kind !== 'synced') {
    return null;
  }

  const lastSynced = lastSyncedLabel(source);

  return (
    <div className={styles['source']}>
      <div className={styles['source__status']}>
        {source.state && (
          <SyncPill state={source.state} system={source.system} />
        )}
        {source.cadence && <Chip size="Small">{source.cadence}</Chip>}
        {source.pastBudget && (
          <LabelTag label="Sync overdue" type="Danger" size="X-Small" />
        )}
        {lastSynced && (
          <span className={styles['source__synced']}>{lastSynced}</span>
        )}
      </div>

      {source.pastBudget && (
        <p className={styles['source__warning']}>
          Sync is past its freshness budget — downstream editing is blocked until
          the source recovers.
        </p>
      )}

      {source.fieldMap && (
        <p className={styles['source__meta']}>{source.fieldMap}</p>
      )}

      <div className={styles['source__actions']}>
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<CogOutlineIcon />} />}
          onClick={onManage}
        >
          Manage connection
        </Button>
      </div>
    </div>
  );
}
