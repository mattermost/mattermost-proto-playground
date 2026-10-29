import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import type React from 'react';
import styles from './AgentArtifactCard.module.scss';

type AgentArtifactCardProps = {
  title: string;
  meta: string;
  compact?: boolean;
  /** Custom icon node. When omitted, defaults to FileTextOutlineIcon. */
  icon?: React.ReactNode;
  onOpen?: () => void;
};

/** In-thread card for an AI-generated artifact (report, analysis, etc.). Clicking anywhere opens it. */
export default function AgentArtifactCard({ title, meta, compact, icon, onOpen }: AgentArtifactCardProps) {
  const defaultIcon = <FileTextOutlineIcon />;

  if (compact) {
    return (
      <button
        type="button"
        className={[
          styles['agent-artifact-card'],
          styles['agent-artifact-card--compact'],
        ].join(' ')}
        onClick={onOpen}
        disabled={!onOpen}
      >
        <span className={styles['agent-artifact-card__icon-compact']} aria-hidden>
          <Icon glyph={icon ?? defaultIcon} size="16" />
        </span>
        <div className={styles['agent-artifact-card__copy']}>
          <p className={styles['agent-artifact-card__title']}>{title}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles['agent-artifact-card']}
      onClick={onOpen}
      disabled={!onOpen}
    >
      <div className={styles['agent-artifact-card__body']}>
        <div className={styles['agent-artifact-card__identity']}>
          <span className={styles['agent-artifact-card__icon']} aria-hidden>
            <Icon glyph={icon ?? defaultIcon} size="24" />
          </span>
          <div className={styles['agent-artifact-card__copy']}>
            <p className={styles['agent-artifact-card__title']}>{title}</p>
            <p className={styles['agent-artifact-card__meta']}>{meta}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
