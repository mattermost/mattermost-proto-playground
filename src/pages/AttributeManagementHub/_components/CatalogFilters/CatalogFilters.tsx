import { useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Select from '@/components/ui/Select/Select';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { ALL_RESOURCES, SOURCE_FILTERS, type ResourceKind } from '../../hubData';
import styles from './CatalogFilters.module.scss';

export interface CatalogFiltersProps {
  selectedResources: ResourceKind[];
  onToggleResource: (r: ResourceKind) => void;
  onClearResources: () => void;
  source: string;
  onSourceChange: (s: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  onNewAttribute: () => void;
}

export default function CatalogFilters({
  selectedResources,
  onToggleResource,
  onClearResources,
  source,
  onSourceChange,
  query,
  onQueryChange,
  onNewAttribute,
}: CatalogFiltersProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideClose(wrapRef, open, () => setOpen(false));

  const resourceLabel =
    selectedResources.length === 0
      ? 'All resource types'
      : selectedResources.length === 1
        ? selectedResources[0]
        : `${selectedResources.length} resource types`;

  return (
    <div className={styles['filters']}>
      <div className={styles['filters__controls']}>
        <div className={styles['filters__search']}>
          <SearchInput
            className={styles['filters__searchInput']}
            size="Medium"
            placeholder="Search attributes"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onClear={() => onQueryChange('')}
          />
        </div>

        <div className={styles['filters__resource']} ref={wrapRef}>
          <button
            type="button"
            className={styles['filters__trigger']}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((c) => !c)}
          >
            <span>{resourceLabel}</span>
            <Icon size="16" glyph={<ChevronDownIcon />} />
          </button>
          {open && (
            <div className={styles['filters__menu']}>
              <PopoverMenu aria-label="Filter by resource type">
                <div className={styles['filters__menu-body']}>
                  {ALL_RESOURCES.map((r) => (
                    <label key={r} className={styles['filters__option']}>
                      <Checkbox
                        checked={selectedResources.includes(r)}
                        onChange={() => onToggleResource(r)}
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    className={styles['filters__clear']}
                    onClick={onClearResources}
                  >
                    Clear
                  </button>
                </div>
              </PopoverMenu>
            </div>
          )}
        </div>

        <div className={styles['filters__source']}>
          <Select
            className={styles['filters__select']}
            size="Medium"
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            aria-label="Filter by source"
          >
            {SOURCE_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Button
        emphasis="Primary"
        leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
        onClick={onNewAttribute}
      >
        New attribute
      </Button>
    </div>
  );
}
