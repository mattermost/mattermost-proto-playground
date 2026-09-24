import LockIcon from '@mattermost/compass-icons/components/lock';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import type { ChannelLinkCardData } from '../agentsData';
import styles from './ChannelLinkCard.module.scss';

type ChannelLinkCardProps = {
  card: ChannelLinkCardData;
  onOpen?: () => void;
};

export default function ChannelLinkCard({ card, onOpen }: ChannelLinkCardProps) {
  return (
    <div className={styles['channel-link-card']}>
      <div className={styles['channel-link-card__body']}>
        <div className={styles['channel-link-card__identity']}>
          <span className={styles['channel-link-card__icon']}>
            {card.channelType === 'private' ? (
              <Icon glyph={<LockIcon />} size="16" />
            ) : (
              <span className={styles['channel-link-card__hash']}>#</span>
            )}
          </span>
          <div className={styles['channel-link-card__copy']}>
            <p className={styles['channel-link-card__name']}>{card.channelName}</p>
            <p className={styles['channel-link-card__desc']}>{card.channelDescription}</p>
          </div>
        </div>
        {onOpen ? (
          <Button
            size="small"
            emphasis="tertiary"
            onClick={onOpen}
          >
            Open channel
          </Button>
        ) : null}
      </div>
    </div>
  );
}
