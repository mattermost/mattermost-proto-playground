import { useEffect, useRef, useState } from 'react';
import type { DragEvent, Dispatch, SetStateAction } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import RefinedTreeRow from './RefinedTreeRow';
import RefinedValueEditorPopover from './RefinedValueEditorPopover';
import {
  labelOf,
  newOptionId,
  optionMap,
  reorderChildAmongSiblings,
  rootOptions,
  structuralDeleteBlock,
  validateAddParent,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import styles from './RefinedOptionsControl.module.scss';

type SeededState = 'cycle-rejected' | 'delete-blocked' | null;

export interface RefinedOptionsControlProps {
  options: GraphOption[];
  setOptions: Dispatch<SetStateAction<GraphOption[]>>;
  editable?: boolean;
  seededState?: SeededState;
  /** First sentence of the explainer. Defaults to the Programs wording. */
  explainerLead?: string;
}

type Editing = {
  optionId: string;
  initialPane: 'main' | 'parents';
  seededRejection: string | null;
};

/**
 * Refined DAG-aware Options control (forked from the hybrid GraphOptionsControl).
 *
 * Two changes drive the whole surface:
 *  1. Cross-reference viewing toggles live in an "Options" popover (cog trigger)
 *     — "Allow cross-references" (progressive disclosure of multi-parent
 *     authoring) and a global "Show cross-references in place" toggle that
 *     replaces the hybrid's per-node peek: on = every multi-parent node
 *     materializes its read-only stubs in place; off = the extra parents ride as
 *     chips on the node's own row.
 *  2. Re-parenting by dragging an anchor row's left grip onto another row (or
 *     the root drop zone), cycle-safe and fail-closed, with a keyboard-operable
 *     "Move under…" equivalent living in the popover Parents pane.
 *  3. Reordering reference stubs (and their siblings) under the same parent by
 *     dragging a stub's grip onto another child of that parent — parent edges
 *     stay put; only sibling order in the adjacency list changes.
 */
export default function RefinedOptionsControl({
  options,
  setOptions,
  editable = true,
  seededState = null,
  explainerLead = 'A hierarchy of programs.',
}: RefinedOptionsControlProps) {
  const [allowCrossReferences, setAllowCrossReferences] = useState(() =>
    options.some((o) => o.parentIds.length > 1),
  );
  // Resting state is chips (off); the global in-place stubs are opt-in.
  const [showRefsInPlace, setShowRefsInPlace] = useState(false);
  const [rootDraft, setRootDraft] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  /** Parent the drag started under; set for stub reorders, null for reparent. */
  const [draggingViaParentId, setDraggingViaParentId] = useState<string | null>(
    null,
  );
  const [draggingIsStub, setDraggingIsStub] = useState(false);
  const [rootDropOver, setRootDropOver] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [optionsOpen, setOptionsOpen] = useState(false);

  const editorAnchor = useRef<HTMLElement | null>(null);
  const optionsTriggerRef = useRef<HTMLDivElement>(null);
  const anchorRows = useRef<Map<string, HTMLDivElement>>(new Map());
  const highlightTimer = useRef<number | undefined>(undefined);

  // "Show in place" only makes sense when cross-references are allowed; keep the
  // two toggles honest by folding the dependent one back down when the gate closes.
  useEffect(() => {
    if (!allowCrossReferences && showRefsInPlace) setShowRefsInPlace(false);
  }, [allowCrossReferences, showRefsInPlace]);

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
    highlightTimer.current = window.setTimeout(
      () => setHighlightId(null),
      1600,
    );
  };

  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

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
    initialPane: 'main' | 'parents',
    el: HTMLElement,
  ) => {
    editorAnchor.current = el;
    setEditing({ optionId: option.id, initialPane, seededRejection: null });
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

  // Set (or clear) an option's display color. Lives on the option in the SAME
  // React state the tree renders from, so a swatch/custom pick repaints the row
  // chip + color dot immediately (no side-table that the tree can't see).
  const setColor = (id: string, color: string | null) =>
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, color: color ?? undefined } : o)),
    );

  /**
   * Create a brand-new option and link it to `currentId` in one action.
   *  - 'child'  → the new option is nested under the current one.
   *  - 'parent' → a new top-level option is created and the current one nests
   *    under it (its first-declared parent stays the anchor).
   */
  const createLinked = (
    currentId: string,
    label: string,
    as: 'parent' | 'child',
  ) => {
    const id = newOptionId();
    if (as === 'child') {
      addChild(currentId, label);
      return;
    }
    setOptions((prev) => [
      ...prev.map((o) =>
        o.id === currentId ? { ...o, parentIds: [...o.parentIds, id] } : o,
      ),
      {
        id,
        label,
        parentIds: [],
        inUseCount: 0,
        policyRefCount: 0,
        source: 'manual',
      },
    ]);
  };

  /**
   * Re-parent (move): replace the primary parent with `targetId`, KEEPING any
   * additional (cross-reference) parents. `null` = move to the top level. Drag
   * and the popover "Move under…" both route here. Cycle-safe: fail-closed on a
   * commit-time re-check even though the picker/drop targets already exclude
   * descendants (800-207 Tenet 5).
   */
  const reparent = (
    childId: string,
    targetId: string | null,
  ): string | null => {
    const label = labelOf(options, childId);
    if (targetId === null) {
      setOptions((prev) =>
        prev.map((o) => (o.id === childId ? { ...o, parentIds: [] } : o)),
      );
      setAnnounce(`Moved ${label} to the top level.`);
      return null;
    }
    const child = optionMap(options).get(childId);
    const alreadyParent = child?.parentIds.includes(targetId) ?? false;
    if (!alreadyParent) {
      const rejection = validateAddParent(options, childId, targetId);
      if (rejection) {
        setAnnounce(rejection.message);
        return rejection.message;
      }
    }
    setOptions((prev) =>
      prev.map((o) => {
        if (o.id !== childId) return o;
        const others = o.parentIds.slice(1).filter((p) => p !== targetId);
        return { ...o, parentIds: [targetId, ...others] };
      }),
    );
    setAnnounce(`Moved ${label} under ${labelOf(options, targetId)}.`);
    return null;
  };

  // ── Drag lifecycle ───────────────────────────────────────────────────────────
  const clearDrag = () => {
    setDraggingId(null);
    setDraggingViaParentId(null);
    setDraggingIsStub(false);
    setRootDropOver(false);
  };

  const onDragStartRow = (
    id: string,
    viaParentId: string | null,
    isStub: boolean,
  ) => {
    setDraggingId(id);
    setDraggingViaParentId(viaParentId);
    setDraggingIsStub(isStub);
  };

  const onDropOnRow = (targetId: string, targetViaParentId: string | null) => {
    if (!draggingId) {
      clearDrag();
      return;
    }

    // Stub grip = reorder among siblings under the same parent only.
    if (draggingIsStub && draggingViaParentId != null) {
      if (
        targetId !== draggingId &&
        targetViaParentId === draggingViaParentId
      ) {
        setOptions((prev) =>
          reorderChildAmongSiblings(
            prev,
            draggingViaParentId,
            draggingId,
            targetId,
          ),
        );
        setAnnounce(
          `Reordered ${labelOf(options, draggingId)} under ${labelOf(
            options,
            draggingViaParentId,
          )}.`,
        );
      }
      clearDrag();
      return;
    }

    // Anchor grip = reparent (existing behavior).
    reparent(draggingId, targetId);
    clearDrag();
  };

  const onRootDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingId && !draggingIsStub) reparent(draggingId, null);
    clearDrag();
  };

  const roots = rootOptions(options);
  const editingOption = editing
    ? optionMap(options).get(editing.optionId)
    : null;

  return (
    <div className={styles['options']}>
      <div className={styles['options__header']}>
        <p className={styles['options__explainer']}>
          {explainerLead} Drag a row by its grip to move it; drag a reference
          row to reorder it among siblings under the same parent. An option can
          sit under more than one parent when cross-references are on.
        </p>
        <div
          ref={optionsTriggerRef}
          className={styles['options__options-trigger']}
        >
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<CogOutlineIcon />} />}
            aria-haspopup="dialog"
            aria-expanded={optionsOpen}
            onClick={() => setOptionsOpen((current) => !current)}
          >
            Options
          </Button>
          <FixedPopoverMenu
            open={optionsOpen}
            onClose={() => setOptionsOpen(false)}
            anchorRef={optionsTriggerRef}
            align="end"
            minWidthFloor={300}
          >
            <PopoverMenu aria-label="Hierarchy options">
              <div className={styles['options__popover-body']}>
                <Switch
                  size="Small"
                  checked={allowCrossReferences}
                  onChange={(e) => setAllowCrossReferences(e.target.checked)}
                >
                  Allow cross-references
                </Switch>
                <Switch
                  size="Small"
                  checked={showRefsInPlace}
                  disabled={!allowCrossReferences}
                  onChange={(e) => setShowRefsInPlace(e.target.checked)}
                >
                  Show cross-references in place
                </Switch>
              </div>
            </PopoverMenu>
          </FixedPopoverMenu>
        </div>
      </div>

      <div className={styles['options__sr']} role="status" aria-live="polite">
        {announce}
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

      <div
        className={styles['options__tree']}
        role="tree"
        aria-label="Program options hierarchy"
      >
        {roots.length === 0 ? (
          <p className={styles['options__empty']}>
            No options yet. Add your first top-level program below, then use
            each option’s actions to nest children and add extra parents.
          </p>
        ) : (
          roots.map((root) => (
            <RefinedTreeRow
              key={root.id}
              option={root}
              allOptions={options}
              viaParentId={null}
              depth={0}
              editable={editable}
              showRefsInPlace={showRefsInPlace}
              allowCrossReferences={allowCrossReferences}
              highlightId={highlightId}
              draggingId={draggingId}
              draggingViaParentId={draggingViaParentId}
              draggingIsStub={draggingIsStub}
              registerAnchorRow={registerAnchorRow}
              onOpenEditor={openEditor}
              onAddChild={addChild}
              onDelete={removeOption}
              onJumpToAnchor={jumpToAnchor}
              onDetachParent={removeParent}
              onDragStartRow={onDragStartRow}
              onDragEndRow={clearDrag}
              onDropOnRow={onDropOnRow}
            />
          ))
        )}
      </div>

      {editable && draggingId && !draggingIsStub && (
        <div
          className={[
            styles['options__root-zone'],
            rootDropOver && styles['options__root-zone--over'],
          ]
            .filter(Boolean)
            .join(' ')}
          onDragOver={(e) => {
            e.preventDefault();
            if (!rootDropOver) setRootDropOver(true);
          }}
          onDragLeave={() => setRootDropOver(false)}
          onDrop={onRootDrop}
        >
          <Icon size="16" glyph={<ArrowUpIcon />} />
          Drop here to make it a top-level option
        </div>
      )}

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
        <RefinedValueEditorPopover
          option={editingOption}
          allOptions={options}
          allowCrossReferences={allowCrossReferences}
          initialPane={editing.initialPane}
          seededRejection={editing.seededRejection}
          readOnly={!editable}
          anchorRef={editorAnchor}
          onClose={() => setEditing(null)}
          onRelabel={(label) => relabel(editing.optionId, label)}
          onAddParent={(parentId) => addParent(editing.optionId, parentId)}
          onRemoveParent={(parentId) =>
            removeParent(editing.optionId, parentId)
          }
          onMakePrimary={(parentId) => makePrimary(editing.optionId, parentId)}
          onReparent={(targetId) => reparent(editing.optionId, targetId)}
          onAddChild={(childId) => addParent(childId, editing.optionId)}
          onRemoveChild={(childId) => removeParent(childId, editing.optionId)}
          onCreateLinked={(label, as) =>
            createLinked(editing.optionId, label, as)
          }
          onSetColor={(color) => setColor(editing.optionId, color)}
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
