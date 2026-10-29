import ProductPlaybooksIcon from '@mattermost/compass-icons/components/product-playbooks';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Tag } from '@mattermost/compass-ui/components/tag';
import type { ChatPlaybookCard } from '../agentsData';
import styles from './AgentPlaybookCard.module.scss';

type AgentPlaybookCardProps = {
  card: ChatPlaybookCard;
  onOpen: () => void;
};

/** In-thread card for a playbook created from an attached checklist. */
export default function AgentPlaybookCard({
  card,
  onOpen,
}: AgentPlaybookCardProps) {
  const isActive = card.status === 'active';

  return (
    <div className={styles['agent-playbook-card']}>
      <div className={styles['agent-playbook-card__body']}>
        <div className={styles['agent-playbook-card__identity']}>
          <span className={styles['agent-playbook-card__icon']} aria-hidden>
            <Icon glyph={<ProductPlaybooksIcon />} size="24" />
          </span>
          <div className={styles['agent-playbook-card__copy']}>
            <div className={styles['agent-playbook-card__title-row']}>
              <p className={styles['agent-playbook-card__title']}>{card.title}</p>
              <Tag
                label={isActive ? 'Active' : 'Draft'}
                type={isActive ? 'success' : 'default'}
                size="x-small"
              />
            </div>
            <p className={styles['agent-playbook-card__description']}>
              {card.subtitle}
            </p>
            <p className={styles['agent-playbook-card__meta']}>
              {card.stageCount} stages · {card.taskCount} tasks
            </p>
          </div>
        </div>
        <Button emphasis="tertiary" size="small" onClick={onOpen}>
          {isActive ? 'Open in Playbooks' : 'Open preview'}
        </Button>
      </div>
    </div>
  );
}
