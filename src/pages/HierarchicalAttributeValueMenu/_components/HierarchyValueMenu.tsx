import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import PopoverMenu, {
  PopoverMenuScroll,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import { MENU_COPY, footerLine } from '../valueMenuCopy';
import {
  canonicalChildIdsOf,
  canonicalDescendantIdsOf,
  hasCanonicalChildren,
  labelOf,
  otherParentIdsOf,
  rootIds,
  searchRows,
  type MenuSide,
  type RankingMode,
} from '../valueMenuModel';
import ValueTreeItem from './ValueTreeItem';
import styles from './HierarchyValueMenu.module.scss';

const LIST_MAX_HEIGHT = 236;
/** Type-ahead buffer lifetime, per the APG list-typeahead convention. */
const TYPEAHEAD_RESET_MS = 600;

interface TreeNode {
  id: string;
  /** 1-based depth. */
  level: number;
  posInSet: number;
  setSize: number;
  parentId: string | null;
  /** Has rows to draw beneath it. */
  branch: boolean;
  expanded: boolean;
  /** Populated only while expanded — this IS the visible tree. */
  children: TreeNode[];
  /** Search mode only. */
  path?: string[];
}

export interface HierarchyValueMenuProps {
  /** Section header over the rows, e.g. `PROGRAM`. */
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
  /** Deep-link seeds. */
  initialQuery?: string;
  initialExpandedIds?: string[];
  /** Narrow variant for the Channel Info sidebar. */
  compact?: boolean;
}

/**
 * The hierarchical value picker — one popover, three hosts, NO FLYOUTS.
 *
 * WHY THIS IS A TREE AND NOT A MENU. A branch value here is selectable: marking a
 * channel "Air Operations" is a real, common act, distinct from looking inside
 * it. A menu cannot express that. ARIA 1.2 defines activating a parent
 * `menuitem` as opening its submenu, APG's Enter behaviour is exclusive
 * ("opens the submenu … Otherwise, activates the item"), and Compass's own
 * popover-menu guideline leaves no free key — "ENTER executes the menu item and
 * closes the menu", Right opens the submenu. So a selectable branch inside a
 * menu is unreachable by keyboard (WCAG 2.1.1). Shipping Mattermost concedes the
 * same point: `menu/sub_menu.tsx` sets `onClick: isMobileView ? handleOnClick :
 * undefined`, i.e. a submenu parent is not activatable on desktop at all.
 *
 * APG legalises the alternative directly — a combobox popup "is an element that
 * has role listbox, tree, grid, or dialog", and for a tree popup "some or all
 * parent nodes may serve as suggestion category labels so may not be selectable
 * values", which makes parent-selectability an implementation choice rather than
 * a contradiction. Trigger is therefore `combobox`, popup is `tree` with
 * `aria-multiselectable`, expansion is Right/Left, selection is Space.
 *
 * WHY INLINE AND NOT FLYOUT. Compass caps submenus at one level ("Submenus
 * should not trigger other submenus… Consider another navigation pattern if this
 * is required") and this hierarchy is three deep. It also does not fit: the
 * popover is 312px (284px compact) inside a 400px right-hand sidebar, so the
 * build this replaces was already flipping its flyouts leftward over the centre
 * channel. Children expand inline at ~12px per level, in the same popover. No
 * hover-to-expand either — the guideline's safe-triangle hazard disappears when
 * there is nothing to fly out. Expansion is click and keyboard only.
 *
 * TWO BODIES, ONE ROLE MODEL:
 *
 *  BROWSE (no query) — the forest, expanded inline. Every value is drawn EXACTLY
 *  ONCE, under its canonical parent, with an "Also under …" line carrying its
 *  remaining edges. One value, one row, one control, one state: a DAG node drawn
 *  under each of its parents reads as two distinct values and is the fastest
 *  route to a mis-assignment, and there is no correct `aria-owns` story for the
 *  second copy. Rows carry no path here — the indentation IS the path.
 *
 *  SEARCH (any query) — the body flips to a flat result list, one row per value
 *  with its canonical breadcrumb. This is the escape hatch from drilling, and the
 *  only place a path belongs. The tree is not filtered in place; selections
 *  persist across every filter change.
 *
 * SELECTION IS STRICT. Selecting a parent selects that parent and nothing else —
 * implicit descendant selection would silently widen an access grant. What a
 * collapsed parent must never do is CONCEAL a selected descendant, so it states
 * the count on its own row ("2 selected inside"). That is a separate element, not
 * a check or an indeterminate mark on the parent's own control, which would
 * misstate what is actually assigned.
 */
export default function HierarchyValueMenu({
  title,
  popupId,
  side,
  ranking,
  selectedIds,
  onToggle,
  subjectFirstName,
  initialQuery = '',
  initialExpandedIds = [],
  compact = false,
}: HierarchyValueMenuProps) {
  const titleId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [expandedIds, setExpandedIds] = useState<string[]>(initialExpandedIds);
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

  /** The VISIBLE tree. Collapsed branches carry no children, by construction. */
  const tree = useMemo<TreeNode[]>(() => {
    if (searching) {
      return results.map((row, i) => ({
        id: row.id,
        level: 1,
        posInSet: i + 1,
        setSize: results.length,
        parentId: null,
        branch: false,
        expanded: false,
        children: [],
        path: row.path,
      }));
    }
    const build = (
      ids: string[],
      level: number,
      parentId: string | null,
    ): TreeNode[] =>
      ids.map((id, i) => {
        const branch = hasCanonicalChildren(id);
        const expanded = branch && expandedIds.includes(id);
        return {
          id,
          level,
          posInSet: i + 1,
          setSize: ids.length,
          parentId,
          branch,
          expanded,
          children: expanded
            ? build(canonicalChildIdsOf(id, ranking), level + 1, id)
            : [],
        };
      });
    return build(rootIds(ranking), 1, null);
  }, [expandedIds, ranking, results, searching]);

  /** Same tree in keyboard order — one source of truth, two readings. */
  const flat = useMemo<TreeNode[]>(() => {
    const out: TreeNode[] = [];
    const walk = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        out.push(node);
        walk(node.children);
      }
    };
    walk(tree);
    return out;
  }, [tree]);

  const focusIndex = flat.findIndex((node) => node.id === focusId);

  // Keep the roving target on a node that is actually rendered as the query or
  // the expansion set moves under it.
  useEffect(() => {
    if (flat.length === 0) return;
    if (flat.some((node) => node.id === focusId)) return;
    setFocusId(flat[0].id);
  }, [flat, focusId]);

  // The search field is the landing spot, so a keyboard user can type at once
  // and never has to discover the list first.
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Move real DOM focus to the active node whenever the roving target changes.
  useEffect(() => {
    if (searchFocused) {
      searchRef.current?.focus();
      return;
    }
    if (focusId == null) return;
    rowRefs.current.get(focusId)?.focus();
  }, [focusId, searchFocused]);

  const registerRow = (id: string) => (el: HTMLDivElement | null) => {
    if (el == null) rowRefs.current.delete(id);
    else rowRefs.current.set(id, el);
  };

  const setExpanded = (id: string, next: boolean) => {
    setExpandedIds((prev) => {
      if (next) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((candidate) => candidate !== id);
    });
  };

  const focusNode = (id: string) => {
    setSearchFocused(false);
    setFocusId(id);
  };

  const moveTo = (index: number) => {
    const node = flat[index];
    if (node != null) focusNode(node.id);
  };

  /**
   * Straight off the APG treeview table. The two acts never share a key:
   * Right/Left move through the hierarchy, Space and Enter change selection.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    const node = focusIndex >= 0 ? flat[focusIndex] : undefined;

    // Escape belongs to the host: there is no submenu level to step back to, so
    // it closes the whole popover and returns focus to the trigger.
    if (key === 'Escape') return;

    if (key === 'ArrowDown') {
      event.preventDefault();
      if (searchFocused) {
        if (flat.length > 0) focusNode(flat[0].id);
        return;
      }
      moveTo(Math.min(focusIndex + 1, flat.length - 1));
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
      moveTo(key === 'Home' ? 0 : flat.length - 1);
      return;
    }

    if (key === 'ArrowRight') {
      if (searchFocused || node == null) return;
      event.preventDefault();
      if (!node.branch) return;
      if (!node.expanded) {
        // Expands in place; focus stays put, as APG requires.
        setExpanded(node.id, true);
        return;
      }
      moveTo(focusIndex + 1);
      return;
    }

    if (key === 'ArrowLeft') {
      if (searchFocused || node == null) return;
      event.preventDefault();
      if (node.branch && node.expanded) {
        setExpanded(node.id, false);
        return;
      }
      if (node.parentId != null) focusNode(node.parentId);
      return;
    }

    // Space and Enter are not handled here: selection is the NODE's default
    // action, so `ValueTreeItem` owns those two keys and stops them bubbling.

    // Type-ahead: jump to the next visible node whose label starts with what has
    // been typed. Never touches expansion or selection.
    if (
      key.length === 1 &&
      key !== ' ' &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !searchFocused &&
      flat.length > 0
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
      for (let step = 1; step <= flat.length; step += 1) {
        const candidate = flat[(from + step) % flat.length];
        if (labelOf(candidate.id).toLowerCase().startsWith(needle)) {
          focusNode(candidate.id);
          return;
        }
      }
    }
  };

  const hiddenSelectedCount = (node: TreeNode): number => {
    if (!node.branch || node.expanded) return 0;
    return canonicalDescendantIdsOf(node.id).filter((id) =>
      selectedIds.includes(id),
    ).length;
  };

  const renderNodes = (nodes: TreeNode[]): ReactNode =>
    nodes.map((node) => (
      <Fragment key={node.id}>
        <ValueTreeItem
          innerRef={registerRow(node.id)}
          label={labelOf(node.id)}
          level={node.level}
          flush={searching}
          posInSet={node.posInSet}
          setSize={node.setSize}
          selected={selectedIds.includes(node.id)}
          branch={node.branch}
          expanded={node.expanded}
          otherParents={otherParentIdsOf(node.id).map(labelOf)}
          hiddenSelectedCount={hiddenSelectedCount(node)}
          path={node.path}
          focused={!searchFocused && focusId === node.id}
          onToggleSelect={() => {
            focusNode(node.id);
            onToggle(node.id);
          }}
          onToggleExpand={() => {
            focusNode(node.id);
            setExpanded(node.id, !node.expanded);
          }}
        />
        {node.children.length > 0 && (
          // The indent is the group's own padding, so nesting produces the
          // per-level step without any row knowing its own depth in pixels.
          <div role="group" className={styles['value-menu__group']}>
            {renderNodes(node.children)}
          </div>
        )}
      </Fragment>
    ));

  const rootClass = [
    styles['value-menu'],
    compact ? styles['value-menu--compact'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="presentation" onKeyDown={handleKeyDown}>
      <PopoverMenu className={styles['value-menu__surface']}>
        <div className={styles['value-menu__header']}>
          <span className={styles['value-menu__title']} id={titleId}>
            {title}
          </span>
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
            className={styles['value-menu__tree']}
            role="tree"
            aria-multiselectable="true"
            aria-labelledby={titleId}
          >
            {flat.length === 0 ? (
              <p className={styles['value-menu__empty']}>
                {MENU_COPY.noResults}
              </p>
            ) : (
              renderNodes(tree)
            )}
          </div>
        </PopoverMenuScroll>

        {/*
          The primary feedback for a selection change, so it has to be announced.
          As a plain paragraph it was silent to assistive tech.
        */}
        <p className={styles['value-menu__footer']} aria-live="polite">
          {footerLine(side, selectedIds, subjectFirstName)}
        </p>
      </PopoverMenu>
    </div>
  );
}
