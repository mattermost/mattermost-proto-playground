import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import { Icon } from '@mattermost/compass-ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutomations } from '../../context/AutomationsContext';
import styles from './RunsDashboard.module.scss';

const BASE = '/prototypes/automations';

/** Prototype 7-day run totals (fixture volume). */
const RUN_STATS_7D = {
  successful: 138,
  failed: 8,
};

/** Daily run counts (oldest → newest) for the sparkline. */
const RUN_SPARKLINE = [3, 5, 4, 6, 5, 8, 7, 6, 9, 8, 10, 12, 11, 14, 13, 16];

type RunsDashboardProps = {
  /** When false, the Run History card is static (already on that page). Default true. */
  linkToRuns?: boolean;
};

export default function RunsDashboard({ linkToRuns = true }: RunsDashboardProps) {
  const navigate = useNavigate();
  const { automations } = useAutomations();

  const runStats7d = useMemo(() => {
    const { successful, failed } = RUN_STATS_7D;
    const total = successful + failed;
    const pct = (n: number) =>
      total === 0 ? '0%' : `${((n / total) * 100).toFixed(1)}%`;
    return {
      successful,
      failed,
      successfulPct: pct(successful),
      failedPct: pct(failed),
      sparkMax: Math.max(...RUN_SPARKLINE, 1),
    };
  }, []);

  const sparkline = (
    <span className={styles['runs-dashboard__sparkline']} aria-hidden>
      {RUN_SPARKLINE.map((count, i) => (
        <span
          key={i}
          className={styles['runs-dashboard__sparkline-bar']}
          style={{
            height: `${Math.max((count / runStats7d.sparkMax) * 100, 12)}%`,
          }}
        />
      ))}
    </span>
  );

  return (
    <div className={styles['runs-dashboard']}>
      <div className={styles['runs-dashboard__metric']}>
        <p className={styles['runs-dashboard__label']}>Total Automations</p>
        <p className={styles['runs-dashboard__value']}>{automations.length}</p>
      </div>
      <div className={styles['runs-dashboard__metric']}>
        <p className={styles['runs-dashboard__label']}>Successful · 7d</p>
        <p className={styles['runs-dashboard__value']}>
          {runStats7d.successful}
          <span className={styles['runs-dashboard__pct']}>
            {runStats7d.successfulPct}
          </span>
        </p>
      </div>
      <div className={styles['runs-dashboard__metric']}>
        <p className={styles['runs-dashboard__label']}>Failed · 7d</p>
        <p className={styles['runs-dashboard__value']}>
          {runStats7d.failed}
          <span className={styles['runs-dashboard__pct']}>
            {runStats7d.failedPct}
          </span>
        </p>
      </div>
      {linkToRuns ? (
        <button
          type="button"
          className={`${styles['runs-dashboard__metric']} ${styles['runs-dashboard__metric--link']}`}
          onClick={() => navigate(`${BASE}/runs`)}
        >
          <span className={styles['runs-dashboard__label']}>
            Run History
            <Icon size="12" glyph={<ArrowRightIcon />} />
          </span>
          {sparkline}
        </button>
      ) : (
        <div className={styles['runs-dashboard__metric']}>
          <p className={styles['runs-dashboard__label']}>Run History</p>
          {sparkline}
        </div>
      )}
    </div>
  );
}
