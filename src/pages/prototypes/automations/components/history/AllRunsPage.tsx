import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import RefreshIcon from '@mattermost/compass-icons/components/refresh';
import {
  Button,
  Checkbox,
  Chip,
  Icon,
  IconButton,
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
  const { runs, getAutomation } = useAutomations();
  const [statusFilters, setStatusFilters] = useState<RunStatus[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  useOutsideClose(filterRef, filtersOpen, closeFilters);

  const sortedRuns = useMemo(
    () =>
      [...runs].sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      ),
    [runs],
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
        <div className={styles['history__title-row']}>
          <h1 className={styles.history__title}>Run history</h1>
        </div>
        <IconButton
          aria-label="Refresh"
          size="Small"
          padding="Compact"
          icon={<Icon size="16" glyph={<RefreshIcon />} />}
          onClick={() => undefined}
        />
      </div>

      <div className={styles.history__filters}>
        <div className={styles['history__filter-trigger']} ref={filterRef}>
          <Button
            emphasis={statusFilters.length > 0 ? 'Secondary' : 'Tertiary'}
            size="Small"
            leadingIcon={<Icon size="16" glyph={<FilterVariantIcon />} />}
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-haspopup="dialog"
          >
            {statusFilters.length > 0
              ? `Filters · ${statusFilters.length}`
              : 'Filters'}
          </Button>
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
                <th>Started</th>
                <th>Automation</th>
                <th>Status</th>
                <th>Duration</th>
                <th />
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
                    <td>{new Date(run.startedAt).toLocaleString()}</td>
                    <td>{automation?.name ?? run.automationId}</td>
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
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>No runs match this filter.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Scrollbar>
      </div>
    </div>
  );
}
