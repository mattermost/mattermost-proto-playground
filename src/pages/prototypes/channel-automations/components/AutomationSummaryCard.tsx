import Icon from '@/components/ui/Icon/Icon';
import {
  AUTOMATION_TYPE_META,
  type AutomationType,
} from '../channelAutomationsData';
import { automationGlyph } from './automationIcons';
import styles from './AutomationSummaryCard.module.scss';

export interface AutomationSummaryCardProps {
  name: string;
  type: AutomationType;
  when: string;
  posts: string;
}

/** Inline automation preview card shown at the end of the create flow and when editing. */
export default function AutomationSummaryCard({
  name,
  type,
  when,
  posts,
}: AutomationSummaryCardProps) {
  const meta = AUTOMATION_TYPE_META[type];

  return (
    <div className={styles['card']}>
      <div className={styles['card__head']}>
        <span className={styles['card__icon']} aria-hidden>
          <Icon size="20" glyph={automationGlyph(meta.iconKey)} />
        </span>
        <div className={styles['card__titles']}>
          <p className={styles['card__name']}>{name}</p>
          <p className={styles['card__type']}>{meta.label}</p>
        </div>
      </div>
      <dl className={styles['card__rows']}>
        <div className={styles['card__row']}>
          <dt className={styles['card__label']}>When</dt>
          <dd className={styles['card__value']}>{when}</dd>
        </div>
        <div className={styles['card__row']}>
          <dt className={styles['card__label']}>Posts</dt>
          <dd className={styles['card__value']}>{posts}</dd>
        </div>
      </dl>
    </div>
  );
}
