import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from './AgentArtifactCard.module.scss';

type AgentArtifactCardProps = {
  title: string;
  meta: string;
  onOpen: () => void;
};

/** In-thread card for an AI-generated artifact (report, analysis, etc.). */
export default function AgentArtifactCard({ title, meta, onOpen }: AgentArtifactCardProps) {
  return (
    <div className={styles['agent-artifact-card']}>
      <div className={styles['agent-artifact-card__body']}>
        <div className={styles['agent-artifact-card__identity']}>
          <span className={styles['agent-artifact-card__icon']} aria-hidden>
            <Icon glyph={<FileTextOutlineIcon />} size="24" />
          </span>
          <div className={styles['agent-artifact-card__copy']}>
            <p className={styles['agent-artifact-card__title']}>{title}</p>
            <p className={styles['agent-artifact-card__meta']}>{meta}</p>
          </div>
        </div>
        <Button emphasis="tertiary" size="small" onClick={onOpen}>
          View report
        </Button>
      </div>
    </div>
  );
}
