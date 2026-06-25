import { StatusBadge } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function StatusBadgeLibrary() {
  return (
    <>
      <p
        className={styles['components__subheading']}
        style={{ marginBottom: 'var(--spacing-m)' }}
      >
        Figma Status Badge v2.0.1 — standalone; also used on UserAvatar when
        status is on.
      </p>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Status</span>
          <StatusBadge status="Online" />
          <StatusBadge status="Away" />
          <StatusBadge status="Do Not Disturb" />
          <StatusBadge status="Offline" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <StatusBadge size="XX-Small" status="Online" />
          <StatusBadge size="X-Small" status="Online" />
          <StatusBadge size="Small" status="Online" />
          <StatusBadge size="Medium" status="Online" />
          <StatusBadge size="Large" status="Online" />
        </div>
      </div>
    </>
  );
}
