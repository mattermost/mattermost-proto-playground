import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import StarIcon from '@mattermost/compass-icons/components/star';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import {
  Button,
  Checkbox,
  Chip,
  Dropdown,
  EmptyState,
  Icon,
  IconButton,
  MenuItem,
  PopoverMenu,
  PopoverMenuDivider,
  Scrollbar,
  SearchInput,
  Switch,
  Tag,
  Tooltip,
  useOutsideClose,
} from '@mattermost/compass-ui';
import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PlaybooksEmptyIllustration from '@/assets/illustrations/playbooks-empty.svg?react';
import SearchIllustration from '@/assets/illustrations/search.svg?react';
import { SYSTEM_TAGS } from '../../data/automationsData';
import type { Automation, AutomationScope, AutomationStatus } from '../../data/types';
import { useAutomations } from '../../context/AutomationsContext';
import FolderOpenOutlineIcon from '../icons/FolderOpenOutlineIcon';
import RunsDashboard from '../RunsDashboard/RunsDashboard';
import TagOutlineIcon from '../icons/TagOutlineIcon';
import styles from './HomePage.module.scss';

const BASE = '/prototypes/automations';

const STATUS_OPTIONS: Array<{ value: AutomationStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
];

const SCOPE_OPTIONS: Array<{ value: AutomationScope; label: string }> = [
  { value: 'global', label: 'Global' },
  { value: 'team', label: 'Team' },
  { value: 'channel', label: 'Channel' },
];

function formatShortWhen(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function scopeLabel(scope: AutomationScope) {
  return scope.toUpperCase();
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

type FolderSection = {
  id: string;
  name: string;
  description?: string;
  automations: Automation[];
};

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    automations: allAutomations,
    folders,
    createBlank,
    setStatus,
    toggleFavorite,
    recordRecent,
    showToast,
    demoEmpty,
  } = useAutomations();
  const automations = demoEmpty ? [] : allAutomations;

  const folderFilter = searchParams.get('folder');
  const folderFilterName = folders.find((f) => f.id === folderFilter)?.name;

  const [query, setQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<AutomationStatus[]>([]);
  const [scopeFilters, setScopeFilters] = useState<AutomationScope[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [folderMenuFor, setFolderMenuFor] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(() => new Set());
  const filterRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);
  const folderMenuRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  const closeTags = useCallback(() => {
    setTagsOpen(false);
    setTagQuery('');
  }, []);
  const closeNew = useCallback(() => setNewOpen(false), []);
  const closeFolderMenu = useCallback(() => setFolderMenuFor(null), []);
  useOutsideClose(filterRef, filtersOpen, closeFilters);
  useOutsideClose(tagsRef, tagsOpen, closeTags);
  useOutsideClose(newRef, newOpen, closeNew);
  useOutsideClose(folderMenuRef, folderMenuFor != null, closeFolderMenu);

  const attributeFilterCount = statusFilters.length + scopeFilters.length;
  const activeFilterCount =
    attributeFilterCount + tagFilters.length + (folderFilter ? 1 : 0);

  const clearAttributeFilters = () => {
    setStatusFilters([]);
    setScopeFilters([]);
  };

  const clearFolderFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('folder');
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    clearAttributeFilters();
    setTagFilters([]);
    if (folderFilter) clearFolderFilter();
  };

  const availableTags = useMemo(() => {
    const fromData = new Set<string>(SYSTEM_TAGS);
    automations.forEach((a) => a.tags.forEach((t) => fromData.add(t)));
    return Array.from(fromData).sort((a, b) => a.localeCompare(b));
  }, [automations]);

  const matchedTags = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    if (!q) return availableTags;
    return availableTags.filter((t) => t.toLowerCase().includes(q));
  }, [availableTags, tagQuery]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return automations.filter((a) => {
      if (folderFilter && a.folderId !== folderFilter) return false;
      if (statusFilters.length > 0 && !statusFilters.includes(a.status)) return false;
      if (scopeFilters.length > 0 && !scopeFilters.includes(a.scope)) return false;
      if (tagFilters.length > 0 && !tagFilters.some((t) => a.tags.includes(t))) {
        return false;
      }
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.creator.toLowerCase().includes(q)
      );
    });
  }, [
    automations,
    folderFilter,
    query,
    scopeFilters,
    statusFilters,
    tagFilters,
  ]);

  const folderSections = useMemo((): FolderSection[] => {
    const byFolder = new Map<string, Automation[]>();
    filtered.forEach((a) => {
      const list = byFolder.get(a.folderId) ?? [];
      list.push(a);
      byFolder.set(a.folderId, list);
    });

    const known = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      automations: byFolder.get(folder.id) ?? [],
    })).filter((section) => section.automations.length > 0);

    // Catch any automations whose folderId is missing from the catalog.
    const knownIds = new Set(folders.map((f) => f.id));
    const orphanIds = [...byFolder.keys()].filter((id) => !knownIds.has(id));
    const orphans = orphanIds.map((id) => ({
      id,
      name: 'Other',
      automations: byFolder.get(id) ?? [],
    }));

    return [...known, ...orphans];
  }, [filtered, folders]);

  const openEditor = (id: string) => {
    recordRecent(id);
    navigate(`${BASE}/${id}/editor`);
  };

  const onNewBlank = () => {
    setNewOpen(false);
    const id = createBlank();
    openEditor(id);
  };

  const onImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    showToast(`Import of “${file.name}” isn’t available in this prototype`, 'Info');
  };

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const renderRow = (a: Automation) => (
    <tr
      key={a.id}
      className={styles.home__row}
      onClick={() => openEditor(a.id)}
    >
      <td className={styles['home__name-cell']}>
        <div className={styles['home__name-row']}>
          <span
            className={styles.home__drag}
            aria-label={`Reorder ${a.name}`}
            role="button"
            tabIndex={0}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Icon size="16" glyph={<DragVerticalIcon />} />
          </span>
          <div className={styles['home__name-block']}>
            <div className={styles.home__name}>{a.name}</div>
            <div className={styles.home__tags}>
              {a.tags.map((tag) => (
                <Tag
                  key={tag}
                  label={tag}
                  size="X-Small"
                  className={styles.home__tag}
                />
              ))}
            </div>
          </div>
        </div>
      </td>
      <td
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {a.status === 'draft' ? (
          <span className={styles['home__status-draft']}>Draft</span>
        ) : (
          <Switch
            className={styles['home__status-switch']}
            size="Small"
            checked={a.status === 'enabled'}
            aria-label={`Enable ${a.name}`}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setStatus(a.id, e.target.checked ? 'enabled' : 'disabled')
            }
          >
            {a.status === 'enabled' ? 'Enabled' : 'Disabled'}
          </Switch>
        )}
      </td>
      <td>
        <span className={styles.home__run}>
          <span
            className={[
              styles.home__dot,
              a.lastRunStatus === 'success' ? styles['home__dot--success'] : '',
              a.lastRunStatus === 'failed' ? styles['home__dot--failed'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          {formatShortWhen(a.lastRunAt)}
        </span>
      </td>
      <td>
        <Tag
          label={scopeLabel(a.scope)}
          size="X-Small"
          casing="All Caps"
        />
      </td>
      <td>{a.creator}</td>
      <td>
        <span
          className={styles.home__edited}
          title={`${formatShortWhen(a.lastEditedAt)} · ${a.lastEditedBy}`}
        >
          {formatShortWhen(a.lastEditedAt)}
          <span className={styles['home__edited-tip']} aria-hidden>
            <Tooltip
              label={formatShortWhen(a.lastEditedAt)}
              hint={a.lastEditedBy}
              arrow="Top"
            />
          </span>
        </span>
      </td>
      <td
        className={styles['home__menu-cell']}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <IconButton
            aria-label={`Actions for ${a.name}`}
            size="Small"
            padding="Compact"
            icon={<Icon size="16" glyph={<DotsVerticalIcon />} />}
            onClick={() => setMenuFor((id) => (id === a.id ? null : a.id))}
          />
          {menuFor === a.id ? (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                zIndex: 20,
              }}
            >
              <PopoverMenu>
                <MenuItem
                  label={a.favorite ? 'Unfavorite' : 'Favorite'}
                  leadingVisual={
                    <Icon
                      size="16"
                      glyph={a.favorite ? <StarIcon /> : <StarOutlineIcon />}
                    />
                  }
                  onClick={() => {
                    toggleFavorite(a.id);
                    setMenuFor(null);
                  }}
                />
                <MenuItem
                  label="Run history"
                  leadingVisual={
                    <Icon size="16" glyph={<PlayOutlineIcon />} />
                  }
                  onClick={() => {
                    setMenuFor(null);
                    navigate(`${BASE}/${a.id}/runs`);
                  }}
                />
                <MenuItem
                  label="Change history"
                  leadingVisual={
                    <Icon size="16" glyph={<ClockOutlineIcon />} />
                  }
                  onClick={() => {
                    setMenuFor(null);
                    navigate(`${BASE}/${a.id}/history`);
                  }}
                />
                <MenuItem
                  label="Delete"
                  leadingVisual={
                    <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                  }
                  destructive
                  onClick={() => setMenuFor(null)}
                />
              </PopoverMenu>
            </div>
          ) : null}
        </div>
      </td>
    </tr>
  );

  return (
    <div className={styles.home}>
      <div className={styles.home__header}>
        <div>
          <h1 className={styles.home__title}>Automations</h1>
          <p className={styles.home__subtitle}>
            Automate repetitive tasks that respond to environment triggers.
          </p>
        </div>
        <div className={styles.home__actions}>
          <div className={styles.home__split} ref={newRef}>
            <Button
              className={styles['home__split-main']}
              emphasis="Primary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
              onClick={onNewBlank}
            >
              New
            </Button>
            <Button
              className={styles['home__split-toggle']}
              emphasis="Primary"
              size="Small"
              aria-label="More create options"
              aria-haspopup="menu"
              aria-expanded={newOpen}
              leadingIcon={<Icon size="16" glyph={<ChevronDownIcon />} />}
              onClick={() => setNewOpen((v) => !v)}
            >
              {'\u200b'}
            </Button>
            {newOpen ? (
              <div className={styles['home__split-menu']}>
                <PopoverMenu>
                  <MenuItem
                    label="New automation"
                    leadingElement={false}
                    onClick={onNewBlank}
                  />
                  <MenuItem
                    label="New folder"
                    leadingElement={false}
                    onClick={() => {
                      setNewOpen(false);
                      navigate(`${BASE}/folders?create=1`);
                    }}
                  />
                  <MenuItem
                    label="New variable or secret"
                    leadingElement={false}
                    onClick={() => {
                      setNewOpen(false);
                      navigate(`${BASE}/secrets?add=1`);
                    }}
                  />
                  <MenuItem
                    label="New template"
                    leadingElement={false}
                    onClick={() => {
                      setNewOpen(false);
                      navigate(`${BASE}/templates`);
                    }}
                  />
                  <PopoverMenuDivider />
                  <MenuItem
                    label="Import automation"
                    leadingElement={false}
                    onClick={() => {
                      setNewOpen(false);
                      importInputRef.current?.click();
                    }}
                  />
                </PopoverMenu>
              </div>
            ) : null}
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className={styles['home__import-input']}
              onChange={onImportFile}
            />
          </div>
        </div>
      </div>

      <RunsDashboard />

      <div className={styles.home__filters}>
        <div className={styles['home__filter-bar']}>
          <div className={styles.home__search}>
            <SearchInput
              label="Search automations…"
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              size="Small"
            />
          </div>

          <div className={styles['home__filter-trigger']} ref={filterRef}>
            <Dropdown
              size="Small"
              isOpen={filtersOpen}
              leadingIcon={<FilterVariantIcon size={16} />}
              onClick={() => {
                setFiltersOpen((v) => !v);
                setTagsOpen(false);
              }}
              aria-haspopup="dialog"
            >
              {attributeFilterCount > 0
                ? `Filters · ${attributeFilterCount}`
                : 'Filters'}
            </Dropdown>
            {filtersOpen ? (
              <div className={styles['home__filter-panel']} role="dialog" aria-label="Filters">
                <PopoverMenu>
                  <div className={styles['home__filter-scroll']}>
                    <div className={styles['home__filter-group']}>
                      <p className={styles['home__filter-section-title']}>Status</p>
                      <div className={styles['home__filter-options']}>
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
                    <PopoverMenuDivider />
                    <div className={styles['home__filter-group']}>
                      <p className={styles['home__filter-section-title']}>Scope</p>
                      <div className={styles['home__filter-options']}>
                        {SCOPE_OPTIONS.map((opt) => (
                          <Checkbox
                            key={opt.value}
                            size="Small"
                            checked={scopeFilters.includes(opt.value)}
                            onChange={() =>
                              setScopeFilters((prev) => toggleValue(prev, opt.value))
                            }
                          >
                            {opt.label}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                  </div>
                  {attributeFilterCount > 0 ? (
                    <>
                      <PopoverMenuDivider />
                      <div className={styles['home__filter-footer']}>
                        <button
                          type="button"
                          className={styles['home__clear-filters']}
                          onClick={clearAttributeFilters}
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

          <div className={styles['home__filter-trigger']} ref={tagsRef}>
            <Dropdown
              size="Small"
              isOpen={tagsOpen}
              leadingIcon={<TagOutlineIcon size={16} />}
              onClick={() => {
                setTagsOpen((v) => !v);
                setFiltersOpen(false);
              }}
              aria-haspopup="dialog"
            >
              {tagFilters.length > 0 ? `Tags · ${tagFilters.length}` : 'Tags'}
            </Dropdown>
            {tagsOpen ? (
              <div
                className={`${styles['home__filter-panel']} ${styles['home__filter-panel--tags']}`}
                role="dialog"
                aria-label="Tag filters"
              >
                <PopoverMenu>
                  <div className={styles['home__tag-search']}>
                    <SearchInput
                      label="Find tags…"
                      value={tagQuery}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setTagQuery(e.target.value)
                      }
                      onClear={() => setTagQuery('')}
                      size="Small"
                    />
                  </div>
                  <div className={styles['home__filter-scroll']}>
                    <div className={styles['home__filter-options']}>
                      {matchedTags.length === 0 ? (
                        <p className={styles['home__tag-empty']}>No tags match</p>
                      ) : (
                        matchedTags.map((tag) => (
                          <Checkbox
                            key={tag}
                            size="Small"
                            checked={tagFilters.includes(tag)}
                            onChange={() =>
                              setTagFilters((prev) => toggleValue(prev, tag))
                            }
                          >
                            {tag}
                          </Checkbox>
                        ))
                      )}
                    </div>
                  </div>
                  {tagFilters.length > 0 ? (
                    <>
                      <PopoverMenuDivider />
                      <div className={styles['home__filter-footer']}>
                        <button
                          type="button"
                          className={styles['home__clear-filters']}
                          onClick={() => setTagFilters([])}
                        >
                          Clear tags
                        </button>
                      </div>
                    </>
                  ) : null}
                </PopoverMenu>
              </div>
            ) : null}
          </div>
        </div>

        {activeFilterCount > 0 ? (
          <div className={styles['home__active-filters']}>
            {folderFilter && folderFilterName ? (
              <Chip
                key={`folder-${folderFilter}`}
                size="Small"
                onRemove={clearFolderFilter}
                removeLabel={`Remove ${folderFilterName} folder filter`}
              >
                Folder: {folderFilterName}
              </Chip>
            ) : null}
            {statusFilters.map((status) => (
              <Chip
                key={`status-${status}`}
                size="Small"
                onRemove={() =>
                  setStatusFilters((prev) => prev.filter((s) => s !== status))
                }
                removeLabel={`Remove ${status} status filter`}
              >
                Status: {status}
              </Chip>
            ))}
            {scopeFilters.map((scope) => (
              <Chip
                key={`scope-${scope}`}
                size="Small"
                onRemove={() =>
                  setScopeFilters((prev) => prev.filter((s) => s !== scope))
                }
                removeLabel={`Remove ${scope} scope filter`}
              >
                Scope: {scope}
              </Chip>
            ))}
            {tagFilters.map((tag) => (
              <Chip
                key={`tag-${tag}`}
                size="Small"
                onRemove={() => setTagFilters((prev) => prev.filter((t) => t !== tag))}
                removeLabel={`Remove ${tag} tag filter`}
              >
                Tag: {tag}
              </Chip>
            ))}
            <button
              type="button"
              className={styles['home__clear-filters']}
              onClick={clearFilters}
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>

      {folderSections.length === 0 ? (
        <EmptyState
          className={styles.home__empty}
          illustration={
            automations.length === 0
              ? {
                  'aria-label': 'No automations',
                  width: '150px',
                  height: '125px',
                  children: <PlaybooksEmptyIllustration />,
                }
              : {
                  'aria-label': 'Search',
                  width: '120px',
                  height: '80px',
                  children: <SearchIllustration />,
                }
          }
          title={
            automations.length === 0 ? 'No automations yet' : 'No results found'
          }
          description={
            automations.length === 0
              ? 'Create one to get started.'
              : 'Try adjusting your search or filters to find what you’re looking for.'
          }
          action={
            automations.length === 0
              ? {
                  children: 'New automation',
                  emphasis: 'Primary',
                  onClick: onNewBlank,
                }
              : {
                  children: 'Clear filters',
                  emphasis: 'Tertiary',
                  onClick: clearFilters,
                }
          }
        />
      ) : (
        <div className={styles['home__folders-wrap']}>
          <Scrollbar style={{ height: '100%' }}>
            <div className={styles.home__folders}>
              {folderSections.map((section) => {
                const expanded = !collapsedFolders.has(section.id);
                return (
                  <section key={section.id} className={styles.home__folder}>
                    <div
                      className={[
                        styles['home__folder-bar'],
                        folderMenuFor === section.id
                          ? styles['home__folder-bar--menu-open']
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <button
                        type="button"
                        className={styles['home__folder-header']}
                        aria-expanded={expanded}
                        onClick={() => toggleFolder(section.id)}
                      >
                        <span
                          className={styles['home__folder-toggle']}
                          aria-hidden
                        >
                          <span className={styles['home__folder-icon']}>
                            <Icon
                              size="16"
                              glyph={
                                expanded ? (
                                  <FolderOpenOutlineIcon />
                                ) : (
                                  <FolderOutlineIcon />
                                )
                              }
                            />
                          </span>
                          <span
                            className={[
                              styles['home__folder-chevron'],
                              expanded
                                ? styles['home__folder-chevron--open']
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            <Icon size="16" glyph={<ChevronDownIcon />} />
                          </span>
                        </span>
                        <span className={styles['home__folder-title']}>
                          {section.name}
                        </span>
                      </button>
                      <span className={styles['home__folder-count']}>
                        {section.automations.length}{' '}
                        {section.automations.length === 1
                          ? 'automation'
                          : 'automations'}
                      </span>
                      <div
                        className={styles['home__folder-actions']}
                        ref={
                          folderMenuFor === section.id ? folderMenuRef : undefined
                        }
                      >
                        <IconButton
                          className={styles['home__folder-menu-btn']}
                          aria-label={`Actions for ${section.name}`}
                          aria-expanded={folderMenuFor === section.id}
                          aria-haspopup="menu"
                          size="Small"
                          padding="Compact"
                          icon={
                            <Icon size="16" glyph={<DotsVerticalIcon />} />
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderMenuFor((id) =>
                              id === section.id ? null : section.id,
                            );
                          }}
                        />
                        {folderMenuFor === section.id ? (
                          <div className={styles['home__folder-menu']}>
                            <PopoverMenu>
                              <MenuItem
                                label="Edit folder"
                                onClick={() => {
                                  setFolderMenuFor(null);
                                  navigate(
                                    `${BASE}/folders?id=${encodeURIComponent(section.id)}`,
                                  );
                                }}
                              />
                              <MenuItem
                                label="Manage folders"
                                onClick={() => {
                                  setFolderMenuFor(null);
                                  navigate(`${BASE}/folders`);
                                }}
                              />
                            </PopoverMenu>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div
                      className={[
                        styles['home__folder-collapse'],
                        expanded ? styles['home__folder-collapse--expanded'] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden={!expanded}
                    >
                      <div className={styles['home__folder-collapse-inner']}>
                        <div className={styles['home__table-wrap']}>
                          <table className={styles.home__table}>
                            <thead>
                              <tr>
                                <th className={styles['home__name-cell']}>
                                  Name
                                </th>
                                <th>Status</th>
                                <th>Last run</th>
                                <th>Scope</th>
                                <th>Creator</th>
                                <th>Last edited</th>
                                <th aria-label="Actions" />
                              </tr>
                            </thead>
                            <tbody>{section.automations.map(renderRow)}</tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </Scrollbar>
        </div>
      )}
    </div>
  );
}
