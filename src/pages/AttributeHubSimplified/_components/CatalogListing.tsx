import { useRef, useState, type DragEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Chip from '@/components/ui/Chip/Chip';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Select from '@/components/ui/Select/Select';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import PopoverMenu, {
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import InfoHint from '@/pages/AttributeManagementHub/_components/InfoHint/InfoHint';
import MvpConnectionPill from '@/pages/AttributeHubMVP/_components/MvpConnectionPill';
import { connectionStatus } from '@/pages/AttributeHubMVP/_components/mvpTerms';
import {
  ALL_RESOURCES,
  SOURCE_FILTERS,
  isPolicyLocked,
  isSourceOwned,
  policyLabel,
  type HubAttribute,
  type ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import { displayType, optionCountLabel } from './simplifiedModel';
import styles from './CatalogListing.module.scss';

export interface CatalogListingProps {
  attributes: HubAttribute[];
  filtered: HubAttribute[];
  selectedResources: ResourceKind[];
  onToggleResource: (r: ResourceKind) => void;
  onClearResources: () => void;
  source: string;
  onSourceChange: (s: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  onNewAttribute: () => void;
  onOpenDetail: (id: string) => void;
  onReorderAttributes: (activeId: string, overId: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Attribute listing (§6 KEEP): the baseline filterable/searchable list with a
 * single "New attribute" button, jargon swept. The New-attribute button lives
 * only in the filter bar; the zero-data state is informational, not a second CTA.
 */
export default function CatalogListing({
  attributes,
  filtered,
  selectedResources,
  onToggleResource,
  onClearResources,
  source,
  onSourceChange,
  query,
  onQueryChange,
  onNewAttribute,
  onOpenDetail,
  onReorderAttributes,
  onDeactivate,
  onDelete,
}: CatalogListingProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [menuId, setMenuId] = useState<string | null>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const filteredEmpty = attributes.length > 0 && filtered.length === 0;

  const clearDrag = () => {
    setDragId(null);
    setDragOverId(null);
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, id: string) => {
    setDragId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (event: DragEvent<HTMLTableRowElement>, id: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dragId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (event: DragEvent<HTMLTableRowElement>, overId: string) => {
    event.preventDefault();
    if (dragId != null && dragId !== overId) {
      onReorderAttributes(dragId, overId);
    }
    clearDrag();
  };

  const resourceLabel =
    selectedResources.length === 0
      ? 'All resource types'
      : selectedResources.length === 1
        ? selectedResources[0]
        : `${selectedResources.length} resource types`;

  return (
    <div className={styles['listing']}>
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

          <div className={styles['filters__resource']} ref={filterRef}>
            <button
              type="button"
              className={styles['filters__trigger']}
              aria-haspopup="menu"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((c) => !c)}
            >
              <span>{resourceLabel}</span>
              <Icon size="16" glyph={<ChevronDownIcon />} />
            </button>
            <FixedPopoverMenu
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              anchorRef={filterRef}
              className={styles['filters__menu']}
            >
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
            </FixedPopoverMenu>
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

      {filtered.length === 0 ? (
        <div className={styles['listing__empty']}>
          <EmptyState
            title={filteredEmpty ? 'No attributes match these filters' : 'No attributes yet'}
            description={
              filteredEmpty
                ? 'Adjust the resource type, source, or search to see more.'
                : 'Define your first attribute to make it available across users, channels, posts, and teams.'
            }
          />
        </div>
      ) : (
        <div className={styles['table']}>
          <table className={styles['table__grid']}>
            <thead>
              <tr>
                <th className={styles['table__col-handle']} aria-label="Reorder" />
                <th>Attribute</th>
                <th className={styles['table__col-type']}>Type</th>
                <th>Applies to</th>
                <th>Source</th>
                <th className={styles['table__col-count']}>Options</th>
                <th>Usage</th>
                <th className={styles['table__col-actions']} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const synced = isSourceOwned(a);
                const locked = isPolicyLocked(a);
                const isDragging = dragId === a.id;
                const isDragOver = dragOverId === a.id && dragId !== a.id;
                return (
                  <tr
                    key={a.id}
                    className={[
                      styles['table__row'],
                      isDragging ? styles['table__row--dragging'] : '',
                      isDragOver ? styles['table__row--drag-over'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onOpenDetail(a.id)}
                    onDragOver={(event) => handleDragOver(event, a.id)}
                    onDrop={(event) => handleDrop(event, a.id)}
                    onDragLeave={() => {
                      if (dragOverId === a.id) {
                        setDragOverId(null);
                      }
                    }}
                    onDragEnd={clearDrag}
                  >
                    <td
                      className={styles['table__handle']}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={styles['table__drag']}
                        draggable
                        aria-label={`Reorder ${a.name}`}
                        onDragStart={(event) => handleDragStart(event, a.id)}
                      >
                        <Icon size="16" glyph={<DragVerticalIcon />} />
                      </button>
                    </td>
                    <td>
                      <div className={styles['table__name-block']}>
                        <span className={styles['table__name']}>{a.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles['table__type']}>{displayType(a)}</span>
                    </td>
                    <td>
                      <div className={styles['table__chips']}>
                        {a.appliesTo.map((c) => (
                          <Chip key={c.resource} size="Small">
                            {c.resource}
                          </Chip>
                        ))}
                      </div>
                    </td>
                    <td>
                      {synced ? (
                        <div className={styles['table__source']}>
                          <span className={styles['table__source-name']}>
                            {a.source.system}
                          </span>
                          <MvpConnectionPill status={connectionStatus(a)} />
                        </div>
                      ) : (
                        <span className={styles['table__muted']}>Managed here</span>
                      )}
                    </td>
                    <td className={styles['table__col-count']}>
                      <span className={styles['table__count']}>
                        {optionCountLabel(a)}
                      </span>
                    </td>
                    <td>
                      {a.usedByPolicies > 0 ? (
                        <span className={styles['table__usage']}>
                          {policyLabel(a.usedByPolicies)}
                        </span>
                      ) : (
                        <span className={styles['table__muted']}>Not in use</span>
                      )}
                    </td>
                    <td
                      className={styles['table__actions']}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles['table__actions-row']}>
                        {locked && (
                          <InfoHint
                            label={`Locked — ${policyLabel(a.usedByPolicies).toLowerCase()}`}
                            arrow="Right"
                          >
                            <span className={styles['table__lock']}>
                              <Icon size="12" glyph={<LockOutlineIcon />} />
                            </span>
                          </InfoHint>
                        )}
                        <div
                          className={styles['table__menu-wrap']}
                          ref={menuId === a.id ? menuWrapRef : undefined}
                        >
                          <IconButton
                            size="Small"
                            aria-label={`More actions for ${a.name}`}
                            aria-haspopup="menu"
                            aria-expanded={menuId === a.id}
                            icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
                            onClick={() =>
                              setMenuId((c) => (c === a.id ? null : a.id))
                            }
                          />
                          <FixedPopoverMenu
                            open={menuId === a.id}
                            onClose={() => setMenuId(null)}
                            anchorRef={menuWrapRef}
                            align="end"
                            className={styles['table__menu']}
                          >
                            <PopoverMenu aria-label={`${a.name} actions`}>
                              <MenuItem
                                label="Edit attribute"
                                leadingVisual={
                                  <Icon size="16" glyph={<PencilOutlineIcon />} />
                                }
                                onClick={() => {
                                  setMenuId(null);
                                  onOpenDetail(a.id);
                                }}
                              />
                              <PopoverMenuDivider />
                              <MenuItem
                                label="Deactivate attribute"
                                destructive
                                leadingVisual={
                                  <Icon size="16" glyph={<PowerPlugOutlineIcon />} />
                                }
                                onClick={() => {
                                  setMenuId(null);
                                  onDeactivate(a.id);
                                }}
                              />
                              <MenuItem
                                label="Delete attribute"
                                destructive
                                leadingVisual={
                                  <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                                }
                                onClick={() => {
                                  setMenuId(null);
                                  onDelete(a.id);
                                }}
                              />
                            </PopoverMenu>
                          </FixedPopoverMenu>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
