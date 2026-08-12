import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import {
  additionalParentsOf,
  anchorParentLabel,
  childRows,
  isStubOccurrence,
  optionMap,
  rootOptions,
  schemeOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import {
  computeVisibility,
  isRestricted,
  type MaskMode,
} from '../externalModel';
import ReadonlyTreeRow, { type AdditionalParentChip } from './ReadonlyTreeRow';
import ReadonlyDetailPopover from './ReadonlyDetailPopover';
import styles from './ReadonlyTreeView.module.scss';

export interface ReadonlyTreeViewProps {
  options: GraphOption[];
  maskMode: MaskMode;
  /** Seeds the filter box (used by the `filtered-no-results` demo state). */
  initialFilter?: string;
}

/** One render occurrence: a node under a specific parent (or a root). */
interface Occurrence {
  node: GraphOption;
  viaParentId: string | null;
  isStub: boolean;
}

/**
 * Read-only projection of the externally-managed hierarchy: browse + filter,
 * with non-accessible values masked (position kept, identity suppressed) or
 * hidden (omitted). Reuses the authoring tree's projection (anchor spine +
 * read-only reference stubs, the "show cross-references in place" viewing
 * toggle) with every editing affordance stripped. `role="tree"`, single column.
 */
export default function ReadonlyTreeView({
  options,
  maskMode,
  initialFilter = '',
}: ReadonlyTreeViewProps) {
  const [filter, setFilter] = useState(initialFilter);
  const [showRefsInPlace, setShowRefsInPlace] = useState(false);
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const detailAnchor = useRef<HTMLElement | null>(null);
  const rowEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const highlightTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

  const effectiveHidden = maskMode === 'hidden' || accessibleOnly;
  const { visibleIds, matchIds, filtering } = computeVisibility(options, {
    filter,
    effectiveHidden,
  });

  const registerRow = (id: string, el: HTMLDivElement | null) => {
    if (el) rowEls.current.set(id, el);
    else rowEls.current.delete(id);
  };

  const isExpanded = (id: string) => filtering || !collapsed.has(id);
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const jumpTo = (id: string) => {
    setDetailId(null);
    const el = rowEls.current.get(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightId(id);
    window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightId(null), 1600);
  };

  const openDetail = (id: string, el: HTMLElement) => {
    detailAnchor.current = el;
    setDetailId(id);
  };

  // Child occurrences rendered under `parentId`, in seed order, filtered by
  // visibility and by the in-place toggle (stubs only when it's on).
  const occurrencesUnder = (parentId: string): Occurrence[] =>
    childRows(options, parentId)
      .map((node) => ({
        node,
        viaParentId: parentId,
        isStub: isStubOccurrence(node, parentId),
      }))
      .filter((occ) => {
        if (!visibleIds.has(occ.node.id)) return false;
        if (occ.isStub) return showRefsInPlace; // stubs are a viewing opt-in
        return true;
      });

  const rootOccurrences = (): Occurrence[] =>
    rootOptions(options)
      .filter((node) => visibleIds.has(node.id))
      .map((node) => ({ node, viaParentId: null, isStub: false }));

  const isMaskedPlaceholder = (node: GraphOption) =>
    isRestricted(node.id) && !effectiveHidden;

  // Render a sibling list, collapsing every RUN of contiguous restricted-masked
  // occurrences into ONE non-enumerated "Restricted" affordance. This is the
  // T1 count-leak defense: never N numbered placeholders, never a "+N" count.
  const renderSiblings = (occs: Occurrence[], depth: number): ReactNode[] => {
    const out: ReactNode[] = [];
    let i = 0;
    while (i < occs.length) {
      const occ = occs[i];
      if (isMaskedPlaceholder(occ.node)) {
        let j = i;
        while (j < occs.length && isMaskedPlaceholder(occs[j].node)) j++;
        out.push(
          <div
            key={`restricted-${depth}-${i}`}
            className={styles['restricted']}
            style={{
              paddingLeft: `calc(${depth} * var(--spacing-l) + var(--spacing-s))`,
            }}
            role="treeitem"
            tabIndex={-1}
            aria-level={depth + 1}
            aria-selected={false}
            aria-label="Restricted — one or more values here are not available to you"
          >
            <span className={styles['row__twist-spacer']} aria-hidden />
            <span className={styles['restricted__icon']} aria-hidden>
              <Icon size="16" glyph={<LockOutlineIcon />} />
            </span>
            <span className={styles['restricted__label']}>Restricted</span>
            <span className={styles['restricted__hint']}>
              not available to you
            </span>
          </div>,
        );
        i = j;
        continue;
      }
      out.push(renderAccessible(occ, depth));
      i++;
    }
    return out;
  };

  const renderAccessible = (occ: Occurrence, depth: number): ReactNode => {
    const { node, viaParentId, isStub } = occ;
    const scheme = schemeOf(node.id);
    const color = node.color ?? null;

    if (isStub) {
      return (
        <ReadonlyTreeRow
          key={`${viaParentId}:${node.id}:stub`}
          id={node.id}
          label={node.label}
          depth={depth}
          scheme={scheme}
          color={color}
          isStub
          anchorLabel={anchorParentLabel(options, node)}
          disabled={node.disabled}
          matched={false}
          highlighted={false}
          hasChildren={false}
          expanded={false}
          chips={[]}
          multiCount={0}
          registerRow={registerRow}
          onToggle={() => {}}
          onOpenDetail={() => {}}
          onJump={jumpTo}
        />
      );
    }

    const childOccs = occurrencesUnder(node.id);
    const hasChildren = childOccs.length > 0;
    const expanded = isExpanded(node.id);

    // Extra parents render as read-only chips only when in-place stubs are OFF.
    // Count-leak defense (T1): however many extra parents are restricted, they
    // collapse into ONE non-enumerated "Restricted" chip — never N of them.
    let chips: AdditionalParentChip[] = [];
    if (!showRefsInPlace && node.parentIds.length > 1) {
      const extra = additionalParentsOf(options, node);
      const accessible = extra
        .filter((p) => !isRestricted(p.id))
        .map((p) => ({ id: p.id, label: p.label, restricted: false }));
      const anyRestricted = !effectiveHidden && extra.some((p) => isRestricted(p.id));
      chips = anyRestricted
        ? [
            ...accessible,
            { id: `${node.id}__restricted`, label: 'Restricted', restricted: true },
          ]
        : accessible;
    }
    const multiCount = showRefsInPlace ? node.parentIds.length : 0;

    return (
      <div key={`${viaParentId ?? 'root'}:${node.id}`} className={styles['group']}>
        <ReadonlyTreeRow
          id={node.id}
          label={node.label}
          depth={depth}
          scheme={scheme}
          color={color}
          isStub={false}
          disabled={node.disabled}
          matched={matchIds.has(node.id)}
          highlighted={highlightId === node.id}
          hasChildren={hasChildren}
          expanded={expanded}
          chips={chips}
          multiCount={multiCount}
          registerRow={registerRow}
          onToggle={() => toggle(node.id)}
          onOpenDetail={(el) => openDetail(node.id, el)}
          onJump={jumpTo}
        />
        {hasChildren && expanded && renderSiblings(childOccs, depth + 1)}
      </div>
    );
  };

  const roots = rootOccurrences();
  const noResults = filtering && matchIds.size === 0;
  const detailNode = detailId ? optionMap(options).get(detailId) ?? null : null;

  return (
    <div className={styles['view']}>
      <div className={styles['toolbar']}>
        <div className={styles['toolbar__search']}>
          <TextInput
            size="Small"
            placeholder="Filter values…"
            aria-label="Filter values"
            leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter.length > 0 && (
            <IconButton
              size="Small"
              aria-label="Clear filter"
              icon={<Icon size="16" glyph={<CloseIcon />} />}
              onClick={() => setFilter('')}
            />
          )}
        </div>
        <div className={styles['toolbar__toggle']}>
          <Switch
            size="Small"
            checked={accessibleOnly}
            onChange={(e) => setAccessibleOnly(e.target.checked)}
          >
            Show only values I can access
          </Switch>
        </div>
        <div className={styles['toolbar__toggle']}>
          <Switch
            size="Small"
            checked={showRefsInPlace}
            onChange={(e) => setShowRefsInPlace(e.target.checked)}
          >
            Show cross-references in place
          </Switch>
        </div>
      </div>

      {filtering && !noResults && (
        <p className={styles['view__filter-note']}>
          Showing matches for “{filter.trim()}” with their parent path for context.
        </p>
      )}

      {noResults ? (
        <div className={styles['empty']}>
          <Icon size="24" glyph={<MagnifyIcon />} />
          <p className={styles['empty__title']}>No values match “{filter.trim()}”</p>
          <p className={styles['empty__text']}>
            Try a different term. Values you don’t have access to are never
            searchable here.
          </p>
        </div>
      ) : (
        <div className={styles['tree']} role="tree" aria-label="Program values (read-only)">
          {renderSiblings(roots, 0)}
        </div>
      )}

      {detailNode && (
        <ReadonlyDetailPopover
          option={detailNode}
          allOptions={options}
          effectiveHidden={effectiveHidden}
          anchorRef={detailAnchor}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
