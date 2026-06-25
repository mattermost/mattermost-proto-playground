import { Link } from 'react-router-dom';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import type { Topic } from '@/manifests/topics';
import { SVG_SIZE_MAP , Icon} from '@mattermost/compass-ui';
import styles from './GuidelineNextTopicCard.module.scss';

interface GuidelineNextTopicCardProps {
  next: Topic;
  /** Visible + accessible title. Defaults to `Continue to {next.name}`. */
  title?: string;
  /** Subtitle under the title. Defaults to `next.description` when set. */
  description?: string | null;
}

export default function GuidelineNextTopicCard({
  next,
  title,
  description,
}: GuidelineNextTopicCardProps) {
  const to = `/${next.category}/${next.slug}`;
  const heading = title ?? `Continue to ${next.name}`;
  const desc =
    description !== undefined && description !== null
      ? description
      : next.description;

  return (
    <Link
      to={to}
      className={styles['guideline-next-topic-card']}
      aria-label={heading}
    >
      <div className={styles['guideline-next-topic-card__content']}>
      <span className={styles['guideline-next-topic-card__header']}>
        <span className={styles['guideline-next-topic-card__title']}>{heading}</span>
      </span>
      {desc ? (
        <span className={styles['guideline-next-topic-card__description']}>
          {desc}
        </span>
      ) : null}
      </div>
      <span className={styles['guideline-next-topic-card__icon']} aria-hidden>
        <Icon glyph={<ArrowRightIcon size={SVG_SIZE_MAP['20']} />} size="20" />
      </span>
    </Link>
  );
}
