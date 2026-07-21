import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import { Button, Icon, IconButton, Scrollbar, Tag } from '@mattermost/compass-ui';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { RunStatus } from '../../data/types';
import { useAutomations } from '../../context/AutomationsContext';
import styles from './history.module.scss';

const BASE = '/prototypes/automations';

export default function RunsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getAutomation, getRunsFor } = useAutomations();
  const automation = getAutomation(id);
  const runs = getRunsFor(id);
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'all'>('all');

  const filtered = useMemo(
    () =>
      statusFilter === 'all'
        ? runs
        : runs.filter((r) => r.status === statusFilter),
    [runs, statusFilter],
  );

  if (!automation) {
    return (
      <div className={styles.history}>
        <p>Automation not found</p>
        <Button emphasis="Tertiary" size="Small" onClick={() => navigate(BASE)}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.history}>
      <div className={styles.history__header}>
        <div className={styles['history__title-row']}>
          <IconButton
            aria-label="Back to editor"
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
            onClick={() => navigate(`${BASE}/${id}/editor`)}
          />
          <h1 className={styles.history__title}>Runs · {automation.name}</h1>
        </div>
        <Button emphasis="Tertiary" size="X-Small" onClick={() => undefined}>
          Refresh
        </Button>
      </div>
      <div className={styles.history__filters}>
        {(['all', 'success', 'failed', 'running'] as const).map((s) => (
          <Button
            key={s}
            emphasis={statusFilter === s ? 'Primary' : 'Tertiary'}
            size="X-Small"
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'All statuses' : s}
          </Button>
        ))}
      </div>
      <div className={styles['history__table-wrap']}>
        <Scrollbar style={{ height: '100%' }}>
          <table className={styles.history__table}>
            <thead>
              <tr>
                <th>Started</th>
                <th>Status</th>
                <th>Duration</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((run) => (
                <tr
                  key={run.id}
                  className={styles.history__row}
                  onClick={() => navigate(`${BASE}/${id}/runs/${run.id}`)}
                >
                  <td>{new Date(run.startedAt).toLocaleString()}</td>
                  <td>
                    <Tag
                      label={run.status}
                      size="X-Small"
                      type={run.status === 'success' ? 'Success' : 'Danger'}
                    />
                  </td>
                  <td>{run.durationMs} ms</td>
                  <td>
                    <button type="button" className={styles.history__link}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4}>No runs match this filter.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Scrollbar>
      </div>
    </div>
  );
}
