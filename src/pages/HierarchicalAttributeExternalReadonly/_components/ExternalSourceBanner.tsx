import SyncIcon from '@mattermost/compass-icons/components/sync';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import Icon from '@/components/ui/Icon/Icon';
import { EXTERNAL_SOURCE } from '../externalModel';
import styles from './ExternalSourceBanner.module.scss';

export interface ExternalSourceBannerProps {
  /** Connection health of the external sync. */
  status?: 'connected' | 'syncing' | 'broken';
}

/**
 * Persistent notice that this attribute's values are owned by an external
 * source (a UAS) and are read-only in Mattermost. Reuses the managed-source
 * banner pattern from `AttributeHubMVP/MvpManagedSourceBar` (semibold label with
 * a sync glyph, a connection pill, a "read-only here" hint) — rebuilt locally so
 * it carries the viewer-facing copy and does not depend on the MVP fixtures.
 */
export default function ExternalSourceBanner({
  status = 'connected',
}: ExternalSourceBannerProps) {
  const pillLabel =
    status === 'broken'
      ? 'Connection needs attention'
      : status === 'syncing'
        ? 'Syncing…'
        : 'Connected';

  return (
    <div className={styles['bar']} role="note">
      <div className={styles['bar__row']}>
        <span className={styles['bar__label']}>
          <Icon size="16" glyph={<SyncIcon />} />
          Managed by {EXTERNAL_SOURCE}
        </span>
        <span
          className={[
            styles['bar__pill'],
            styles[`bar__pill--${status}`],
          ].join(' ')}
        >
          {pillLabel}
        </span>
        <span className={styles['bar__readonly']}>
          <Icon size="12" glyph={<LockOutlineIcon />} />
          Read-only here
        </span>
        <a
          className={styles['bar__link']}
          href="#source"
          onClick={(e) => e.preventDefault()}
        >
          View sync details
          <Icon size="16" glyph={<OpenInNewIcon />} />
        </a>
      </div>
      <p className={styles['bar__hint']}>
        Values are defined and updated in {EXTERNAL_SOURCE} and synced into
        Mattermost. You can browse and filter the hierarchy here, but values
        can’t be added, renamed, moved, or removed on this screen. Values you
        don’t have access to are not shown.
      </p>
    </div>
  );
}
