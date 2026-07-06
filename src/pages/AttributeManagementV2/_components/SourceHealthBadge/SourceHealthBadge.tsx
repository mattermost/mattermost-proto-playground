import type { ReactNode } from 'react';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import { type SourceState } from '../../data';
import styles from './SourceHealthBadge.module.scss';

export interface SourceHealthBadgeProps {
  state: SourceState;
}

/**
 * Non-color-only badge for source-health states.
 * Each state has a distinct icon shape; color is reinforcement, not signal.
 */
export default function SourceHealthBadge({ state }: SourceHealthBadgeProps) {
  let icon: ReactNode;
  let label: string;
  let tone: string;
  switch (state) {
    case 'Synced':
      icon = <CheckCircleOutlineIcon size={14} />;
      label = 'Synced';
      tone = 'success';
      break;
    case 'Stale':
      icon = <ClockOutlineIcon size={14} />;
      label = 'Stale';
      tone = 'warning';
      break;
    case 'Failed':
      icon = <AlertOutlineIcon size={14} />;
      label = 'Failed';
      tone = 'danger';
      break;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
  return (
    <span
      className={`${styles['badge']} ${styles[`badge--${tone}`]}`}
      aria-label={`Source ${label}`}
    >
      <span className={styles['badge__icon']} aria-hidden>
        {icon}
      </span>
      <span className={styles['badge__label']}>{label}</span>
    </span>
  );
}
