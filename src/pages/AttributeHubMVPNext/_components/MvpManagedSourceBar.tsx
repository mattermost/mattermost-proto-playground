import SyncIcon from '@mattermost/compass-icons/components/sync';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import Icon from '@/components/ui/Icon/Icon';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import {
  isCoreSyncSource,
  pluginStatus,
  manageConnectionHref,
  managedSourceActionLabel,
  managedSourceBarLabel,
  managedSourceDisconnectedHint,
  managedSourceReadOnlyHint,
} from './mvpTerms';
import MvpPluginStatusPill from './MvpPluginStatusPill';
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
  const coreSync = isCoreSyncSource(attribute);
  const plugin = pluginStatus(attribute);

  const handleManageConnection = () => {
    if (onManageConnection) {
      onManageConnection();
      return;
    }
    window.open(
      manageConnectionHref(attribute.source.system),
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
          <Icon
            size="16"
            glyph={coreSync ? <SyncIcon /> : <PowerPlugOutlineIcon />}
          />
          {managedSourceBarLabel(attribute)}
        </span>
        <MvpPluginStatusPill status={plugin} />
        <button
          type="button"
          className={styles['bar__link']}
          onClick={handleManageConnection}
        >
          {managedSourceActionLabel(attribute)}
          <Icon size="16" glyph={<OpenInNewIcon />} />
        </button>
      </div>
      {plugin === 'disconnected' && (
        <p className={styles['bar__hint']}>
          {managedSourceDisconnectedHint(attribute)}
        </p>
      )}
      <p className={styles['bar__hint']}>{managedSourceReadOnlyHint(attribute)}</p>
    </div>
  );
}
