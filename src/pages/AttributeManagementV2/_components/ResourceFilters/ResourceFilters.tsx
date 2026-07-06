import { useRef, useState } from 'react';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Icon from '@/components/ui/Icon/Icon';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { ALL_RESOURCES, type Resource } from '../../data';
import styles from './ResourceFilters.module.scss';

export type ResourceFilterKey = 'All' | Resource;
export type ViewMode = 'list' | 'audit';

export interface ResourceFiltersProps {
  /**
   * Selected resource types. An EMPTY set means "show all" — the filter is
   * additive, not exclusive, so it scales as new entity types (boards, docs,
   * teams) come online without an ever-growing tab strip or a misleading
   * "All" tab.
   */
  selectedResources: Set<Resource>;
  onSelectedResourcesChange: (next: Set<Resource>) => void;
  eligibleOnly: boolean;
  onEligibleOnlyChange: (next: boolean) => void;
  viewMode: ViewMode;
  onViewModeChange: (next: ViewMode) => void;
  searchQuery: string;
  onSearchQueryChange: (next: string) => void;
  /**
   * Resource types offered in the dropdown. Defaults to A's full set.
   * Variation B passes a Users-free set so the Attributes area is scoped to
   * Channels/Posts/Teams. The chrome stays identical either way.
   */
  resources?: Resource[];
}

/**
 * Resource filter (multi-select checkbox dropdown) + eligibility filter chip
 * + view-toggle + search.
 *
 * Per the July-1 concepts meeting: resource selection is a scalable
 * multi-select checkbox dropdown, not a fixed tab strip. Unchecked = show all.
 * Eligibility is STATE (a separate chip); the eligibility audit is a
 * view-toggle next to search, not a top-level page.
 */
export default function ResourceFilters({
  selectedResources,
  onSelectedResourcesChange,
  eligibleOnly,
  onEligibleOnlyChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  resources = ALL_RESOURCES,
}: ResourceFiltersProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideClose(wrapRef, open, () => setOpen(false));

  const count = selectedResources.size;
  const triggerLabel =
    count === 0
      ? 'All resource types'
      : count === 1
        ? [...selectedResources][0]
        : `${count} resource types`;

  const toggle = (resource: Resource) => {
    const next = new Set(selectedResources);
    if (next.has(resource)) next.delete(resource);
    else next.add(resource);
    onSelectedResourcesChange(next);
  };

  return (
    <div className={styles['filters']}>
      <div className={styles['filters__lead']}>
        <div className={styles['filters__dropdown']} ref={wrapRef}>
          <button
            type="button"
            className={`${styles['filters__trigger']} ${count > 0 ? styles['filters__trigger--active'] : ''}`}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={styles['filters__trigger-label']}>
              {triggerLabel}
            </span>
            <span className={styles['filters__trigger-caret']} aria-hidden>
              <Icon glyph={<ChevronDownIcon />} size="12" />
            </span>
          </button>

          {open && (
            <PopoverMenu className={styles['filters__menu']}>
              <div className={styles['filters__menu-head']}>
                <span className={styles['filters__menu-title']}>
                  Resource type
                </span>
                {count > 0 && (
                  <button
                    type="button"
                    className={styles['filters__menu-clear']}
                    onClick={() => onSelectedResourcesChange(new Set())}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className={styles['filters__menu-options']}>
                {resources.map((resource) => (
                  <label
                    key={resource}
                    className={styles['filters__option']}
                  >
                    <Checkbox
                      size="Medium"
                      checked={selectedResources.has(resource)}
                      onChange={() => toggle(resource)}
                    />
                    <span className={styles['filters__option-label']}>
                      {resource}
                    </span>
                  </label>
                ))}
              </div>
            </PopoverMenu>
          )}
        </div>

        <button
          type="button"
          className={`${styles['filters__chip']} ${eligibleOnly ? styles['filters__chip--active'] : ''}`}
          onClick={() => onEligibleOnlyChange(!eligibleOnly)}
          aria-pressed={eligibleOnly}
        >
          <Icon glyph={<FilterVariantIcon />} size="12" />
          <span>Usable in access policies</span>
        </button>
      </div>

      <div className={styles['filters__right']}>
        <div
          className={styles['filters__toggle']}
          role="tablist"
          aria-label="View mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            className={`${styles['filters__toggle-btn']} ${viewMode === 'list' ? styles['filters__toggle-btn--active'] : ''}`}
            onClick={() => onViewModeChange('list')}
          >
            List
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'audit'}
            className={`${styles['filters__toggle-btn']} ${viewMode === 'audit' ? styles['filters__toggle-btn--active'] : ''}`}
            onClick={() => onViewModeChange('audit')}
          >
            Eligibility audit
          </button>
        </div>

        <label className={styles['filters__search']}>
          <span className={styles['filters__search-icon']} aria-hidden>
            <Icon glyph={<MagnifyIcon />} size="12" />
          </span>
          <input
            type="search"
            className={styles['filters__search-input']}
            placeholder="Search attributes"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            aria-label="Search attributes"
          />
        </label>
      </div>
    </div>
  );
}
