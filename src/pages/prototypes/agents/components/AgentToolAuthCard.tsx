import CheckIcon from '@mattermost/compass-icons/components/check';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { type AgentToolAuthCard as AuthCardData } from '../agentsData';
import styles from './AgentToolAuthCard.module.scss';

type AgentToolAuthCardProps = {
  card: AuthCardData;
  onConnected?: (card: AuthCardData) => void;
};

function providerLabel(provider: AuthCardData['provider']): string {
  if (provider === 'github') return 'GitHub';
  if (provider === 'atlassian') return 'Atlassian';
  return 'Google';
}

/** Interactive message attachment: marks the tool connected on authenticate (no real OAuth). */
export default function AgentToolAuthCard({
  card,
  onConnected,
}: AgentToolAuthCardProps) {
  const label = providerLabel(card.provider);
  const connected = Boolean(card.connected);

  return (
    <div
      className={[
        styles['tool-auth-card'],
        connected ? styles['tool-auth-card--connected'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['tool-auth-card__body']}>
        <h3 className={styles['tool-auth-card__title']}>
          {connected ? `Connected to ${label}` : `Authenticate with ${label}`}
        </h3>
        <p className={styles['tool-auth-card__description']}>
          {connected
            ? `${card.toolLabel} is ready for Matty to use.`
            : `Continue to ${label} to grant access to ${card.toolLabel}.`}
        </p>
        {connected ? (
          <div className={styles['tool-auth-card__connected']}>
            <Icon glyph={<CheckIcon />} size="16" />
            <span>Authentication complete</span>
          </div>
        ) : (
          <Button
            emphasis="primary"
            size="medium"
            onClick={() => onConnected?.(card)}
          >
            {`Continue with ${label}`}
          </Button>
        )}
      </div>
    </div>
  );
}
