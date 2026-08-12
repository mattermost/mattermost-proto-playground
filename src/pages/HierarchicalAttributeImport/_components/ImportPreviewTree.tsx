import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import MinusCircleOutlineIcon from '@mattermost/compass-icons/components/minus-circle-outline';
import Icon from '@/components/ui/Icon/Icon';
import {
  additionalParentsOf,
  childRows,
  isStubOccurrence,
  rootOptions,
  schemeOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import ReadonlyTreeRow, {
  type AdditionalParentChip,
} from '@/pages/HierarchicalAttributeExternalReadonly/_components/ReadonlyTreeRow';
import treeStyles from '@/pages/HierarchicalAttributeExternalReadonly/_components/ReadonlyTreeView.module.scss';
import type { DiffKind } from '../importModel';
import styles from './ImportPreviewTree.module.scss';

export interface ImportPreviewTreeProps {
  /** The result graph that would commit (unchanged + added + changed nodes). */
  options: GraphOption[];
  /** Per-node diff status. Empty for a first import (no badges). */
  nodeStatus?: Map<string, DiffKind>;
  /** Nodes present in the live graph but gone in the result — rendered as ghosts. */
  removedNodes?: GraphOption[];
  ariaLabel: string;
}

/**
 * The PREVIEW surface for Direction B: the parsed graph rendered into the SAME
 * read-only `role="tree"` the values will live in, so the reviewer verifies the
 * DAG *shape* (not a flat list). It reuses the shared `ReadonlyTreeRow` and the
 * anchor/stub projection model verbatim; the ONLY additions are (1) the optional
 * added/changed diff badge (a default-off prop on the shared row) and (2) a
 * clearly-labelled "Removed" ghost group, since removed nodes are — by
 * definition — absent from the result graph. The companion lineage-table diff
 * remains the screen-reader-primary, complete record.
 *
 * No masking/filter here: the importing admin (a Security Administrator) reviews
 * the FULL shape they are about to commit. Viewer-scoped masking (T1 / AC-16(5))
 * is applied later by the read-only external view the result lands in.
 */
export default function ImportPreviewTree({
  options,
  nodeStatus,
  removedNodes = [],
  ariaLabel,
}: ImportPreviewTreeProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const rowEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const highlightTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

  const registerRow = (id: string, el: HTMLDivElement | null) => {
    if (el) rowEls.current.set(id, el);
    else rowEls.current.delete(id);
  };
  const isExpanded = (id: string) => !collapsed.has(id);
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const jumpTo = (id: string) => {
    const el = rowEls.current.get(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightId(id);
    window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightId(null), 1600);
  };

  // Anchor-occurrence children under `parentId` (stubs collapse into chips).
  const anchorChildrenUnder = (parentId: string): GraphOption[] =>
    childRows(options, parentId).filter(
      (node) => !isStubOccurrence(node, parentId),
    );

  const renderNode = (node: GraphOption, depth: number): ReactNode => {
    const kids = anchorChildrenUnder(node.id);
    const hasChildren = kids.length > 0;
    const expanded = isExpanded(node.id);

    let chips: AdditionalParentChip[] = [];
    if (node.parentIds.length > 1) {
      chips = additionalParentsOf(options, node).map((p) => ({
        id: p.id,
        label: p.label,
        restricted: false,
      }));
    }

    return (
      <div key={`${node.id}@${depth}`} className={treeStyles['group']}>
        <ReadonlyTreeRow
          id={node.id}
          label={node.label}
          depth={depth}
          scheme={schemeOf(node.id)}
          color={node.color ?? null}
          isStub={false}
          disabled={node.disabled}
          matched={false}
          highlighted={highlightId === node.id}
          hasChildren={hasChildren}
          expanded={expanded}
          chips={chips}
          multiCount={0}
          diffKind={nodeStatus?.get(node.id)}
          registerRow={registerRow}
          onToggle={() => toggle(node.id)}
          onOpenDetail={() => {}}
          onJump={jumpTo}
        />
        {hasChildren && expanded && kids.map((k) => renderNode(k, depth + 1))}
      </div>
    );
  };

  const roots = rootOptions(options);

  return (
    <div className={styles['preview']}>
      <div
        className={treeStyles['tree']}
        role="tree"
        aria-label={ariaLabel}
      >
        {roots.map((r) => renderNode(r, 0))}
      </div>

      {removedNodes.length > 0 && (
        <div className={styles['removed']}>
          <p className={styles['removed__title']}>
            Removed from the graph ({removedNodes.length})
          </p>
          <div
            className={treeStyles['tree']}
            role="tree"
            aria-label="Values removed by this import"
          >
            {removedNodes.map((node) => (
              <div
                key={`removed-${node.id}`}
                className={[
                  treeStyles['row'],
                  treeStyles['row--diff-removed'],
                  styles['removed__row'],
                ].join(' ')}
                role="treeitem"
                tabIndex={-1}
                aria-level={1}
                aria-selected={false}
                aria-label={`${node.label} — Removed`}
              >
                <span className={treeStyles['row__gutter']}>
                  <span className={styles['removed__glyph']} aria-hidden>
                    <Icon size="16" glyph={<MinusCircleOutlineIcon />} />
                  </span>
                </span>
                <span className={styles['removed__label']}>{node.label}</span>
                <span
                  className={[
                    treeStyles['row__diff'],
                    treeStyles['row__diff--removed'],
                  ].join(' ')}
                >
                  Removed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
