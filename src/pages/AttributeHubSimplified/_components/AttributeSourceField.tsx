import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
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
  onConnect: () => void;
  onManage: () => void;
}

export default function AttributeSourceField({
  attribute,
  onConnect,
  onManage,
}: AttributeSourceFieldProps) {
  const synced = isSourceOwned(attribute);
  const { source } = attribute;
  const lastSynced = lastSyncedLabel(source);

  if (synced && source.kind === 'synced') {
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

  return (
    <div className={styles['source']}>
      <p className={styles['source__lead']}>
        Values are managed in Mattermost.
      </p>
      <Button
        emphasis="Secondary"
        size="Small"
        leadingIcon={<Icon size="16" glyph={<LinkVariantIcon />} />}
        onClick={onConnect}
      >
        Connect external source
      </Button>
    </div>
  );
}
