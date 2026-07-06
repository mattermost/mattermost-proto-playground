import { useRef, useState } from 'react';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import Icon from '@/components/ui/Icon/Icon';
import Dropdown from '@/components/ui/Dropdown/Dropdown';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  RESOURCE_PILLS,
  type Resource,
} from '../../../AttributeManagementV2/data';
import styles from './CatalogFilterBar.module.scss';

export type ResourceFilterKey = 'All' | Resource;

export interface CatalogFilterBarProps {
  activeResource: ResourceFilterKey;
  onResourceChange: (key: ResourceFilterKey) => void;
  eligibleOnly: boolean;
  onEligibleOnlyChange: (next: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (next: string) => void;
}

/**
 * Catalog toolbar — resource scope in a dropdown (not pills), eligibility
 * filter, and search.
 */
export default function CatalogFilterBar({
  activeResource,
  onResourceChange,
  eligibleOnly,
  onEligibleOnlyChange,
  searchQuery,
  onSearchQueryChange,
}: CatalogFilterBarProps) {
  const [resourceOpen, setResourceOpen] = useState(false);
  const resourceRef = useRef<HTMLDivElement>(null);
  useOutsideClose(resourceRef, resourceOpen, () => setResourceOpen(false));

  const activeLabel =
    RESOURCE_PILLS.find((p) => p.key === activeResource)?.label ?? 'All';

  return (
    <div className={styles['bar']}>
      <div className={styles['bar__left']}>
        <div className={styles['bar__dropdown-wrap']} ref={resourceRef}>
          <Dropdown
            className={`${styles['bar__filter']} ${styles['bar__filter-dropdown']}`}
            size="Small"
            padding="Tight"
            leadingIcon={
              <span className={styles['bar__filter-icon']}>
                <Icon glyph={<FilterVariantIcon />} size="12" />
              </span>
            }
            isOpen={resourceOpen}
            aria-label="Filter by resource"
            onClick={() => setResourceOpen((o) => !o)}
          >
            Applies to: {activeLabel}
          </Dropdown>
          {resourceOpen && (
            <div className={styles['bar__menu']}>
              <PopoverMenu aria-label="Applies to">
                {RESOURCE_PILLS.map((pill) => (
                  <MenuItem
                    key={pill.key}
                    label={pill.label}
                    active={activeResource === pill.key}
                    trailingElement={activeResource === pill.key}
                    leadingElement={false}
                    onClick={() => {
                      onResourceChange(pill.key);
                      setResourceOpen(false);
                    }}
                  />
                ))}
              </PopoverMenu>
            </div>
          )}
        </div>

        <button
          type="button"
          className={`${styles['bar__filter']} ${eligibleOnly ? styles['bar__filter--active'] : ''}`}
          aria-pressed={eligibleOnly}
          onClick={() => onEligibleOnlyChange(!eligibleOnly)}
        >
          <span className={styles['bar__filter-icon']}>
            <Icon glyph={<FilterVariantIcon />} size="12" />
          </span>
          <span>Usable in access policies</span>
        </button>
      </div>

      <div className={styles['bar__right']}>
        <label className={styles['bar__search']}>
          <span className={styles['bar__search-icon']} aria-hidden>
            <Icon glyph={<MagnifyIcon />} size="12" />
          </span>
          <input
            type="search"
            className={styles['bar__search-input']}
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
