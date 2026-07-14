import SyncIcon from '@mattermost/compass-icons/components/sync';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import Icon from '@/components/ui/Icon/Icon';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import { connectionStatus, manageConnectionHref } from './mvpTerms';
import MvpConnectionPill from './MvpConnectionPill';
import styles from './MvpManagedSourceBar.module.scss';

export interface MvpManagedSourceBarProps {
  attribute: HubAttribute;
  /** Below option chips inside the Options field. */
  layout?: 'default' | 'in-options';
  /** When set, opens in-app manage flow instead of an external docs link. */
  onManageConnection?: () => void;
}

/** Inline source ownership + connection health for synced attributes. */
export default function MvpManagedSourceBar({
  attribute,
  layout = 'default',
  onManageConnection,
}: MvpManagedSourceBarProps) {
  const system = attribute.source.system;
  const status = connectionStatus(attribute);

  const handleManageConnection = () => {
    if (onManageConnection) {
      onManageConnection();
      return;
    }
    window.open(
      manageConnectionHref(system),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div
      className={[
        styles['bar'],
        layout === 'in-options' ? styles['bar--in-options'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['bar__row']}>
        <span className={styles['bar__label']}>
          <Icon size="16" glyph={<SyncIcon />} />
          Managed by {system}
        </span>
        <MvpConnectionPill status={status} />
        <button
          type="button"
          className={styles['bar__link']}
          onClick={handleManageConnection}
        >
          Manage connection
          <Icon size="16" glyph={<OpenInNewIcon />} />
        </button>
      </div>
      {status === 'broken' && (
        <p className={styles['bar__hint']}>
          The connection to {system} needs attention. Values may be out of date
          until it is restored.
        </p>
      )}
      <p className={styles['bar__hint']}>
        Name, type, and values are owned by the external source and are read-only
        here.
      </p>
    </div>
  );
}
