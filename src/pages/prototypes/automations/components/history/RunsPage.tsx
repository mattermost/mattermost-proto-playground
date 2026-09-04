import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import RefreshIcon from '@mattermost/compass-icons/components/refresh';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Dropdown } from '@mattermost/compass-ui/components/dropdown';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { PopoverMenu, PopoverMenuDivider } from '@mattermost/compass-ui/components/popover-menu';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function RunsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getAutomation, getRunsFor } = useAutomations();
  const automation = getAutomation(id);
  const runs = getRunsFor(id);
  const [statusFilters, setStatusFilters] = useState<RunStatus[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  useOutsideClose(filterRef, filtersOpen, closeFilters);

  const filtered = useMemo(
    () =>
      statusFilters.length === 0
        ? runs
        : runs.filter((r) => statusFilters.includes(r.status)),
    [runs, statusFilters],
  );

  if (!automation) {
    return (
      <div className={styles.history}>
        <p>Automation not found</p>
        <Button emphasis="tertiary" size="small" onClick={() => navigate(BASE)}>
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
            size="small"
            padding="compact"
            icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
            onClick={() => navigate(`${BASE}/${id}/editor`)}
          />
          <h1 className={styles.history__title}>Runs · {automation.name}</h1>
        </div>
          <IconButton
            aria-label="Refresh"
            size="small"
            padding="compact"
            icon={<Icon size="16" glyph={<RefreshIcon />} />}
            onClick={() => undefined}
          />
      </div>

      <div className={styles.history__filters}>
        <div className={styles['history__filter-trigger']} ref={filterRef}>
          <Dropdown
            size="small"
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
                          size="small"
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
                size="small"
                onRemove={() =>
                  setStatusFilters((prev) => prev.filter((s) => s !== status))
                }
              >
                Status: {status}
              </Chip>
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
                      size="x-small"
                      type={run.status === 'success' ? 'success' : 'danger'}
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
