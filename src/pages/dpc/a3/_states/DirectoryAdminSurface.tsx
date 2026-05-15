/**
 * DirectoryAdminSurface — the channel-admin's view onto the Channel
 * Directory's published entries plus the "Pending across my channels"
 * aggregate (§3.3.5).
 *
 * Renders one row per directory entry the active admin owns, exposing
 * inline Remove and a click-through into the per-channel right-rail Pending
 * queue (PendingRequestsRail in the parent layout).
 *
 * Aggregate "Pending across my channels (N)" sits at the top — explicitly
 * an additive convenience. Per §3.3.5 the per-channel right-rail queue
 * remains the authoritative surface for FR-9 and the audit-event source.
 */
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import MinusCircleOutlineIcon from '@mattermost/compass-icons/components/minus-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import { PERSONAS, useViewport } from '@/pages/dpc/shared';
import type { A3Store } from '../useA3Store';
import styles from './DirectoryAdminSurface.module.scss';

interface DirectoryAdminSurfaceProps {
  store: A3Store;
}

export default function DirectoryAdminSurface({
  store,
}: DirectoryAdminSurfaceProps) {
  const { viewport } = useViewport();
  const adminUsername = PERSONAS['channel-admin'].username;
  const aggregate = store.pendingForAdmin(adminUsername);

  if (viewport === 'mobile') {
    return (
      <section
        className={styles['dpc-adminsurf']}
        aria-label="Directory Admin"
      >
        <header className={styles['dpc-adminsurf__header']}>
          <h3 className={styles['dpc-adminsurf__title']}>Directory Admin</h3>
        </header>
        <div className={styles['dpc-adminsurf__mobile-notice']}>
          <Icon size="16" glyph={<AlertOutlineIcon />} />
          <span>
            Admin flows are <strong>web-only at launch (KD-8)</strong>. Use
            the desktop client to publish or remove channels from the
            Channel Directory.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles['dpc-adminsurf']} aria-label="Directory Admin">
      <header className={styles['dpc-adminsurf__header']}>
        <h3 className={styles['dpc-adminsurf__title']}>Directory Admin</h3>
        <p className={styles['dpc-adminsurf__subtitle']}>
          A3 · per §3.3.5. The per-channel Pending right-rail queue remains
          the authoritative surface; this aggregate is a convenience.
        </p>
      </header>

      <div className={styles['dpc-adminsurf__aggregate']}>
        <Icon size="16" glyph={<AlertOutlineIcon />} />
        <span>
          Pending across my channels:{' '}
          <strong>{aggregate.length}</strong>
        </span>
      </div>

      <ul className={styles['dpc-adminsurf__list']}>
        {store.state.directoryEntries.length === 0 && (
          <li className={styles['dpc-adminsurf__empty']}>
            No directory entries yet. Add one from the channel header above.
          </li>
        )}
        {store.state.directoryEntries.map((entry) => {
          const channel = store.channelById(entry.channelId);
          if (!channel) return null;
          const pendingCount = store.pendingForChannel(entry.channelId).length;
          return (
            <li
              key={entry.channelId}
              className={styles['dpc-adminsurf__row']}
            >
              <span className={styles['dpc-adminsurf__row-icon']}>
                <Icon size="16" glyph={<LockOutlineIcon />} />
              </span>
              <div className={styles['dpc-adminsurf__row-body']}>
                <span className={styles['dpc-adminsurf__row-name']}>
                  {channel.displayName}
                </span>
                <span className={styles['dpc-adminsurf__row-meta']}>
                  Added {new Date(entry.addedAt).toLocaleDateString()} by{' '}
                  @{entry.addedBy}
                </span>
                <span className={styles['dpc-adminsurf__row-pending']}>
                  {pendingCount > 0 ? (
                    <strong>{pendingCount} pending</strong>
                  ) : (
                    <span className={styles['dpc-adminsurf__row-quiet']}>
                      No pending requests
                    </span>
                  )}
                </span>
              </div>
              <div className={styles['dpc-adminsurf__row-actions']}>
                <IconButton
                  aria-label={`Remove ${channel.displayName} from directory`}
                  destructive
                  size="Small"
                  icon={
                    <Icon size="16" glyph={<MinusCircleOutlineIcon />} />
                  }
                  onClick={() =>
                    store.dispatch({
                      type: 'OPEN_REMOVE_DIALOG',
                      channelId: entry.channelId,
                    })
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>

      {aggregate.length > 0 && (
        <div className={styles['dpc-adminsurf__cta']}>
          <Button emphasis="Tertiary" size="Small">
            Review {aggregate.length} pending request
            {aggregate.length === 1 ? '' : 's'} in the right rail →
          </Button>
        </div>
      )}
    </section>
  );
}
