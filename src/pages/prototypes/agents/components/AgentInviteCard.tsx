import { Button } from '@mattermost/compass-ui/components/button';
import type { AgentColor, AgentShape, ChannelAgentInviteCard } from '../agentsData';
import AgentAvatar from './AgentAvatar';
import styles from './AgentReviewCard.module.scss';

type AgentInviteCardProps = {
  card: ChannelAgentInviteCard;
  shape: AgentShape;
  color: AgentColor;
  imageSrc?: string;
  onAdd: () => void;
  onDismiss: () => void;
};

/**
 * Channel attachment: Matty’s one-click invite for an existing workspace agent.
 */
export default function AgentInviteCard({
  card,
  shape,
  color,
  imageSrc,
  onAdd,
  onDismiss,
}: AgentInviteCardProps) {
  const accepted = Boolean(card.accepted);
  const dismissed = Boolean(card.dismissed);
  const resolved = accepted || dismissed;

  return (
    <div
      className={[
        styles['agent-review-card'],
        resolved ? styles['agent-review-card--approved'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['agent-review-card__body']}>
        <div className={styles['agent-review-card__identity']}>
          <AgentAvatar
            shape={shape}
            color={color}
            size="sm"
            eyes
            shadow={false}
            imageSrc={imageSrc}
          />
          <div className={styles['agent-review-card__copy']}>
            <p className={styles['agent-review-card__title']}>{card.name}</p>
            <p className={styles['agent-review-card__description']}>
              {card.description}
            </p>
          </div>
        </div>
        {accepted ? (
          <p className={styles['agent-review-card__status']}>Added</p>
        ) : dismissed ? (
          <p
            className={[
              styles['agent-review-card__status'],
              styles['agent-review-card__status--muted'],
            ].join(' ')}
          >
            Dismissed
          </p>
        ) : (
          <div className={styles['agent-review-card__actions']}>
            <Button emphasis="tertiary" size="small" onClick={onDismiss}>
              Not now
            </Button>
            <Button emphasis="primary" size="small" onClick={onAdd}>
              Add to channel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
