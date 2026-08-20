import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react';
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
import LabelTag from '@/components/ui/LabelTag/LabelTag';
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
import SyncPill from '@/pages/AttributeManagementHub/_components/SyncPill/SyncPill';
import {
  ALL_RESOURCES,
  SOURCE_FILTERS,
  isPolicyLocked,
  isSourceOwned,
  policyLabel,
  valueCountLabel,
  type HubAttribute,
  type ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import ResourceSettingsMenuContent from './ResourceSettingsMenuContent';
import styles from './CatalogListing.module.scss';

const DEFAULT_RESOURCES = ALL_RESOURCES;

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
  /** Resource kinds shown in the filter menu. Defaults to all four. */
  allowedResources?: ResourceKind[];
  /** Override for the zero-data empty state description. */
  emptyDescription?: string;
  /** When false, hides the source filter dropdown. Default: true. */
  showSourceFilter?: boolean;
  /** Filter bar control size. Default: Medium. */
  filterSize?: 'Medium' | 'Small';
  /** When false, hides the Usage column. Default: true. */
  showUsageColumn?: boolean;
  /** When false, hides the Source column. Default: true. */
  showSourceColumn?: boolean;
  /** Policy-locked rows do not navigate to detail (resource settings). */
  policyLockedNoNavigate?: boolean;
  /** System/global rows show lock only — no menu or drill-down (resource settings). */
  isScopeLocked?: (attribute: HubAttribute) => boolean;
  /** When true for a row, show a muted SYSTEM badge beside the attribute name. */
  showSystemBadge?: (attribute: HubAttribute) => boolean;
  /** Group the table into labeled sections (e.g. system vs team-scoped). */
  catalogSections?: Array<{
    label: string;
    filter: (attribute: HubAttribute) => boolean;
  }>;
  /** Resource-settings surfaces (team / channel) — row menu for editable attributes. */
  resourceSettingsMenu?: {
    isAttributeReadOnly: (attribute: HubAttribute) => boolean;
    onEdit: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
  };
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
  allowedResources = DEFAULT_RESOURCES,
  emptyDescription = 'Define your first attribute to make it available across users, channels, and posts.',
  showSourceFilter = true,
  filterSize = 'Medium',
  showUsageColumn = true,
  showSourceColumn = true,
  policyLockedNoNavigate = false,
  isScopeLocked,
  showSystemBadge,
  catalogSections,
  resourceSettingsMenu,
}: CatalogListingProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [menuId, setMenuId] = useState<string | null>(null);
  const menuAnchorRef = useRef<HTMLDivElement | null>(null);
  const rowMenuWrapRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const closeRowMenu = useCallback(() => {
    setMenuId(null);
    menuAnchorRef.current = null;
  }, []);

  const openRowMenu = (attributeId: string) => {
    const anchor = rowMenuWrapRefs.current[attributeId];
    if (!anchor) return;
    menuAnchorRef.current = anchor;
    setMenuId(attributeId);
  };

  const toggleRowMenu = (attributeId: string) => {
    if (menuId === attributeId) {
      closeRowMenu();
      return;
    }
    openRowMenu(attributeId);
  };

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

  const menuAttribute = menuId
    ? filtered.find((item) => item.id === menuId) ??
      attributes.find((item) => item.id === menuId) ??
      null
    : null;
  const menuSettingsReadOnly =
    menuAttribute && resourceSettingsMenu
      ? resourceSettingsMenu.isAttributeReadOnly(menuAttribute)
      : false;
  const menuUseSettings =
    Boolean(resourceSettingsMenu && menuAttribute && !menuSettingsReadOnly);

  const sectionRows = useMemo(() => {
    if (!catalogSections || catalogSections.length === 0) {
      return [{ label: null as string | null, rows: filtered }];
    }
    return catalogSections
      .map((section) => ({
        label: section.label,
        rows: filtered.filter(section.filter),
      }))
      .filter((section) => section.rows.length > 0);
  }, [catalogSections, filtered]);

  const renderColgroup = () => (
    <colgroup>
      <col className={styles['table__col-handle']} />
      <col className={styles['table__col-name']} />
      <col className={styles['table__col-type']} />
      <col className={styles['table__col-applies']} />
      {showSourceColumn && <col className={styles['table__col-source']} />}
      <col className={styles['table__col-count']} />
      {showUsageColumn && <col className={styles['table__col-usage']} />}
      <col className={styles['table__col-actions']} />
    </colgroup>
  );

  const renderRow = (a: HubAttribute) => {
    const synced = isSourceOwned(a);
    const policyLocked = isPolicyLocked(a);
    const scopeLocked = isScopeLocked?.(a) ?? false;
    const systemBadge = showSystemBadge?.(a) ?? false;
    const hideDragHandle = scopeLocked || systemBadge;
    const showLock = policyLocked || scopeLocked;
    const rowLocked =
      scopeLocked || (policyLockedNoNavigate && policyLocked);
    const isDragging = dragId === a.id;
    const isDragOver =
      !hideDragHandle && dragOverId === a.id && dragId !== a.id;

    return (
      <tr
        key={a.id}
        className={[
          styles['table__row'],
          rowLocked ? styles['table__row--locked'] : '',
          isDragging ? styles['table__row--dragging'] : '',
          isDragOver ? styles['table__row--drag-over'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => {
          if (!rowLocked) onOpenDetail(a.id);
        }}
        onDragOver={
          hideDragHandle
            ? undefined
            : (event) => handleDragOver(event, a.id)
        }
        onDrop={
          hideDragHandle
            ? undefined
            : (event) => handleDrop(event, a.id)
        }
        onDragLeave={
          hideDragHandle
            ? undefined
            : () => {
                if (dragOverId === a.id) {
                  setDragOverId(null);
                }
              }
        }
        onDragEnd={hideDragHandle ? undefined : clearDrag}
      >
        <td
          className={styles['table__handle']}
          onClick={(event) => event.stopPropagation()}
        >
          {hideDragHandle ? (
            <span className={styles['table__handle-spacer']} aria-hidden />
          ) : (
            <button
              type="button"
              className={styles['table__drag']}
              draggable
              aria-label={`Reorder ${a.name}`}
              onDragStart={(event) => handleDragStart(event, a.id)}
            >
              <Icon size="16" glyph={<DragVerticalIcon />} />
            </button>
          )}
        </td>
        <td>
          <div className={styles['table__name-block']}>
            <div className={styles['table__name-row']}>
              <span className={styles['table__name']}>{a.name}</span>
              {showSystemBadge?.(a) && (
                <LabelTag
                  label="SYSTEM"
                  type="Default"
                  size="X-Small"
                  casing="All Caps"
                />
              )}
            </div>
            {a.valuesLink && (
              <span className={styles['table__sub']}>
                Values shared from {a.valuesLink.attributeName}
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
              .filter((c) => c.resource !== 'Teams')
              .map((c) => (
              <Chip key={c.resource} size="Small">
                {c.resource}
              </Chip>
            ))}
          </div>
        </td>
        {showSourceColumn && (
          <td>
            {synced && a.source.state ? (
              <SyncPill state={a.source.state} system={a.source.system} />
            ) : (
              <span className={styles['table__muted']}>Managed here</span>
            )}
          </td>
        )}
        <td className={styles['table__col-count']}>
          <span className={styles['table__count']}>
            {valueCountLabel(a)}
          </span>
        </td>
        {showUsageColumn && (
          <td>
            {a.usedByPolicies > 0 ? (
              <span className={styles['table__usage']}>
                {policyLabel(a.usedByPolicies)}
              </span>
            ) : (
              <span className={styles['table__muted']}>Not in use</span>
            )}
          </td>
        )}
        <td
          className={[styles['table__actions'], styles['table__col-actions']].join(' ')}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles['table__actions-row']}>
            {showLock && (
              <InfoHint
                className={styles['table__lock-hint']}
                label={
                  scopeLocked
                    ? 'Locked — system attribute'
                    : `Locked — ${policyLabel(a.usedByPolicies).toLowerCase()}`
                }
                arrow="Right"
              >
                <span className={styles['table__lock']}>
                  <Icon size="16" glyph={<LockOutlineIcon />} />
                </span>
              </InfoHint>
            )}
            {!rowLocked && (
              <div
                className={styles['table__menu-wrap']}
                ref={(node) => {
                  rowMenuWrapRefs.current[a.id] = node;
                }}
              >
                <IconButton
                  size="Small"
                  aria-label={`More actions for ${a.name}`}
                  aria-haspopup="menu"
                  aria-expanded={menuId === a.id}
                  icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRowMenu(a.id);
                  }}
                />
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={styles['listing']}>
      <div
        className={[
          styles['filters'],
          filterSize === 'Small' ? styles['filters--small'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles['filters__controls']}>
          <div className={styles['filters__search']}>
            <SearchInput
              className={styles['filters__searchInput']}
              size={filterSize}
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
              <Icon size={filterSize === 'Small' ? '12' : '16'} glyph={<ChevronDownIcon />} />
            </button>
            <FixedPopoverMenu
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              anchorRef={filterRef}
              className={styles['filters__menu']}
            >
              <PopoverMenu aria-label="Filter by resource type">
                <div className={styles['filters__menu-body']}>
                  {allowedResources.map((r) => (
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

          {showSourceFilter && (
            <div className={styles['filters__source']}>
              <Select
                className={styles['filters__select']}
                size={filterSize}
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
          )}

          <Button
            className={styles['filters__action']}
            emphasis="Primary"
            size={filterSize}
            leadingIcon={<Icon size={filterSize === 'Small' ? '12' : '16'} glyph={<PlusIcon />} />}
            onClick={onNewAttribute}
          >
            New attribute
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles['listing__empty']}>
          <EmptyState
            title={filteredEmpty ? 'No attributes match these filters' : 'No attributes yet'}
            description={
              filteredEmpty
                ? showSourceFilter
                  ? 'Adjust the resource type, source, or search to see more.'
                  : 'Adjust the resource type or search to see more.'
                : emptyDescription
            }
          />
        </div>
      ) : (
        <div
          className={styles['table']}
        >
          {sectionRows.map((section) => (
            <div key={section.label ?? 'all'} className={styles['table__section']}>
              {section.label && (
                <h4 className={styles['table__section-title']}>{section.label}</h4>
              )}
              <table className={styles['table__grid']}>
                {renderColgroup()}
                <thead>
                  <tr>
                    <th className={styles['table__col-handle']} aria-label="Reorder" />
                    <th className={styles['table__col-name']}>Attribute</th>
                    <th className={styles['table__col-type']}>Type</th>
                    <th className={styles['table__col-applies']}>Applies to</th>
                    {showSourceColumn && (
                      <th className={styles['table__col-source']}>Source</th>
                    )}
                    <th className={styles['table__col-count']}>Values</th>
                    {showUsageColumn && (
                      <th className={styles['table__col-usage']}>Usage</th>
                    )}
                    <th className={styles['table__col-actions']} aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>{section.rows.map(renderRow)}</tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <FixedPopoverMenu
        open={Boolean(menuId && menuAttribute)}
        onClose={closeRowMenu}
        anchorRef={menuAnchorRef}
        align="end"
        preferAbove
        className={styles['table__menu']}
        minWidthFloor={220}
        repositionKey={menuId}
      >
        {menuId && menuAttribute ? (
          menuUseSettings ? (
            <ResourceSettingsMenuContent
              attribute={menuAttribute}
              onEdit={() => resourceSettingsMenu!.onEdit(menuId)}
              onDuplicate={() => resourceSettingsMenu!.onDuplicate(menuId)}
              onDelete={() => resourceSettingsMenu!.onDelete(menuId)}
              onClose={closeRowMenu}
            />
          ) : (
            <PopoverMenu aria-label={`${menuAttribute.name} actions`}>
              {menuSettingsReadOnly && resourceSettingsMenu ? (
                <MenuItem
                  label="View attribute"
                  leadingVisual={
                    <Icon size="16" glyph={<PencilOutlineIcon />} />
                  }
                  onClick={() => {
                    closeRowMenu();
                    onOpenDetail(menuId);
                  }}
                />
              ) : (
                <>
                  <MenuItem
                    label="Edit attribute"
                    leadingVisual={
                      <Icon size="16" glyph={<PencilOutlineIcon />} />
                    }
                    onClick={() => {
                      closeRowMenu();
                      onOpenDetail(menuId);
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
                      closeRowMenu();
                      onDeactivate(menuId);
                    }}
                  />
                  <MenuItem
                    label="Delete attribute"
                    destructive
                    leadingVisual={
                      <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                    }
                    onClick={() => {
                      closeRowMenu();
                      onDelete(menuId);
                    }}
                  />
                </>
              )}
            </PopoverMenu>
          )
        ) : null}
      </FixedPopoverMenu>
    </div>
  );
}
