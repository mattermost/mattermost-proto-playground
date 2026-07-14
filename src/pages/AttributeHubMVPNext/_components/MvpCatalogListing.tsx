import { useRef, useState, type DragEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
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
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import PopoverMenu, {
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import InfoHint from '@/pages/AttributeManagementHub/_components/InfoHint/InfoHint';
import {
  SOURCE_FILTERS,
  isPolicyLocked,
  isSourceOwned,
  policyLabel,
  type HubAttribute,
  type ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import { MVP_RESOURCES } from './mvpModel';
import { connectionStatus, optionCountLabel } from './mvpTerms';
import MvpConnectionPill from './MvpConnectionPill';
import styles from './MvpCatalogListing.module.scss';

/** The seed's ranked-hierarchical attribute — read-only in the MVP listing. */
export const READONLY_ATTR_ID = 'classification';

export interface MvpCatalogListingProps {
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
  onOpenMarkings: (id: string) => void;
  onReorderAttributes: (activeId: string, overId: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * MVP attribute listing: search + resource/source filters + "+ New attribute" +
 * row actions (edit / deactivate / delete). Drag-to-reorder matches Simplified.
 * The ranked-hierarchical Classification attribute renders read-only with a note
 * that it is configured in its own section.
 */
export default function MvpCatalogListing({
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
  onOpenMarkings,
  onReorderAttributes,
  onDeactivate,
  onDelete,
}: MvpCatalogListingProps) {
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

          <div
            className={styles['filters__resource']}
            ref={filterRef}
            data-tour-focus="resource-filter"
          >
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
                  {MVP_RESOURCES.map((r) => (
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

      <SectionNotice
        type="Hint"
        title="Edit access via System Console roles"
        description="Delegated Granular Administration controls who can manage attributes across the catalog. It does not assign per-attribute edit permissions."
      />

      {filtered.length === 0 ? (
        <div className={styles['listing__empty']}>
          <EmptyState
            title={filteredEmpty ? 'No attributes match these filters' : 'No attributes yet'}
            description={
              filteredEmpty
                ? 'Adjust the resource type, source, or search to see more.'
                : 'Define your first attribute to make it available across users, channels, and posts.'
            }
            action={
              filteredEmpty
                ? undefined
                : {
                    children: 'New attribute',
                    onClick: onNewAttribute,
                  }
            }
          />
        </div>
      ) : (
        <div className={styles['table']} data-tour-focus="attr-table">
          <table className={styles['table__grid']}>
            <thead>
              <tr>
                <th className={styles['table__col-handle']} aria-label="Reorder" />
                <th>Attribute</th>
                <th className={styles['table__col-type']}>Type</th>
                <th>Applies to</th>
                <th>Source</th>
                <th className={styles['table__col-count']}>Options</th>
                <th className={styles['table__col-actions']} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const synced = isSourceOwned(a);
                const locked = isPolicyLocked(a);
                const readOnly = a.id === READONLY_ATTR_ID;
                const isDragging = dragId === a.id;
                const isDragOver = dragOverId === a.id && dragId !== a.id;
                const tourFocusId =
                  a.id === 'classification'
                    ? 'classification-row'
                    : a.id === 'program'
                      ? 'program-row'
                      : undefined;
                return (
                  <tr
                    key={a.id}
                    className={[
                      styles['table__row'],
                      readOnly ? styles['table__row--readonly'] : '',
                      isDragging ? styles['table__row--dragging'] : '',
                      isDragOver ? styles['table__row--drag-over'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    data-tour-focus={tourFocusId}
                    onClick={() => {
                      if (readOnly) {
                        onOpenMarkings(a.id);
                      } else {
                        onOpenDetail(a.id);
                      }
                    }}
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
                        {readOnly && (
                          <span className={styles['table__sub']}>
                            Read-only — open the markings page
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={styles['table__type']}>{a.type}</span>
                    </td>
                    <td>
                      <div className={styles['table__chips']}>
                        {a.appliesTo
                          .filter((c) => MVP_RESOURCES.includes(c.resource))
                          .map((c) => (
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
                    <td
                      className={styles['table__actions']}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles['table__actions-row']}>
                        {readOnly ? (
                          <InfoHint
                            label="Read-only — opens the markings page"
                            arrow="Right"
                          >
                            <span className={styles['table__lock']}>
                              <Icon size="16" glyph={<ChevronRightIcon />} />
                            </span>
                          </InfoHint>
                        ) : (
                          <>
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
                          </>
                        )}
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
