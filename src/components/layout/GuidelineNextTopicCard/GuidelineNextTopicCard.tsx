import { Link } from 'react-router-dom';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import type { Topic } from '@/manifests/topics';
import Icon, { SVG_SIZE_MAP } from '@/components/ui/Icon/Icon';
import styles from './GuidelineNextTopicCard.module.scss';

interface GuidelineNextTopicCardProps {
  next: Topic;
}

export default function GuidelineNextTopicCard({ next }: GuidelineNextTopicCardProps) {
  const to = `/${next.category}/${next.slug}`;
  const label = `Continue to ${next.name}`;

  return (
    <Link
      to={to}
      className={styles['guideline-next-topic-card']}
      aria-label={label}
    >
      <div className={styles['guideline-next-topic-card__content']}>
      <span className={styles['guideline-next-topic-card__header']}>
        <span className={styles['guideline-next-topic-card__title']}>{label}</span>
      </span>
      {next.description ? (
        <span className={styles['guideline-next-topic-card__description']}>
          {next.description}
        </span>
      ) : null}
      </div>
      <span className={styles['guideline-next-topic-card__icon']} aria-hidden>
        <Icon glyph={<ArrowRightIcon size={SVG_SIZE_MAP['20']} />} size="20" />
      </span>
    </Link>
  );
}
