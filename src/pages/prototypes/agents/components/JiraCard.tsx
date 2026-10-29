import type { ChannelJiraCard } from '../agentsData';
import styles from './JiraCard.module.scss';

type JiraCardProps = {
  card: ChannelJiraCard;
};

export default function JiraCard({ card }: JiraCardProps) {
  return (
    <div className={styles['jira-card']}>
      <div className={styles['jira-card__body']}>
        <div className={styles['jira-card__header']}>
          <span className={styles['jira-card__logo']} aria-hidden>J</span>
          <span className={styles['jira-card__key']}>{card.issueKey}</span>
          <span className={[
            styles['jira-card__status'],
            card.status === 'Resolved' ? styles['jira-card__status--resolved'] : '',
            card.status === 'In Progress' ? styles['jira-card__status--in-progress'] : '',
          ].filter(Boolean).join(' ')}>
            {card.status}
          </span>
        </div>
        <p className={styles['jira-card__summary']}>{card.summary}</p>
      </div>
    </div>
  );
}
