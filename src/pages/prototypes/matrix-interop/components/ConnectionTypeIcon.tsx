import MattermostIcon from '@mattermost/compass-icons/components/mattermost';
import type { ChannelWorkspaceConnectionType } from '../matrixInteropTypes';
import styles from './ConnectionTypeIcon.module.scss';

type ConnectionTypeIconProps = {
  type: ChannelWorkspaceConnectionType;
  /** Accessible name; defaults to the connection type. */
  label?: string;
};

/** Compact platform mark for Mattermost vs Matrix workspace rows. */
export default function ConnectionTypeIcon({
  type,
  label,
}: ConnectionTypeIconProps) {
  const ariaLabel = label ?? (type === 'mattermost' ? 'Mattermost' : 'Matrix');

  if (type === 'mattermost') {
    return (
      <span
        className={`${styles['connection-type-icon']} ${styles['connection-type-icon--mattermost']}`}
        role="img"
        aria-label={ariaLabel}
      >
        <MattermostIcon size={14} color="currentColor" />
      </span>
    );
  }

  return (
    <span
      className={`${styles['connection-type-icon']} ${styles['connection-type-icon--matrix']}`}
      role="img"
      aria-label={ariaLabel}
    >
      <span className={styles['connection-type-icon__matrix-mark']} aria-hidden>
        [m]
      </span>
    </span>
  );
}
