import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import GraphTreeRow from './GraphTreeRow';
import GraphValueEditorPopover from './GraphValueEditorPopover';
import {
  additionalParentsOf,
  newOptionId,
  optionMap,
  rootOptions,
  structuralDeleteBlock,
  validateAddParent,
  type GraphOption,
  type UiApproach,
} from '../graphAuthoringModel';
import styles from './GraphOptionsControl.module.scss';

type SeededState = 'cycle-rejected' | 'delete-blocked' | null;

export interface GraphOptionsControlProps {
  options: GraphOption[];
  setOptions: Dispatch<SetStateAction<GraphOption[]>>;
  editable?: boolean;
  seededState?: SeededState;
  /** Bake-off representation dimension (04c). Defaults to the 'stubs' control. */
  uiApproach?: UiApproach;
}

type Editing = {
  optionId: string;
  stubParentId: string | null;
  initialPane: 'main' | 'parents';
  seededRejection: string | null;
};

/**
 * DAG-aware Options control for RD-C. Renders the adjacency list as an indented
 * tree PROJECTION: anchor edges form the editable spine, additional edges show
 * as read-only reference stubs. Edge authoring happens in the popover's Parents
 * pane. Cross-references (an option sitting under >1 parent) are OPT-IN via an
 * "Allow cross-references" toggle — off by default for a new field so the common
 * case stays a plain single-parent tree; turning it on reveals the stub
 * projection and enables adding a second+ parent. Complexity only when needed.
 */
export default function GraphOptionsControl({
  options,
  setOptions,
  editable = true,
  seededState = null,
  uiApproach = 'stubs',
}: GraphOptionsControlProps) {
  // Cross-references (an option under >1 parent) are opt-in. Default ON only if
  // the field already contains a multi-parent node (the populated demo); a fresh
  // field starts OFF so the common single-parent case carries zero extra concept.
  const [allowCrossReferences, setAllowCrossReferences] = useState(() =>
    options.some((o) => o.parentIds.length > 1),
  );
  const [rootDraft, setRootDraft] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<string | null>(null);
  // Hybrid arm only: the single node currently peeked as stubs under its other
  // parents. A verification gesture — never required to author.
  const [peekedId, setPeekedId] = useState<string | null>(null);
  const [peekAnnounce, setPeekAnnounce] = useState('');

  const editorAnchor = useRef<HTMLElement | null>(null);
  const anchorRows = useRef<Map<string, HTMLDivElement>>(new Map());
  const highlightTimer = useRef<number | undefined>(undefined);

  const registerAnchorRow = (id: string, el: HTMLDivElement | null) => {
    if (el) anchorRows.current.set(id, el);
    else anchorRows.current.delete(id);
  };

  const jumpToAnchor = (id: string) => {
    setEditing(null);
    const el = anchorRows.current.get(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightId(id);
    window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightId(null), 1600);
  };

  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

  // Peek is a hybrid-only gesture — clear it if the representation changes.
  useEffect(() => {
    if (uiApproach !== 'hybrid') {
      setPeekedId(null);
      setPeekAnnounce('');
    }
  }, [uiApproach]);

  const togglePeek = (id: string) => {
    const opt = optionMap(options).get(id);
    const label = opt?.label ?? 'this option';
    setPeekedId((cur) => {
      if (cur === id) {
        setPeekAnnounce(`Hid ${label} under its other parents.`);
        return null;
      }
      const others = opt
        ? additionalParentsOf(options, opt).map((p) => p.label)
        : [];
      setPeekAnnounce(
        `Showing ${label} under ${others.join(', ')}; activate again to hide.`,
      );
      return id;
    });
  };

  // ── Seeded (deep-linked) demo states ─────────────────────────────────────────
  useEffect(() => {
    setDeletePrompt(null);
    if (seededState === 'delete-blocked') {
      setDeletePrompt(structuralDeleteBlock(options, 'aurora'));
      return;
    }
    if (seededState === 'cycle-rejected') {
      const rej = validateAddParent(options, 'aurora', 'sentinel');
      const raf = requestAnimationFrame(() => {
        const el = anchorRows.current.get('aurora');
        if (el) editorAnchor.current = el;
        setEditing({
          optionId: 'aurora',
          stubParentId: null,
          initialPane: 'parents',
          seededRejection: rej?.message ?? null,
        });
      });
      return () => cancelAnimationFrame(raf);
    }
    setEditing(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seededState]);

  // ── Mutations (adjacency list is the single source of truth) ─────────────────
  const openEditor = (
    option: GraphOption,
    stubParentId: string | null,
    el: HTMLElement,
  ) => {
    editorAnchor.current = el;
    setEditing({
      optionId: option.id,
      stubParentId,
      initialPane: 'main',
      seededRejection: null,
    });
  };

  const addChild = (parentId: string, label: string) => {
    setOptions((prev) => [
      ...prev,
      {
        id: newOptionId(),
        label,
        parentIds: [parentId],
        inUseCount: 0,
        policyRefCount: 0,
        source: 'manual',
      },
    ]);
  };

  const addRoot = () => {
    const label = rootDraft.trim();
    if (!label) return;
    setOptions((prev) => [
      ...prev,
      {
        id: newOptionId(),
        label,
        parentIds: [],
        inUseCount: 0,
        policyRefCount: 0,
        source: 'manual',
      },
    ]);
    setRootDraft('');
  };

  const relabel = (id: string, label: string) =>
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, label } : o)));

  const deactivate = (id: string) =>
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, disabled: !o.disabled } : o)),
    );

  const removeOption = (id: string) => {
    // VP-1: gate is STRUCTURAL only (children / stubs elsewhere).
    const block = structuralDeleteBlock(options, id);
    if (block) {
      setDeletePrompt(block);
      setEditing(null);
      return;
    }
    setOptions((prev) =>
      prev
        .filter((o) => o.id !== id)
        .map((o) => ({ ...o, parentIds: o.parentIds.filter((p) => p !== id) })),
    );
    setEditing(null);
  };

  const addParent = (childId: string, parentId: string): string | null => {
    const rejection = validateAddParent(options, childId, parentId);
    if (rejection) return rejection.message;
    setOptions((prev) =>
      prev.map((o) =>
        o.id === childId ? { ...o, parentIds: [...o.parentIds, parentId] } : o,
      ),
    );
    return null;
  };

  const removeParent = (childId: string, parentId: string) =>
    setOptions((prev) =>
      prev.map((o) =>
        o.id === childId
          ? { ...o, parentIds: o.parentIds.filter((p) => p !== parentId) }
          : o,
      ),
    );

  const makePrimary = (childId: string, parentId: string) =>
    setOptions((prev) =>
      prev.map((o) =>
        o.id === childId
          ? {
              ...o,
              parentIds: [
                parentId,
                ...o.parentIds.filter((p) => p !== parentId),
              ],
            }
          : o,
      ),
    );

  const reorder = (id: string, dir: -1 | 1) => {
    setOptions((prev) => {
      const opt = prev.find((o) => o.id === id);
      if (!opt) return prev;
      const anchor = opt.parentIds[0] ?? null;
      const sibs = prev.filter((o) => (o.parentIds[0] ?? null) === anchor);
      const si = sibs.findIndex((o) => o.id === id);
      const target = sibs[si + dir];
      if (!target) return prev;
      const next = prev.slice();
      const gi = next.findIndex((o) => o.id === id);
      const gj = next.findIndex((o) => o.id === target.id);
      [next[gi], next[gj]] = [next[gj], next[gi]];
      return next;
    });
  };

  const roots = rootOptions(options);
  const editingOption = editing ? optionMap(options).get(editing.optionId) : null;

  const crossRefExplainer =
    uiApproach === 'chips'
      ? 'A hierarchy of programs. An option can sit under more than one parent — it stays in one place, and its other parents show as chips on its row.'
      : uiApproach === 'hybrid'
        ? 'A hierarchy of programs. An option can sit under more than one parent — its other parents show as chips on its row; use “Show under other parents” on a row to preview it in place.'
        : 'A hierarchy of programs. An option can sit under more than one parent — its editable copy lives under its primary parent; everywhere else it shows as a reference you can follow back.';

  return (
    <div className={styles['options']}>
      <p className={styles['options__explainer']}>
        {allowCrossReferences
          ? crossRefExplainer
          : 'A hierarchy of programs. Each option sits under a single parent. Turn on cross-references only if an option needs to sit under more than one.'}
      </p>

      <div
        className={styles['options__sr']}
        role="status"
        aria-live="polite"
      >
        {peekAnnounce}
      </div>

      <div className={styles['options__toolbar']}>
        <Switch
          size="Small"
          checked={allowCrossReferences}
          onChange={(e) => setAllowCrossReferences(e.target.checked)}
        >
          Allow cross-references
        </Switch>
      </div>

      {deletePrompt && (
        <SectionNotice
          type="Warning"
          icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
          title="Can’t delete this option yet"
          description={deletePrompt}
          primaryButtonLabel="Got it"
          onPrimaryAction={() => setDeletePrompt(null)}
        />
      )}

      <div className={styles['options__tree']}>
        {roots.length === 0 ? (
          <p className={styles['options__empty']}>
            No options yet. Add your first top-level program below, then use
            each option’s menu to nest children and add extra parents.
          </p>
        ) : (
          roots.map((root, i) => (
            <GraphTreeRow
              key={root.id}
              option={root}
              allOptions={options}
              viaParentId={null}
              depth={0}
              index={i}
              siblingCount={roots.length}
              editable={editable}
              collapseStubs={!allowCrossReferences}
              uiApproach={uiApproach}
              peekedId={peekedId}
              highlightId={highlightId}
              registerAnchorRow={registerAnchorRow}
              onOpenEditor={openEditor}
              onReorder={reorder}
              onAddChild={addChild}
              onJumpToAnchor={jumpToAnchor}
              onDetachParent={removeParent}
              onTogglePeek={togglePeek}
            />
          ))
        )}
      </div>

      {editable && (
        <div className={styles['options__root-add']}>
          <TextInput
            size="Small"
            placeholder="Add a top-level option"
            value={rootDraft}
            onChange={(e) => setRootDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addRoot();
            }}
          />
          <Button
            emphasis="Secondary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            disabled={rootDraft.trim().length === 0}
            onClick={addRoot}
          >
            Add option
          </Button>
        </div>
      )}

      {editing && editingOption && (
        <GraphValueEditorPopover
          option={editingOption}
          allOptions={options}
          allowCrossReferences={allowCrossReferences}
          stubParentId={editing.stubParentId}
          initialPane={editing.initialPane}
          seededRejection={editing.seededRejection}
          readOnly={!editable}
          anchorRef={editorAnchor}
          onClose={() => setEditing(null)}
          onRelabel={(label) => relabel(editing.optionId, label)}
          onAddParent={(parentId) => addParent(editing.optionId, parentId)}
          onRemoveParent={(parentId) => removeParent(editing.optionId, parentId)}
          onMakePrimary={(parentId) => makePrimary(editing.optionId, parentId)}
          onJumpToAnchor={() => jumpToAnchor(editing.optionId)}
          onJumpTo={jumpToAnchor}
          onDeactivate={() => {
            deactivate(editing.optionId);
            setEditing(null);
          }}
          onRemove={() => removeOption(editing.optionId)}
        />
      )}
    </div>
  );
}
