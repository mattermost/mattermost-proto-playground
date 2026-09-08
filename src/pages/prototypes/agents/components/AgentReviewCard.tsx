import { Button } from '@mattermost/compass-ui/components/button';
import type { AgentColor, AgentShape, ChannelAgentReviewCard } from '../agentsData';
import AgentAvatar from './AgentAvatar';
import styles from './AgentReviewCard.module.scss';

type AgentReviewCardProps = {
  card: ChannelAgentReviewCard;
  shape: AgentShape;
  color: AgentColor;
  imageSrc?: string;
  onReview: () => void;
};

/**
 * Channel attachment: review a draft agent (Sentinel) before approving into
 * the channel. Opens Agent Settings on click / CTA.
 */
export default function AgentReviewCard({
  card,
  shape,
  color,
  imageSrc,
  onReview,
}: AgentReviewCardProps) {
  const approved = Boolean(card.approved);

  return (
    <div
      className={[
        styles['agent-review-card'],
        approved ? styles['agent-review-card--approved'] : '',
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
        {approved ? (
          <p className={styles['agent-review-card__status']}>Approved</p>
        ) : (
          <Button emphasis="primary" size="medium" onClick={onReview}>
            Review agent
          </Button>
        )}
      </div>
    </div>
  );
}
