import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  anchorParentLabel,
  childRows,
  isStubOccurrence,
  rootOptions,
  schemeOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import ReadonlyTreeRow from '@/pages/HierarchicalAttributeExternalReadonly/_components/ReadonlyTreeRow';
import treeStyles from '@/pages/HierarchicalAttributeExternalReadonly/_components/ReadonlyTreeView.module.scss';

export interface ImportedOptionsTreeProps {
  options: GraphOption[];
}

interface Occurrence {
  node: GraphOption;
  viaParentId: string | null;
  isStub: boolean;
}

/**
 * Compact, read-only "here are your options" view of a just-imported hierarchy.
 * Reuses the external read-only tree row + colored chip tags verbatim so the
 * post-import list matches what admins see in the viewer. Multi-parent values
 * render once under their anchor parent and as read-only reference stubs under
 * each additional parent — same projection model, no second source of truth.
 */
export default function ImportedOptionsTree({
  options,
}: ImportedOptionsTreeProps) {
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

  const occurrencesUnder = (parentId: string): Occurrence[] =>
    childRows(options, parentId).map((node) => ({
      node,
      viaParentId: parentId,
      isStub: isStubOccurrence(node, parentId),
    }));

  const rootOccurrences = (): Occurrence[] =>
    rootOptions(options).map((node) => ({
      node,
      viaParentId: null,
      isStub: false,
    }));

  const renderOccurrence = (occ: Occurrence, depth: number): ReactNode => {
    const { node, viaParentId, isStub } = occ;

    if (isStub) {
      return (
        <ReadonlyTreeRow
          key={`${viaParentId}:${node.id}:stub`}
          id={node.id}
          label={node.label}
          depth={depth}
          scheme={schemeOf(node.id)}
          color={node.color ?? null}
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

    return (
      <div key={`${viaParentId ?? 'root'}:${node.id}`} className={treeStyles['group']}>
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
          chips={[]}
          multiCount={node.parentIds.length > 1 ? node.parentIds.length : 0}
          registerRow={registerRow}
          onToggle={() => toggle(node.id)}
          onOpenDetail={() => {}}
          onJump={jumpTo}
        />
        {hasChildren && expanded && childOccs.map((c) => renderOccurrence(c, depth + 1))}
      </div>
    );
  };

  return (
    <div
      className={treeStyles['tree']}
      role="tree"
      aria-label="Imported options (read-only)"
    >
      {rootOccurrences().map((occ) => renderOccurrence(occ, 0))}
    </div>
  );
}
