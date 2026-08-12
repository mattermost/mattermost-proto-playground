import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type RefObject,
  type SetStateAction,
} from 'react';
import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Radio from '@/components/ui/Radio/Radio';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import BoundedPopover from './BoundedPopover';
import DeleteValueDialog from './DeleteValueDialog';
import GrantConfirmDialog from './GrantConfirmDialog';
import RemoveEdgeDialog from './RemoveEdgeDialog';
import ValueEditorPopover from './ValueEditorPopover';
import ValueTreeRow, { OrderGap, type DragSource } from './ValueTreeRow';
import {
  DEPTH_LIMIT,
  PARENT_LIMIT,
  applyMove,
  chainSentence,
  formatList,
  grantSentence,
  isSingleChain,
  labelOf,
  movePlan,
  positionRuleCaution,
  reorderPlan,
  rootValues,
  siblingsOf,
  valueById,
  withLabel,
  withNewValue,
  withParentAdded,
  withParentRemoved,
  withValueRemoved,
  type HierValue,
  type ValueRanking,
} from '../v3GraphModel';
import styles from './ValuesPanel.module.scss';

export type SeededValueState =
  | 'cycle-rejected'
  | 'delete-blocked'
  | 'delete-safe'
  | 'grant-confirm'
  | null;

/** Full reachability lives in its own prototype; this panel links out to it. */
const ACCESS_VIEW_URL = `${import.meta.env.BASE_URL}prototypes/hierarchical-attribute-access-view`;

export interface ValuesPanelProps {
  values: HierValue[];
  setValues: Dispatch<SetStateAction<HierValue[]>>;
  /** The page's scroll region — popovers stay inside it. */
  boundaryRef: RefObject<HTMLElement | null>;
  seededState?: SeededValueState;
  /** Attribute-level ranking setting, from `?ranking=`. */
  initialRanking?: ValueRanking;
  /** Chain notice CTA. Never a conversion — there is no such operation. */
  onStartRankedAttribute: () => void;
}

interface Editing {
  valueId: string;
  pane: 'main' | 'parents' | 'children';
  seededRejection: string | null;
}

/**
 * The value list — the region every fix lands in.
 *
 * The one setting here is an AUTHORING gate, not a display gate (F1): it governs
 * whether a new second parent may be created, and it says so. Nothing in this
 * component can hide an existing relationship.
 *
 * ORDER IS PER EDGE, AND EVERY LIST IS ORDERED BY HAND. A value holds an
 * independent position under each of its parents, so "JTF Sentinel" can be 1st
 * under Deepwater Patrol and 2nd under Operation Aurora at the same time. There is
 * no order mode to pick: an alphabetical order would be derived from the label,
 * and since a policy rule can compare position, a rename would then quietly change
 * who passes that rule. Alphabetical survives as a one-shot action that writes real
 * positions the author can then adjust.
 *
 * Reordering never needs a confirm — no edge is created or destroyed, so it cannot
 * be refused and cannot widen what anyone reaches. It is not silent either: a
 * policy rule can compare position, so a reorder is announced as a real outcome,
 * and where a rule references the value the panel names how many rules may now
 * read differently. Blocking every drag behind a modal would make ordering
 * unusable in the common case, where nothing compares position at all.
 *
 * DRAGGING A ROW ACTS ON THE EDGE THAT ROW REPRESENTS. Dropping on a row's body
 * retargets the edge onto that value, at the end of its list. Dropping in the gap
 * between two rows sets a position: inside the same parent that is a pure reorder,
 * from a different parent it is a move that lands at that index. A drag still
 * never mints a second parent — that stays an explicit act in the Parents pane,
 * behind a grant confirm, and it lands at the end of the new parent's list.
 */
export default function ValuesPanel({
  values,
  setValues,
  boundaryRef,
  seededState = null,
  initialRanking = 'ranked',
  onStartRankedAttribute,
}: ValuesPanelProps) {
  const hasMultiParent = values.some((v) => v.parentIds.length > 1);
  const [allowMultiParent, setAllowMultiParent] = useState(hasMultiParent);
  const [ranking, setRanking] = useState<ValueRanking>(initialRanking);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [pendingEdge, setPendingEdge] = useState<{
    childId: string;
    parentId: string;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingEdgeRemoval, setPendingEdgeRemoval] = useState<{
    childId: string;
    parentId: string;
  } | null>(null);
  /** The last position change's effect on comparative policy rules, if any. */
  const [orderCaution, setOrderCaution] = useState<string | null>(null);
  const [chainDismissed, setChainDismissed] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragSource | null>(null);
  const [rootDropOver, setRootDropOver] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [draft, setDraft] = useState('');

  const settingsTriggerRef = useRef<HTMLDivElement>(null);
  const editorAnchorRef = useRef<HTMLElement | null>(null);
  const rowEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const highlightTimer = useRef<number | undefined>(undefined);

  const registerRow = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) rowEls.current.set(id, el);
    else rowEls.current.delete(id);
  }, []);

  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

  /**
   * Scrolls the page region (never the document) so a row is in view. Deliberately
   * not `scrollIntoView`: inside an embedded iframe that also scrolls the host
   * page, which yanks the surrounding deck out of view.
   */
  const scrollRowIntoView = useCallback(
    (id: string, behavior: ScrollBehavior = 'smooth') => {
      const el = rowEls.current.get(id);
      const scroller = el?.closest<HTMLElement>('.simplebar-content-wrapper');
      if (!el || !scroller) return;
      const offset =
        el.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;
      scroller.scrollTo({ top: Math.max(0, offset - 96), behavior });
    },
    [],
  );

  const jumpTo = useCallback(
    (id: string) => {
      setEditing(null);
      scrollRowIntoView(id);
      setHighlightId(id);
      window.clearTimeout(highlightTimer.current);
      highlightTimer.current = window.setTimeout(
        () => setHighlightId(null),
        1800,
      );
    },
    [scrollRowIntoView],
  );

  // ── Deep-linked demo states ────────────────────────────────────────────────
  useEffect(() => {
    setPendingDelete(null);
    setPendingEdge(null);
    setEditing(null);
    if (seededState === 'delete-blocked') {
      setPendingDelete('aurora');
      return;
    }
    if (seededState === 'delete-safe') {
      setPendingDelete('raptor');
      return;
    }
    if (seededState === 'grant-confirm') {
      setPendingEdge({ childId: 'raptor', parentId: 'aurora' });
      return;
    }
    if (seededState === 'cycle-rejected') {
      // Bring the row into view first, instantly: the editor panel is bounded by
      // the scroll region, so opening it against an off-screen anchor would just
      // dismiss it.
      const raf = requestAnimationFrame(() => {
        scrollRowIntoView('aurora', 'auto');
        const el = rowEls.current.get('aurora');
        if (el) editorAnchorRef.current = el;
        setEditing({
          valueId: 'aurora',
          pane: 'parents',
          // JTF Sentinel already sits under Operation Aurora, so making it a
          // parent of Aurora would close a loop.
          seededRejection:
            'JTF Sentinel can’t be a parent of Operation Aurora — Operation Aurora already grants JTF Sentinel, so this would loop back on itself.',
        });
      });
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [seededState, scrollRowIntoView]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const openEditor = (
    value: HierValue,
    pane: 'main' | 'parents' | 'children',
    el: HTMLElement,
  ) => {
    editorAnchorRef.current = el;
    setEditing({ valueId: value.id, pane, seededRejection: null });
  };

  const addTopLevel = () => {
    const label = draft.trim();
    if (!label) return;
    setValues((prev) => withNewValue(prev, label, []));
    setAnnounce(
      `Added ${label} at the end of the top level. Nothing grants it yet.`,
    );
    setDraft('');
  };

  const addChild = (parentId: string, label: string) => {
    setValues((prev) => withNewValue(prev, label, [parentId]));
    setAnnounce(
      `${grantSentence(labelOf(values, parentId), label)} It is last in that list.`,
    );
  };

  const commitEdge = () => {
    if (!pendingEdge) return;
    const { childId, parentId } = pendingEdge;
    setValues((prev) => withParentAdded(prev, childId, parentId));
    setAnnounce(
      `${grantSentence(
        labelOf(values, parentId),
        labelOf(values, childId),
      )} It is last in that list — drag it or use Move up to change where it sits.`,
    );
    setPendingEdge(null);
  };

  const removeParent = (childId: string, parentId: string) => {
    setValues((prev) => withParentRemoved(prev, childId, parentId));
    setAnnounce(
      `Anyone holding “${labelOf(values, parentId)}” no longer reaches “${labelOf(values, childId)}”.`,
    );
  };

  const commitDelete = () => {
    if (!pendingDelete) return;
    const label = labelOf(values, pendingDelete);
    setValues((prev) => withValueRemoved(prev, pendingDelete));
    setAnnounce(`Deleted ${label} and every grant that went through it.`);
    setPendingDelete(null);
    setEditing(null);
  };

  /**
   * The single commit path for every move — drag onto a row, drop into a gap under
   * a different parent, the root zone, and the popover's keyboard "Move under…".
   * `fromParentId` is the parent of the dragged OCCURRENCE, so the plan retargets
   * that one edge and leaves the value's other parents alone. `insertIndex` is set
   * only when the drop named a position; otherwise the edge lands at the end.
   *
   * The plan is recomputed against the latest state inside the updater, so a
   * target that was legal when it was offered is still refused if the graph moved
   * underneath it (fail closed).
   */
  const commitMove = (
    childId: string,
    fromParentId: string | null,
    targetId: string | null,
    insertIndex: number | null = null,
  ) => {
    const plan = movePlan(values, childId, fromParentId, targetId, insertIndex);
    setAnnounce(plan.announcement);
    if (plan.rejection || plan.noop) return;
    setOrderCaution(plan.ruleCaution);
    setValues((prev) =>
      applyMove(
        prev,
        movePlan(prev, childId, fromParentId, targetId, insertIndex),
      ),
    );
    setEditing(null);
  };

  /**
   * A position change inside one parent. No edge moves, so there is nothing to
   * validate and nothing to confirm — but a rule comparing position can read the
   * result differently, and the plan says so.
   */
  const commitReorder = (
    childId: string,
    parentId: string | null,
    toIndex: number,
  ) => {
    const plan = reorderPlan(values, childId, parentId, toIndex);
    setAnnounce(plan.announcement);
    if (plan.noop) return;
    setOrderCaution(plan.ruleCaution);
    setValues((prev) =>
      reorderPlan(prev, childId, parentId, toIndex).apply(prev),
    );
  };

  /** Drop on a row's body: retarget the dragged edge onto that value, at the end. */
  const dropOnRow = (targetId: string) => {
    const source = dragging;
    setDragging(null);
    setRootDropOver(false);
    if (!source) return;
    commitMove(source.id, source.fromParentId, targetId);
  };

  /**
   * Drop in the gap between two rows. Two readings, decided by where the dragged
   * occurrence came from:
   *  - same parent → a pure reorder, no grant added or removed;
   *  - a different parent → a move that lands at that position, which is a real
   *    access change and goes down the same path as any other move.
   */
  const dropInGap = (parentId: string | null, beforeId: string | null) => {
    const source = dragging;
    setDragging(null);
    setRootDropOver(false);
    if (!source) return;

    const full = siblingsOf(values, parentId).map((v) => v.id);
    const anchor = beforeId == null ? full.length : full.indexOf(beforeId);
    const selfAt = full.indexOf(source.id);
    // `anchor` indexes the list WITH the dragged occurrence in it; the plans index
    // the list without it, so step back one when the occurrence sits above the gap.
    const toIndex = anchor - (selfAt >= 0 && selfAt < anchor ? 1 : 0);

    if (source.fromParentId === parentId) {
      commitReorder(source.id, parentId, toIndex);
      return;
    }
    commitMove(source.id, source.fromParentId, parentId, toIndex);
  };

  /** Keyboard parity for the gap drop: one step up or down, same commit path. */
  const nudge = (childId: string, parentId: string | null, delta: -1 | 1) => {
    const at = siblingsOf(values, parentId).findIndex((v) => v.id === childId);
    if (at < 0) return;
    commitReorder(childId, parentId, at + delta);
  };

  /**
   * Flipping the ranking setting writes nothing: ordinals already exist on every
   * edge, so this only governs whether they are shown and editable. No access
   * changes, so there is nothing to confirm — it is announced and that is all.
   */
  const changeRanking = (next: ValueRanking) => {
    if (next === ranking) return;
    setRanking(next);
    setOrderCaution(null);
    setSettingsOpen(false);
    setAnnounce(
      next === 'ranked'
        ? 'Values are now numbered under each parent. Access did not change.'
        : 'Values are no longer numbered. Access did not change.',
    );
  };

  const dragged = dragging ? valueById(values, dragging.id) : null;
  /**
   * Dragging a row out to the top level has two readings, and which one applies
   * is decided by the row, not by the value:
   *  - the value's only parent → it really is a move to the top level;
   *  - one of several parents → it is the removal of THAT ONE grant, leaving the
   *    others intact, which confirms before it commits.
   */
  const rootDropKind: 'move' | 'remove-edge' | 'blocked' =
    dragged == null
      ? 'blocked'
      : dragged.parentIds.length === 1
        ? 'move'
        : dragged.parentIds.length > 1 && dragging?.fromParentId != null
          ? 'remove-edge'
          : 'blocked';

  const onRootDrop = (e: DragEvent<HTMLDivElement>) => {
    if (rootDropKind === 'blocked' || !dragging) return;
    e.preventDefault();
    setRootDropOver(false);
    if (rootDropKind === 'move') {
      commitMove(dragging.id, dragging.fromParentId, null);
    } else if (dragging.fromParentId != null) {
      setPendingEdgeRemoval({
        childId: dragging.id,
        parentId: dragging.fromParentId,
      });
    }
    setDragging(null);
  };

  const commitEdgeRemoval = (announcement: string) => {
    if (!pendingEdgeRemoval) return;
    const { childId, parentId } = pendingEdgeRemoval;
    const caution =
      ranking === 'ranked' ? positionRuleCaution(values, childId) : null;
    setValues((prev) => withParentRemoved(prev, childId, parentId));
    setOrderCaution(caution);
    setAnnounce(caution ? `${announcement} ${caution}` : announcement);
    setPendingEdgeRemoval(null);
  };

  const editingValue = editing ? valueById(values, editing.valueId) : null;
  const roots = rootValues(values);
  const chainNoticeVisible = !chainDismissed && isSingleChain(values);
  const chainLine = chainSentence(values);
  const legacyMultiParent = !allowMultiParent && hasMultiParent;
  const multiParentValues = values.filter((v) => v.parentIds.length > 1);
  // Gaps place a value in a list, so they only exist where order is shown.
  const gapsVisible = ranking === 'ranked' && dragging != null;

  return (
    <div className={styles['values']}>
      <div className={styles['values__header']}>
        <div className={styles['values__header-text']}>
          <p className={styles['values__explainer']}>
            Each value can have parents and children according to the
            configuration below. Per-level ranking can be turned on in list
            settings to order values under each parent.
          </p>
          <a
            className={styles['values__access-link']}
            href={ACCESS_VIEW_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Icon size="12" glyph={<OpenInNewIcon />} />
            See everything a value reaches
          </a>
        </div>
        <div
          ref={settingsTriggerRef}
          className={styles['values__settings-trigger']}
        >
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<CogOutlineIcon />} />}
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((v) => !v)}
          >
            List settings
          </Button>
          <BoundedPopover
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            anchorRef={settingsTriggerRef}
            boundaryRef={boundaryRef}
            label="Value list settings"
            align="end"
            width={340}
            maxHeight={360}
          >
            <div className={styles['values__settings-body']}>
              <p className={styles['values__settings-title']}>Value ranking</p>
              <div
                className={styles['values__relation-options']}
                role="radiogroup"
                aria-label="Value ranking"
              >
                <div className={styles['values__relation-option']}>
                  <Radio
                    name="ranking"
                    checked={ranking === 'unranked'}
                    onChange={() => changeRanking('unranked')}
                  >
                    <span className={styles['values__relation-label']}>
                      Unranked
                    </span>
                  </Radio>
                  <p className={styles['values__relation-help']}>
                    Order carries no meaning.
                  </p>
                </div>
                <div className={styles['values__relation-option']}>
                  <Radio
                    name="ranking"
                    checked={ranking === 'ranked'}
                    onChange={() => changeRanking('ranked')}
                  >
                    <span className={styles['values__relation-label']}>
                      Ranked
                    </span>
                  </Radio>
                  <p className={styles['values__relation-help']}>
                    Values are numbered under each parent. Policy rules can
                    compare positions.
                  </p>
                </div>
              </div>
              <p className={styles['values__settings-title']}>Authoring</p>
              <Switch
                size="Small"
                checked={allowMultiParent}
                secondaryLabel="Existing ones are always shown. This only controls adding new ones."
                onChange={(e) => setAllowMultiParent(e.target.checked)}
              >
                Let a value sit under more than one parent
              </Switch>
            </div>
          </BoundedPopover>
        </div>
      </div>

      {legacyMultiParent && (
        <div className={styles['values__note']}>
          <span className={styles['values__note-icon']} aria-hidden>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          <span>
            {multiParentValues.length === 1
              ? `“${multiParentValues[0].label}” already sits under more than one parent.`
              : `${formatList(
                  multiParentValues.map((v) => `“${v.label}”`),
                  3,
                )} already sit under more than one parent.`}{' '}
            Those relationships stay exactly where they are and stay visible —
            the setting above only stops new ones being added.
          </span>
        </div>
      )}

      {/* Inline and dismissible, never a modal: most attributes have no rule that
          compares position, and blocking every drag behind a confirm would make
          ordering unusable to buy a warning almost nobody needs. */}
      {orderCaution && (
        <div className={styles['values__note']}>
          <span className={styles['values__note-icon']} aria-hidden>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          <span>
            {orderCaution} No grant was added or removed — check the rules if
            you rely on comparing positions.
          </span>
          <Button
            className={styles['values__note-action']}
            emphasis="Tertiary"
            size="Small"
            onClick={() => setOrderCaution(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {chainNoticeVisible && chainLine && (
        <SectionNotice
          type="Info"
          title="Every value in this attribute is on one chain"
          description={
            <>
              {chainLine} Nothing branches anywhere, so every value here sits
              above or below every other one. That is about the links, not the
              order values are listed in. If one chain is what you meant for all
              of it, a Ranked attribute states it directly — but there is no
              conversion between the two types: you would create a new Ranked
              attribute and re-assign every user and channel. If the chain is
              right as it stands, leave it here.
            </>
          }
          secondaryButtonLabel="Start a new Ranked attribute"
          onSecondaryAction={onStartRankedAttribute}
          onDismiss={() => setChainDismissed(true)}
        />
      )}

      <div className={styles['values__sr']} role="status" aria-live="polite">
        {announce}
      </div>

      <div
        className={styles['values__tree']}
        role="tree"
        aria-label="Value hierarchy"
      >
        {roots.length === 0 && (
          <p className={styles['values__empty']}>
            No values yet. Add your first top-level value below, then use a
            row’s actions to say what it grants.
          </p>
        )}
        {roots.map((root) => (
          <Fragment key={root.id}>
            {gapsVisible && (
              <OrderGap
                parentId={null}
                beforeId={root.id}
                depth={0}
                onDropInGap={dropInGap}
              />
            )}
            <ValueTreeRow
              value={root}
              values={values}
              ranked={ranking === 'ranked'}
              viaParentId={null}
              depth={0}
              highlightId={highlightId}
              dragging={dragging}
              registerRow={registerRow}
              onOpenEditor={openEditor}
              onAddChild={addChild}
              onRequestDelete={setPendingDelete}
              onDragStartRow={setDragging}
              onDragEndRow={() => {
                setDragging(null);
                setRootDropOver(false);
              }}
              onDropOnRow={dropOnRow}
              onDropInGap={dropInGap}
              onNudge={nudge}
            />
          </Fragment>
        ))}
        {gapsVisible && roots.length > 0 && (
          <OrderGap
            parentId={null}
            beforeId={null}
            depth={0}
            onDropInGap={dropInGap}
          />
        )}
      </div>

      {dragged && (
        <div
          className={[
            styles['values__root-zone'],
            rootDropKind === 'blocked'
              ? styles['values__root-zone--blocked']
              : '',
            rootDropOver ? styles['values__root-zone--over'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onDragOver={(e) => {
            if (rootDropKind === 'blocked') return;
            e.preventDefault();
            if (!rootDropOver) setRootDropOver(true);
          }}
          onDragLeave={() => setRootDropOver(false)}
          onDrop={onRootDrop}
        >
          <Icon size="16" glyph={<ArrowUpIcon />} />
          {rootDropKind === 'move'
            ? 'Drop here to move it to the top level — nothing will grant it'
            : rootDropKind === 'remove-edge'
              ? `Drop here to stop “${labelOf(values, dragging?.fromParentId ?? '')}” granting it — its other ${dragged.parentIds.length - 1 === 1 ? 'parent stays' : 'parents stay'} as ${dragged.parentIds.length - 1 === 1 ? 'it is' : 'they are'}`
              : `“${dragged.label}” is already at the top level`}
        </div>
      )}

      <div className={styles['values__add']}>
        <TextInput
          size="Small"
          placeholder="Add a top-level value"
          aria-label="Add a top-level value"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTopLevel();
          }}
        />
        <Button
          emphasis="Secondary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          disabled={draft.trim().length === 0}
          onClick={addTopLevel}
        >
          Add value
        </Button>
      </div>

      <p className={styles['values__limits']}>
        Up to {PARENT_LIMIT} parents per value, {DEPTH_LIMIT} levels deep.
      </p>

      {editing && editingValue && (
        <ValueEditorPopover
          value={editingValue}
          values={values}
          allowMultiParent={allowMultiParent}
          initialPane={editing.pane}
          seededRejection={editing.seededRejection}
          anchorRef={editorAnchorRef}
          boundaryRef={boundaryRef}
          onClose={() => setEditing(null)}
          onRename={(label) =>
            setValues((prev) => withLabel(prev, editing.valueId, label))
          }
          onRequestParent={(parentId) =>
            setPendingEdge({ childId: editing.valueId, parentId })
          }
          onRequestChild={(childId) =>
            setPendingEdge({ childId, parentId: editing.valueId })
          }
          onCreateParent={(label) => {
            setValues((prev) => {
              const next = withNewValue(prev, label, []);
              const created = next[next.length - 1];
              return withParentAdded(next, editing.valueId, created.id);
            });
            setAnnounce(grantSentence(label, labelOf(values, editing.valueId)));
          }}
          onCreateChild={(label) => addChild(editing.valueId, label)}
          onRemoveParent={(parentId) => removeParent(editing.valueId, parentId)}
          onRemoveChild={(childId) => removeParent(childId, editing.valueId)}
          onRequestDelete={() => {
            setPendingDelete(editing.valueId);
            setEditing(null);
          }}
          onGoToValue={jumpTo}
        />
      )}

      {pendingEdge && (
        <GrantConfirmDialog
          values={values}
          childId={pendingEdge.childId}
          parentId={pendingEdge.parentId}
          onCancel={() => setPendingEdge(null)}
          onConfirm={commitEdge}
        />
      )}

      {pendingDelete && (
        <DeleteValueDialog
          values={values}
          valueId={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={commitDelete}
          onGoToValue={(id) => {
            setPendingDelete(null);
            jumpTo(id);
          }}
        />
      )}

      {pendingEdgeRemoval && (
        <RemoveEdgeDialog
          values={values}
          childId={pendingEdgeRemoval.childId}
          parentId={pendingEdgeRemoval.parentId}
          onCancel={() => setPendingEdgeRemoval(null)}
          onConfirm={commitEdgeRemoval}
        />
      )}
    </div>
  );
}
