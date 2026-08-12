import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import Icon from '@/components/ui/Icon/Icon';
import PopoverMenu, {
  PopoverMenuScroll,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import {
  MENU_COPY,
  footerLine,
} from '@/pages/HierarchicalAttributeValueMenu/valueMenuCopy';
import {
  labelOf,
  otherParentIdsOf,
  searchRows,
  type MenuSide,
  type RankingMode,
} from '@/pages/HierarchicalAttributeValueMenu/valueMenuModel';
import { DRILL_COPY } from '../drilldownCopy';
import { branchSelection, levelRows, type DrillRow } from '../drilldownModel';
import DrilldownRow from './DrilldownRow';
import styles from './ValueDrilldownMenu.module.scss';

const LIST_MAX_HEIGHT = 236;
/** Type-ahead buffer lifetime, per the APG list-typeahead convention. */
const TYPEAHEAD_RESET_MS = 600;

export interface ValueDrilldownMenuProps {
  /** Root-level header, e.g. `PROGRAM`. Deeper levels are named by their value. */
  title: string;
  /** The `id` the trigger's `aria-controls` points at. */
  popupId: string;
  /** Which consequence the footer line states. */
  side: MenuSide;
  /** Drives row ORDER only — no numeral is rendered in either mode. */
  ranking: RankingMode;
  selectedIds: string[];
  onToggle: (id: string) => void;
  /** Used by the subject-side footer line. */
  subjectFirstName: string;
  /** Deep-link seeds. `initialPath` is the drill stack, root-first. */
  initialQuery?: string;
  initialPath?: string[];
  /** Narrow variant for the Channel Info sidebar. */
  compact?: boolean;
}

/**
 * The hierarchical value picker as DRILL-IN SUBMENUS — one panel, one level at a
 * time, no flyouts. Sibling of `HierarchyValueMenu`, which expands the same
 * hierarchy inline; the two exist to be compared on navigation alone.
 *
 * WHY THE BODY IS REPLACED RATHER THAN FLOWN OUT. Compass mandates a safe triangle
 * for hover-opened submenus and forbids a submenu triggering another submenu,
 * while this hierarchy is four deep. Geometry settles the rest: the panel is 312px
 * (284px compact) and the Channel Info sidebar is 400px, so a second ~300px panel
 * cannot sit beside the first. Mattermost already ships the answer —
 * `menu/sub_menu.tsx` converts submenus into a full `SubMenuModal` drill-in on
 * mobile and exposes a `subMenuHeader` slot rendered ABOVE AND OUTSIDE the
 * `MuiMenuList`. This is that structure at every width.
 *
 * WHY THIS ONE GETS TO BE A MENU. The inline build had to be a `tree`, because a
 * branch value there was selectable in the same list it expanded from, and ARIA
 * gives Enter on a parent `menuitem` to the submenu. Drilling removes the
 * collision instead of working around it: a branch row NAVIGATES and nothing else,
 * and the branch's own checkbox is the first row of its own level. One value, one
 * checkbox, one place — and Enter keeps its single ARIA-defined meaning on every
 * row. So the popup is a genuine `role="menu"` and the APG menu contract applies
 * as written.
 *
 * ANATOMY, and the reason the header is where it is:
 *
 *   header   — back button + level name + breadcrumb + search. OUTSIDE
 *              `role="menu"`, because a `menu` owns `menuitem`s, `group`s and
 *              `separator`s and nothing else; a header inside it is either an
 *              unownable child or a fake item. `sub_menu.tsx` puts its
 *              `subMenuHeader` in exactly this position.
 *   body     — `role="menu"`: the level's own value as `menuitemcheckbox`, a
 *              `separator`, then a labelled `group` of children.
 *   footer   — the one-line consequence, `aria-live="polite"`.
 *   announce — visually hidden, `aria-live="polite"`. Focus lands on a row after a
 *              level change and the header is outside the menu, so without this
 *              the new level is never spoken.
 *
 * SEARCH EXITS THE DRILL-IN. Any query replaces the body with a flat one-row-per-
 * value result list carrying breadcrumb paths — flush, no reserved chevron column,
 * every row a `menuitemcheckbox`, since a branch value has to be selectable
 * somewhere in a mode where nothing can be drilled into. The drill stack is not
 * touched, so clearing the query lands back on the level you left. This matters
 * more here than in the inline build: it is the only escape from N round trips.
 */
export default function ValueDrilldownMenu({
  title,
  popupId,
  side,
  ranking,
  selectedIds,
  onToggle,
  subjectFirstName,
  initialQuery = '',
  initialPath = [],
  compact = false,
}: ValueDrilldownMenuProps) {
  const titleId = useId();
  const [path, setPath] = useState<string[]>(initialPath);
  const [query, setQuery] = useState(initialQuery);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(true);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const typeahead = useRef({ buffer: '', at: 0 });

  const searching = query.trim() !== '';
  const results = useMemo(
    () => (searching ? searchRows(query) : []),
    [query, searching],
  );

  /** The level currently on screen. `null` is the root list, which has no parent. */
  const levelParentId = path.length > 0 ? path[path.length - 1] : null;

  /** The rows on screen, in reading and keyboard order — one level, or the results. */
  const rows = useMemo<DrillRow[]>(
    () =>
      searching
        ? results.map((row) => ({
            id: row.id,
            kind: 'leaf' as const,
            path: row.path,
          }))
        : levelRows(path, ranking),
    [path, ranking, results, searching],
  );

  const focusIndex = rows.findIndex((row) => row.id === focusId);

  // The search field is the landing spot, so a keyboard user can type immediately
  // and never has to discover the list first.
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Keep the roving target on a row that is actually rendered as the level or the
  // query moves under it.
  useEffect(() => {
    if (rows.length === 0) return;
    if (rows.some((row) => row.id === focusId)) return;
    setFocusId(rows[0].id);
  }, [rows, focusId]);

  // Move real DOM focus. `rows` is a dependency on purpose: drilling in keeps the
  // same id (the row drilled from becomes its level's own first row), so the level
  // change alone has to re-run this or focus would be left on an unmounted node.
  useEffect(() => {
    if (searchFocused) {
      searchRef.current?.focus();
      return;
    }
    if (focusId == null) return;
    rowRefs.current.get(focusId)?.focus();
  }, [focusId, rows, searchFocused]);

  const registerRow = (id: string) => (el: HTMLDivElement | null) => {
    if (el == null) rowRefs.current.delete(id);
    else rowRefs.current.set(id, el);
  };

  const focusRow = (id: string) => {
    setSearchFocused(false);
    setFocusId(id);
  };

  const moveTo = (index: number) => {
    const row = rows[index];
    if (row != null) focusRow(row.id);
  };

  /**
   * Drill in. Focus lands on the new level's FIRST row, which is that value's own
   * checkbox — the one place its selection state lives.
   */
  const drillInto = (id: string) => {
    setPath((prev) => [...prev, id]);
    focusRow(id);
  };

  /** Up one level, with focus returned to the row that was drilled from. */
  const goBack = () => {
    if (path.length === 0) return;
    const from = path[path.length - 1];
    setPath((prev) => prev.slice(0, -1));
    focusRow(from);
  };

  /**
   * The APG menu contract. Movement and level changes belong to the panel;
   * Enter and Space belong to the row, whose default action depends on its role.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    const row = focusIndex >= 0 ? rows[focusIndex] : undefined;

    // Escape belongs to the host: it closes the popover and returns focus to the
    // trigger, rather than stepping back a level.
    if (key === 'Escape') return;

    if (key === 'ArrowDown') {
      event.preventDefault();
      if (searchFocused) {
        if (rows.length > 0) focusRow(rows[0].id);
        return;
      }
      moveTo(Math.min(focusIndex + 1, rows.length - 1));
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      if (searchFocused) return;
      if (focusIndex <= 0) {
        setSearchFocused(true);
        return;
      }
      moveTo(focusIndex - 1);
      return;
    }

    if (key === 'Home' || key === 'End') {
      if (searchFocused) return;
      event.preventDefault();
      moveTo(key === 'Home' ? 0 : rows.length - 1);
      return;
    }

    if (key === 'ArrowRight') {
      if (searchFocused || row == null || row.kind !== 'branch') return;
      event.preventDefault();
      drillInto(row.id);
      return;
    }

    if (key === 'ArrowLeft' || key === 'Backspace') {
      // While the search field has focus both keys are text editing, and search
      // has exited the drill-in anyway, so there is no level to step back to.
      if (searchFocused || searching || path.length === 0) return;
      event.preventDefault();
      goBack();
      return;
    }

    // Type-ahead within the current level. Never changes level or selection.
    if (
      key.length === 1 &&
      key !== ' ' &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !searchFocused &&
      rows.length > 0
    ) {
      event.preventDefault();
      const now = Date.now();
      const buffer =
        now - typeahead.current.at > TYPEAHEAD_RESET_MS
          ? key
          : typeahead.current.buffer + key;
      typeahead.current = { buffer, at: now };
      const needle = buffer.toLowerCase();
      const from = Math.max(focusIndex, 0);
      for (let step = 1; step <= rows.length; step += 1) {
        const candidate = rows[(from + step) % rows.length];
        if (labelOf(candidate.id).toLowerCase().startsWith(needle)) {
          focusRow(candidate.id);
          return;
        }
      }
    }
  };

  const renderRow = (row: DrillRow, posInSet?: number, setSize?: number) => {
    const navigation = row.kind === 'branch';
    return (
      <DrilldownRow
        key={row.id}
        innerRef={registerRow(row.id)}
        label={labelOf(row.id)}
        kind={row.kind}
        posInSet={posInSet}
        setSize={setSize}
        selected={!navigation && selectedIds.includes(row.id)}
        qualifier={row.kind === 'self' ? DRILL_COPY.selfQualifier : null}
        otherParents={otherParentIdsOf(row.id).map(labelOf)}
        navNote={
          navigation
            ? DRILL_COPY.navSelectionNote(branchSelection(row.id, selectedIds))
            : null
        }
        path={row.path}
        focused={!searchFocused && focusId === row.id}
        onActivate={() => {
          if (navigation) {
            drillInto(row.id);
            return;
          }
          focusRow(row.id);
          onToggle(row.id);
        }}
      />
    );
  };

  // ── Header: where you are, and how to get back out.
  const insideLevel = !searching && levelParentId != null;
  const headerTitle = insideLevel
    ? labelOf(levelParentId as string)
    : searching
      ? DRILL_COPY.searchResultsLabel
      : title;
  const ancestorLabels = insideLevel ? path.slice(0, -1).map(labelOf) : [];
  const backLabel =
    path.length > 1
      ? DRILL_COPY.backTo(labelOf(path[path.length - 2]))
      : DRILL_COPY.backToTop;

  const groupLabel =
    levelParentId != null
      ? DRILL_COPY.groupLabel(labelOf(levelParentId))
      : undefined;
  const childRows = rows.filter((row) => row.kind !== 'self');

  const announcement = searching
    ? DRILL_COPY.searchAnnouncement(results.length)
    : levelParentId == null
      ? DRILL_COPY.topLevelAnnouncement(rows.length)
      : DRILL_COPY.levelAnnouncement(labelOf(levelParentId), childRows.length);

  const rootClass = [
    styles['value-drilldown'],
    compact ? styles['value-drilldown--compact'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="presentation" onKeyDown={handleKeyDown}>
      <PopoverMenu className={styles['value-drilldown__surface']}>
        {/*
          Header, outside `role="menu"`. A menu owns items, groups and separators;
          a back button and a level name are none of those, and `sub_menu.tsx`
          renders its `subMenuHeader` above the list for the same reason.
        */}
        <div className={styles['value-drilldown__header']}>
          <div className={styles['value-drilldown__level']}>
            {insideLevel && (
              <button
                type="button"
                className={styles['value-drilldown__back']}
                aria-label={backLabel}
                onClick={goBack}
              >
                <Icon size="16" glyph={<ArrowLeftIcon />} />
              </button>
            )}
            <span
              id={titleId}
              className={[
                styles['value-drilldown__title'],
                insideLevel ? styles['value-drilldown__title--level'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {headerTitle}
            </span>
          </div>

          {ancestorLabels.length > 0 && (
            <span className={styles['value-drilldown__crumb']}>
              {DRILL_COPY.breadcrumb(ancestorLabels)}
            </span>
          )}

          <SearchInput
            ref={searchRef}
            size="Small"
            value={query}
            placeholder={MENU_COPY.searchPlaceholder}
            aria-label={`Search ${title.toLowerCase()} values`}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocusId(null);
            }}
            onClear={() => {
              setQuery('');
              setFocusId(null);
            }}
          />
        </div>

        <PopoverMenuScroll maxHeight={LIST_MAX_HEIGHT}>
          <div
            id={popupId}
            className={styles['value-drilldown__menu']}
            role="menu"
            aria-labelledby={titleId}
          >
            {rows.length === 0 ? (
              <p className={styles['value-drilldown__empty']}>
                {MENU_COPY.noResults}
              </p>
            ) : insideLevel ? (
              <>
                {/* The level's own value — the ONLY place its state is drawn. */}
                {renderRow(rows[0])}
                <div
                  className={styles['value-drilldown__separator']}
                  role="separator"
                />
                <div
                  className={styles['value-drilldown__group']}
                  role="group"
                  aria-label={groupLabel}
                >
                  {/*
                    Visible heading for the group whose accessible name is the same
                    string; hidden from the tree so the group owns only menu items.
                  */}
                  <span
                    className={styles['value-drilldown__group-label']}
                    aria-hidden="true"
                  >
                    {groupLabel}
                  </span>
                  {childRows.map((row, i) =>
                    renderRow(row, i + 1, childRows.length),
                  )}
                </div>
              </>
            ) : (
              rows.map((row, i) => renderRow(row, i + 1, rows.length))
            )}
          </div>
        </PopoverMenuScroll>

        {/* The primary feedback for a selection change, so it has to be announced. */}
        <p className={styles['value-drilldown__footer']} aria-live="polite">
          {footerLine(side, selectedIds, subjectFirstName)}
        </p>

        <div className={styles['value-drilldown__announce']} aria-live="polite">
          {announcement}
        </div>
      </PopoverMenu>
    </div>
  );
}
