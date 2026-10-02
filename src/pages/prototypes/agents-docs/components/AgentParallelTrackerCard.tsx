import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from './AgentParallelTrackerCard.module.scss';

export type TrackerRow = {
  id: string;
  agentName: string;
  task: string;
  status: 'running' | 'done' | 'error';
};

type AgentParallelTrackerCardProps = {
  rows: TrackerRow[];
  allDone?: boolean;
};

export default function AgentParallelTrackerCard({ rows, allDone }: AgentParallelTrackerCardProps) {
  const doneCount = rows.filter((r) => r.status === 'done').length;

  return (
    <div className={styles['tracker-card']}>
      <div className={styles['tracker-card__header']}>
        {allDone ? (
          <span className={styles['tracker-card__summary']}>
            {doneCount} of {rows.length} passed
          </span>
        ) : (
          <span className={styles['tracker-card__header-label']}>Checking&hellip;</span>
        )}
      </div>
      <div className={styles['tracker-card__rows']}>
        {rows.map((row, i) => (
          <div key={row.id} className={styles['tracker-card__row']}>
            <div className={styles['tracker-card__row-status']}>
              {row.status === 'done' ? (
                <span className={styles['tracker-card__row-done']}>
                  <Icon glyph={<CheckCircleOutlineIcon />} size="16" />
                </span>
              ) : (
                <div
                  className={[
                    styles['tracker-card__row-pulse'],
                    i > 0 ? styles['tracker-card__row-pulse--offset'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )}
            </div>
            <div className={styles['tracker-card__row-body']}>
              <span className={styles['tracker-card__row-agent']}>{row.agentName}</span>
              <span className={styles['tracker-card__row-task']}>{row.task}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
