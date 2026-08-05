import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import {
  Checkbox,
  Chip,
  Dropdown,
  PopoverMenu,
  PopoverMenuDivider,
  Scrollbar,
  Tag,
  useOutsideClose,
} from '@mattermost/compass-ui';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RunStatus } from '../../data/types';
import { useAutomations } from '../../context/AutomationsContext';
import RunsDashboard from '../RunsDashboard/RunsDashboard';
import styles from './history.module.scss';

const BASE = '/prototypes/automations';

const STATUS_OPTIONS: Array<{ value: RunStatus; label: string }> = [
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'running', label: 'Running' },
];

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * Cross-automation run history for the Automations product home actions.
 */
export default function AllRunsPage() {
  const navigate = useNavigate();
  const { runs, getAutomation, demoEmpty } = useAutomations();
  const [statusFilters, setStatusFilters] = useState<RunStatus[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  useOutsideClose(filterRef, filtersOpen, closeFilters);

  const sortedRuns = useMemo(
    () =>
      demoEmpty
        ? []
        : [...runs].sort(
            (a, b) =>
              new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
          ),
    [demoEmpty, runs],
  );

  const filtered = useMemo(
    () =>
      statusFilters.length === 0
        ? sortedRuns
        : sortedRuns.filter((r) => statusFilters.includes(r.status)),
    [sortedRuns, statusFilters],
  );

  return (
    <div className={styles.history}>
      <div className={styles.history__header}>
        <div className={styles.history__heading}>
          <h1 className={styles.history__title}>Run history</h1>
          <p className={styles.history__subtitle}>
            Review recent runs across all automations.
          </p>
        </div>
      </div>

      <RunsDashboard linkToRuns={false} />

      <div className={styles.history__filters}>
        <div className={styles['history__filter-trigger']} ref={filterRef}>
          <Dropdown
            size="Small"
            isOpen={filtersOpen}
            leadingIcon={<FilterVariantIcon size={16} />}
            onClick={() => setFiltersOpen((v) => !v)}
            aria-haspopup="dialog"
          >
            {statusFilters.length > 0
              ? `Filters · ${statusFilters.length}`
              : 'Filters'}
          </Dropdown>
          {filtersOpen ? (
            <div
              className={styles['history__filter-panel']}
              role="dialog"
              aria-label="Filters"
            >
              <PopoverMenu>
                <div className={styles['history__filter-scroll']}>
                  <div className={styles['history__filter-group']}>
                    <p className={styles['history__filter-section-title']}>Status</p>
                    <div className={styles['history__filter-options']}>
                      {STATUS_OPTIONS.map((opt) => (
                        <Checkbox
                          key={opt.value}
                          size="Small"
                          checked={statusFilters.includes(opt.value)}
                          onChange={() =>
                            setStatusFilters((prev) => toggleValue(prev, opt.value))
                          }
                        >
                          {opt.label}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                </div>
                {statusFilters.length > 0 ? (
                  <>
                    <PopoverMenuDivider />
                    <div className={styles['history__filter-footer']}>
                      <button
                        type="button"
                        className={styles['history__clear-filters']}
                        onClick={() => setStatusFilters([])}
                      >
                        Clear filters
                      </button>
                    </div>
                  </>
                ) : null}
              </PopoverMenu>
            </div>
          ) : null}
        </div>

        {statusFilters.length > 0 ? (
          <div className={styles['history__active-filters']}>
            {statusFilters.map((status) => (
              <Chip
                key={status}
                label={`Status: ${status}`}
                size="Small"
                onRemove={() =>
                  setStatusFilters((prev) => prev.filter((s) => s !== status))
                }
              />
            ))}
            <button
              type="button"
              className={styles['history__clear-filters']}
              onClick={() => setStatusFilters([])}
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles['history__table-wrap']}>
        <Scrollbar style={{ height: '100%' }}>
          <table className={styles.history__table}>
            <thead>
              <tr>
                <th>Automation</th>
                <th>Started</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((run) => {
                const automation = getAutomation(run.automationId);
                return (
                  <tr
                    key={run.id}
                    className={styles.history__row}
                    onClick={() =>
                      navigate(`${BASE}/${run.automationId}/runs/${run.id}`)
                    }
                  >
                    <td className={styles.history__name}>
                      {automation?.name ?? run.automationId}
                    </td>
                    <td>{new Date(run.startedAt).toLocaleString()}</td>
                    <td>
                      <Tag
                        label={run.status}
                        size="X-Small"
                        type={run.status === 'success' ? 'Success' : 'Danger'}
                      />
                    </td>
                    <td>{run.durationMs} ms</td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    {demoEmpty || sortedRuns.length === 0
                      ? 'No runs yet.'
                      : 'No runs match this filter.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Scrollbar>
      </div>
    </div>
  );
}
