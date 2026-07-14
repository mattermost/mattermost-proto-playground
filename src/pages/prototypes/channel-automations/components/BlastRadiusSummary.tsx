import { Icon } from '@mattermost/compass-ui';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import type { BlastRadius } from '../channelAutomationsData';
import styles from './BlastRadiusSummary.module.scss';

export interface BlastRadiusSummaryProps {
  blast: BlastRadius;
  className?: string;
}

/** Always-visible impact summary for automation create/review flows. */
export default function BlastRadiusSummary({
  blast,
  className = '',
}: BlastRadiusSummaryProps) {
  return (
    <aside
      className={[styles['blast'], className].filter(Boolean).join(' ')}
      aria-label="Blast radius"
    >
      <header className={styles['blast__head']}>
        <h3 className={styles['blast__title']}>Blast radius</h3>
        <p className={styles['blast__lead']}>
          Who and what this automation can touch when it runs.
        </p>
      </header>

      <ul className={styles['blast__list']}>
        <li className={styles['blast__item']}>
          <span className={styles['blast__icon']} aria-hidden>
            <Icon
              size="16"
              glyph={
                blast.hasPrivateChannel ? <LockOutlineIcon /> : <GlobeIcon />
              }
            />
          </span>
          <div className={styles['blast__copy']}>
            <p className={styles['blast__label']}>Channels</p>
            <p className={styles['blast__value']}>
              {blast.channels.length > 0
                ? blast.channels.join(', ')
                : 'No specific channels yet'}
            </p>
          </div>
        </li>

        <li className={styles['blast__item']}>
          <span className={styles['blast__icon']} aria-hidden>
            <Icon size="16" glyph={<AccountOutlineIcon />} />
          </span>
          <div className={styles['blast__copy']}>
            <p className={styles['blast__label']}>People</p>
            <p className={styles['blast__value']}>{blast.audience}</p>
          </div>
        </li>

        {blast.exposureWarning ? (
          <li
            className={[
              styles['blast__item'],
              styles['blast__item--warning'],
            ].join(' ')}
          >
            <span className={styles['blast__icon']} aria-hidden>
              <Icon size="16" glyph={<AlertOutlineIcon />} />
            </span>
            <div className={styles['blast__copy']}>
              <p className={styles['blast__label']}>Data exposure</p>
              <p className={styles['blast__value']}>{blast.exposureWarning}</p>
            </div>
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
