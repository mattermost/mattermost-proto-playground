import type { ReactNode } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import type { AgentColor, AgentShape } from '../agentsData';
import AgentAvatar from './AgentAvatar';
import styles from './AgentReviewCard.module.scss';

type AgentApprovalCardProps = {
  title: string;
  description: string;
  leadingIcon?: ReactNode;
  agentShape?: AgentShape;
  agentColor?: AgentColor;
  accepted: boolean;
  dismissed: boolean;
  onApprove: () => void;
  onDismiss: () => void;
};

/** Channel attachment: Matty's one-click approval gate before an agent starts working. */
export default function AgentApprovalCard({
  title,
  description,
  leadingIcon,
  agentShape,
  agentColor,
  accepted,
  dismissed,
  onApprove,
  onDismiss,
}: AgentApprovalCardProps) {
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
          {leadingIcon ? (
            <div className={styles['agent-review-card__leading-icon']}>{leadingIcon}</div>
          ) : agentShape && agentColor ? (
            <AgentAvatar shape={agentShape} color={agentColor} size="sm" eyes shadow={false} />
          ) : null}
          <div className={styles['agent-review-card__copy']}>
            <p className={styles['agent-review-card__title']}>{title}</p>
            <p className={styles['agent-review-card__description']}>{description}</p>
          </div>
        </div>
        {accepted ? (
          <p className={styles['agent-review-card__status']}>Approved</p>
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
            <Button emphasis="primary" size="small" onClick={onApprove}>
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
