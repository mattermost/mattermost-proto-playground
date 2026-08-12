/**
 * Hierarchical attribute (backend type `graph`) — V3 authoring model.
 *
 * The DAG math is NOT rewritten here. `covers` / `descendantsOf` / `ancestorsOf`
 * / `wouldCreateCycle` / `validateAddParent` / `depthOf` and the depth + parent
 * limits are imported verbatim from `HierarchicalAttributeAuthoring/graphModel`
 * and re-exported so this file is the single import surface for the V3 screens.
 *
 * What is net-new here is everything that follows from one sentence:
 *
 *   AN EDGE IS NOT CONTAINMENT — IT IS A PRIVILEGE GRANT.
 *
 * Concretely:
 *  - F2 The display spine ("home" occurrence) is derived from `createAt`, not
 *    from array position. There is no primary parent and no parent ordering:
 *    `orderedParents` sorts by the parent's own creation time everywhere, so
 *    nothing in the UI can imply precedence.
 *  - F4 Every relationship is expressed as a claim about access: `grantSentence`,
 *    `edgeConsequence` (what a NEW edge widens), `deleteImpact` (what a delete
 *    takes away), `movePlan` (what moving ONE edge widens and narrows),
 *    `removeEdgePlan` (the single grant dragging a pointer row out removes).
 *  - F3 `orphanDeleteGate` blocks a delete only when a child would genuinely be
 *    left with no parent — a child with other parents is not orphaned.
 *  - F5 `isSingleChain` / `chainSentence` detect an unbranched chain of GRANTS so
 *    the surface can print the direction sentence back to the author. That is a
 *    statement about the whole attribute's edges; it has nothing to do with the
 *    order values are listed in.
 *  - F8 Order is a PER-EDGE ORDINAL (`HierValue.order`), one explicit order per
 *    parent, always present. `ValueRanking` is an attribute-level setting that
 *    decides whether those ordinals are shown and editable at all — so an
 *    attribute nobody ranks sheds numerals, reordering and the comparison caution
 *    entirely. There is no alphabetical option: a derived ordinal would let a
 *    rename quietly change what a comparative rule evaluates to.
 *
 * SIBLING ORDER NEVER GRANTS — BUT IT IS NOT DECORATION EITHER. Two separate
 * claims, and the surface has to carry both:
 *
 *  1. Order does not hand out access. A value listed above another under the same
 *     parent grants nothing on it. Reachability is the parent→child edges and
 *     nothing else, exactly as the tech spec defines it: holding a value grants
 *     its children and everything beneath them. A value's position under one
 *     parent carries nothing into any other parent.
 *  2. Order IS load-bearing data. A policy rule can reference position with
 *     comparative operators ("at or above", "below"), so moving a value can change
 *     which users satisfy such a rule — with no grant added or removed anywhere.
 *     That is why a reorder is announced as a real outcome rather than as a
 *     no-op, and why `positionRuleCaution` exists.
 *
 * The consequence for the UI is narrow: reordering needs no confirm, because it
 * cannot create or destroy an edge and so cannot be refused or widen
 * reachability — but it does need saying out loud, and where a rule references
 * the value it needs naming.
 *
 * Display projection note (F1): the tree renders EVERY parent→child edge exactly
 * once. A value with more than one parent appears at its editing occurrence
 * (full row: rename, add, delete, and its own children) and as a pointer row
 * under each other parent, so a subtree is never duplicated.
 *
 * A POINTER ROW IS NOT STRUCTURALLY INERT. A value holds an independent ordinal
 * under each of its parents, so every rendered occurrence is a real position:
 * dragging a row moves or repositions the edge THAT ROW REPRESENTS and leaves the
 * value's other parents alone (`movePlan` takes the `fromParentId` of the dragged
 * occurrence rather than deriving one). What is scoped to a single occurrence is
 * CONTENT editing, not structure.
 *
 * What a value transitively grants is NOT restated on every row — the tree
 * already draws it, and the access view answers it in full.
 */
import {
  ancestorsOf,
  covers,
  depthOf,
  descendantsOf,
  labelOf,
  optionMap,
  validateAddParent,
  wouldCreateCycle,
  DEPTH_LIMIT,
  PARENT_LIMIT,
  type GraphOption,
  type ParentRejection,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';

export {
  ancestorsOf,
  covers,
  depthOf,
  descendantsOf,
  labelOf,
  optionMap,
  validateAddParent,
  wouldCreateCycle,
  DEPTH_LIMIT,
  PARENT_LIMIT,
  type ParentRejection,
};

/**
 * The ordering scope for the top level. Roots are an ordered list too, so they
 * key off a reserved string rather than a parent id.
 */
export const ROOT_KEY = '__root__';

/**
 * A value in a Hierarchical attribute.
 *
 * `parentIds` is an UNORDERED SET — never derive meaning from its index. Order
 * lives in `order`, per parent.
 */
export interface HierValue extends GraphOption {
  /** Creation time (epoch ms). The tie-break when an edge has no ordinal yet. */
  createAt: number;
  /**
   * Which parent this value is EDITED under, when the author has pinned it with
   * "Edit under this parent". It carries no access meaning and no structural
   * meaning: all parents grant equally, and every occurrence can be dragged.
   * Ignored if it is no longer a parent.
   */
  shownUnderParentId?: string;
  /** Resources currently carrying this value — read-only context for deletes. */
  inUseCount: number;
  /**
   * PROTOTYPE FICTION — THIS FIELD HAS NO BACKEND HOME YET.
   *
   * The ordinal of THIS value under each of its parents, keyed by parent id, with
   * `ROOT_KEY` for the top level. 1-based and dense.
   *
   * `PropertyOptionEdges` is keyed `(ChildOptionID, ParentOptionID)` and carries
   * no ordinal, and §5.3 of the tech spec is explicit that there is no sort-order
   * column anywhere in the schema. A real implementation needs ONE nullable int
   * added to `PropertyOptionEdges`.
   *
   * It has to sit on the EDGE, not on the option. An ordinal on the option can
   * only express one position per value, and the whole point is that a value with
   * two parents holds an independent position under each: "JTF Sentinel" is 1st
   * under Deepwater Patrol and 2nd under Operation Aurora at the same time. Per
   * parent independence is impossible without a per-edge column.
   *
   * THE COLUMN IS NOT A DISPLAY DETAIL, so the ask is not free:
   *  - the policy engine has to be able to READ it. Position is referenceable by
   *    comparative operators ("at or above", "below"), so it is evaluated, not
   *    just rendered;
   *  - it has to be projected into the SQL / bulk-evaluation lane, not only the
   *    per-request read path, or comparative rules cannot be evaluated in bulk;
   *  - it has to be resolved at policy compile time the way the existing `rank`
   *    field type's option ranks already are;
   *  - changing it has to invalidate compiled policy — the existing
   *    option-change invalidation hook family has to fire on ordinal writes too,
   *    which is a new trigger, not a new consumer of an old one.
   *
   * It also OVERLAPS the existing `rank` field type, and the overlap is worth
   * stating rather than discovering later: `rank` already does globally totally
   * ordered comparison over one flat option list. What this expresses is several
   * independent ordered groups inside one attribute — one order per parent, with
   * a value holding a different position in each — which `rank` cannot represent
   * at all. Two mechanisms, adjacent semantics; comparative-operator behaviour
   * should be specified once and shared rather than implemented twice.
   *
   * WHAT ORDER STILL DOES NOT DO: it does not grant. Holding a value never hands
   * out its siblings, whatever their positions. Reachability is the parent→child
   * edges and nothing else, so no function in this model reads an ordinal to
   * answer "who reaches what".
   */
  order?: Record<string, number>;
}

// ── Ordering ─────────────────────────────────────────────────────────────────

export function byCreateAt(a: HierValue, b: HierValue): number {
  return a.createAt - b.createAt || a.label.localeCompare(b.label);
}

export function valueById(values: HierValue[], id: string): HierValue | null {
  return values.find((v) => v.id === id) ?? null;
}

/** The `order` key for an ordering scope. `null` = the top level. */
export function orderKeyOf(parentId: string | null): string {
  return parentId ?? ROOT_KEY;
}

function ordinalOf(value: HierValue, parentId: string | null): number | null {
  const n = value.order?.[orderKeyOf(parentId)];
  return typeof n === 'number' ? n : null;
}

/**
 * `parentId`'s children in ordinal order (`null` = the top level).
 *
 * An edge with no ordinal yet falls back to `createAt` and sorts after the
 * ordered ones, so partial or freshly-migrated data still renders sanely instead
 * of collapsing into an arbitrary shuffle.
 */
export function siblingsOf(
  values: HierValue[],
  parentId: string | null,
): HierValue[] {
  const kids =
    parentId == null
      ? values.filter((v) => v.parentIds.length === 0)
      : values.filter((v) => v.parentIds.includes(parentId));
  return kids.slice().sort((a, b) => {
    const ao = ordinalOf(a, parentId);
    const bo = ordinalOf(b, parentId);
    if (ao != null && bo != null) return ao - bo || byCreateAt(a, b);
    if (ao != null) return -1;
    if (bo != null) return 1;
    return byCreateAt(a, b);
  });
}

/** 1-based position of this occurrence — the numeral the row shows. 0 = absent. */
export function positionOf(
  values: HierValue[],
  childId: string,
  parentId: string | null,
): number {
  return siblingsOf(values, parentId).findIndex((v) => v.id === childId) + 1;
}

/**
 * The policy rules a position change can flip.
 *
 * `policyRefCount` counts the active policy rules referencing a value. Nothing in
 * the data says which of them compare position rather than match exactly, so the
 * sentence says "may" — an honest hedge is better than a confident number that is
 * sometimes wrong. Returns null when no rule references the value at all, which
 * is the common case and the reason this caution is rare rather than constant.
 */
export function positionRuleCaution(
  values: HierValue[],
  childId: string,
): string | null {
  const count = valueById(values, childId)?.policyRefCount ?? 0;
  if (count === 0) return null;
  return `${count} policy ${count === 1 ? 'rule references' : 'rules reference'} “${labelOf(
    values,
    childId,
  )}”. Any that compare position — “at or above”, “below” — may evaluate differently now.`;
}

/**
 * A value's parents, ordered by the PARENT's own `createAt`. Used everywhere —
 * the parents list, the "also under" cue, the home projection — so no view can
 * imply that one parent outranks another (F2).
 */
export function orderedParents(values: HierValue[], id: string): HierValue[] {
  const self = valueById(values, id);
  if (!self) return [];
  return values
    .filter((v) => self.parentIds.includes(v.id))
    .slice()
    .sort(byCreateAt);
}

/**
 * Children of `parentId` in ordinal order. The order is what the author dragged
 * them into; it says nothing about access.
 */
export function orderedChildren(
  values: HierValue[],
  parentId: string,
): HierValue[] {
  return siblingsOf(values, parentId);
}

export function rootValues(values: HierValue[]): HierValue[] {
  return siblingsOf(values, null);
}

// ── Editing occurrence / pointer projection (F1 + F2) ────────────────────────

/**
 * Where the value is EDITED — the one occurrence that carries rename, add and
 * delete, so those controls exist exactly once per value. Default: the parent
 * created first, which is deterministic from data that exists. An explicit
 * `shownUnderParentId` ("Edit under this parent") wins while it is still a
 * parent.
 *
 * This says nothing about the value's real position. Every occurrence is a real
 * position under its own parent, and every occurrence can be dragged.
 */
export function homeParentIdOf(
  values: HierValue[],
  value: HierValue,
): string | null {
  if (
    value.shownUnderParentId &&
    value.parentIds.includes(value.shownUnderParentId)
  ) {
    return value.shownUnderParentId;
  }
  return orderedParents(values, value.id)[0]?.id ?? null;
}

/**
 * True when this rendered occurrence is a pointer rather than the occurrence the
 * value is edited under. Structurally it is a first-class position either way —
 * this only decides which row owns the content controls.
 */
export function isReferenceOccurrence(
  _values: HierValue[],
  _value: HierValue,
  _viaParentId: string | null,
): boolean {
  // Equal-parents variant: every occurrence is a full row — no pointer projection.
  return false;
}

export function homeParentLabel(values: HierValue[], value: HierValue): string {
  const homeId = homeParentIdOf(values, value);
  return homeId == null ? 'the top level' : labelOf(values, homeId);
}

/** Parents other than the home one, ordered by createAt. */
export function otherParentsOf(
  values: HierValue[],
  value: HierValue,
): HierValue[] {
  const homeId = homeParentIdOf(values, value);
  return orderedParents(values, value.id).filter((p) => p.id !== homeId);
}

/** Human list: "A", "A and B", "A, B and C", "A, B and 2 more". */
export function formatList(labels: string[], cap = 3): string {
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  if (labels.length <= cap) {
    return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
  }
  const shown = labels.slice(0, cap).join(', ');
  return `${shown} and ${labels.length - cap} more`;
}

/**
 * Whether values under a parent are numbered, and whether policy rules can
 * compare those numbers. Attribute-level: every parent shares it.
 *
 * Position never grants access under either setting — that is always the edges.
 * `unranked` says nobody compares position either, so the list sheds numerals,
 * reordering and the comparison caution entirely.
 *
 * Prototype state. Belongs in the field's `Attrs` map: it is authored intent,
 * not something derivable from the graph.
 */
export type ValueRanking = 'unranked' | 'ranked';

/**
 * The non-colour multi-parent cue (F7): visible words, not a hue. A count, not
 * an enumeration — naming every parent ran long at three, and the chip opens the
 * Parents pane where they are all listed anyway. Returns null for a
 * single-parent value or a root.
 */
export function parentCountText(value: HierValue): string | null {
  if (value.parentIds.length < 2) return null;
  return `${value.parentIds.length} parents`;
}

/** All parents, for the chip tooltip — no home vs other distinction. */
export function alsoUnderText(
  values: HierValue[],
  value: HierValue,
): string | null {
  const parents = orderedParents(values, value.id);
  if (parents.length < 2) return null;
  return `Under ${formatList(parents.map((p) => p.label))}`;
}

// ── Reachability, stated as access (F4) ──────────────────────────────────────

/**
 * How many values this one grants access to — `covers(id)` minus self, i.e. the
 * transitive descendant count.
 *
 * This is NOT a per-row readout any more: restating it on every row duplicated
 * the tree, and the access-view prototype answers "what does this value grant"
 * properly. It survives because two consequence statements need the number —
 * removing a parent, and deleting a value — where it is a claim about a specific
 * change rather than a description of the screen.
 */
export function grantsCount(values: HierValue[], id: string): number {
  return descendantsOf(values, id).size;
}

/** The edge, read as a grant. The sentence an admin can judge true or false. */
export function grantSentence(parentLabel: string, childLabel: string): string {
  return `Anyone holding “${parentLabel}” also gets “${childLabel}”.`;
}

// ── Adding an edge: the consequence, before it commits (F4) ───────────────────

export interface EdgeConsequence {
  /** Set when the edge is illegal (cycle / depth / parent limit). */
  rejection: ParentRejection | null;
  /** "Adding this means everyone who holds …" */
  headline: string;
  /** Values that become reachable to holders of the new parent. */
  newlyReachable: HierValue[];
  /** Values ABOVE the new parent that inherit the same widening. */
  inheritedBy: HierValue[];
  /** Restating the edge itself. */
  grant: string;
}

/**
 * What does adding `parentId` → `childId` actually do? Answered against the
 * post-edge graph, so the count is the real one, not an estimate.
 */
export function edgeConsequence(
  values: HierValue[],
  childId: string,
  parentId: string,
): EdgeConsequence {
  const child = valueById(values, childId);
  const parent = valueById(values, parentId);
  const rejection = validateAddParent(values, childId, parentId);
  const childLabel = child?.label ?? childId;
  const parentLabel = parent?.label ?? parentId;

  if (rejection || !child || !parent) {
    return {
      rejection,
      headline: '',
      newlyReachable: [],
      inheritedBy: [],
      grant: grantSentence(parentLabel, childLabel),
    };
  }

  const after = withParentAdded(values, childId, parentId);
  const gainedIds = [...descendantsOf(after, parentId)].filter(
    (id) => !covers(values, parentId, id),
  );
  const gained = new Set(gainedIds);
  const newlyReachable = after
    .filter((v) => gained.has(v.id))
    .slice()
    .sort((a, b) => depthOf(after, a.id) - depthOf(after, b.id));

  const inheritedBy = orderedAncestors(values, parentId);

  return {
    rejection: null,
    headline: `Adding this means everyone who holds “${parentLabel}” can reach every channel marked “${childLabel}”.`,
    newlyReachable,
    inheritedBy,
    grant: grantSentence(parentLabel, childLabel),
  };
}

export function orderedAncestors(values: HierValue[], id: string): HierValue[] {
  const ids = ancestorsOf(values, id);
  return values
    .filter((v) => ids.has(v.id))
    .slice()
    .sort((a, b) => depthOf(values, a.id) - depthOf(values, b.id));
}

// ── Delete: DAG-aware gate (F3) + access statement (F4) ──────────────────────

export interface OrphanGate {
  blocked: boolean;
  /** Children that would be left with no parent at all. */
  orphans: HierValue[];
  /** Children that survive because they sit under other parents too. */
  stillPlaced: HierValue[];
  /** Blocking sentence, singular/plural correct. Null when the delete is safe. */
  message: string | null;
  /** Why the other children are not blocking — the DAG-aware part, said aloud. */
  stillPlacedNote: string | null;
}

/**
 * Block a delete only when it would genuinely orphan a child. A child that has
 * another parent is not orphaned, so it must not block anything — and the UI has
 * to say so, or the gate looks arbitrary.
 */
export function orphanDeleteGate(values: HierValue[], id: string): OrphanGate {
  const self = valueById(values, id);
  const children = orderedChildren(values, id);
  const orphans = children.filter((c) => c.parentIds.length === 1);
  const stillPlaced = children.filter((c) => c.parentIds.length > 1);
  const label = self?.label ?? id;

  const message =
    orphans.length === 0
      ? null
      : orphans.length === 1
        ? `Deleting “${label}” would leave “${orphans[0].label}” with no parent. Move it under something else first.`
        : `Deleting “${label}” would leave ${formatList(
            orphans.map((o) => `“${o.label}”`),
            4,
          )} with no parent. Move them under something else first.`;

  const stillPlacedNote =
    stillPlaced.length === 0
      ? null
      : stillPlaced.length === 1
        ? `“${stillPlaced[0].label}” is not affected — it also sits under ${formatList(
            orderedParents(values, stillPlaced[0].id)
              .filter((p) => p.id !== id)
              .map((p) => `“${p.label}”`),
          )}.`
        : `${formatList(
            stillPlaced.map((c) => `“${c.label}”`),
            4,
          )} are not affected — each one also sits under another parent.`;

  return {
    blocked: orphans.length > 0,
    orphans,
    stillPlaced,
    message,
    stillPlacedNote,
  };
}

/** The graph after `id` is deleted: the value goes, and every edge to it goes. */
export function withValueRemoved(values: HierValue[], id: string): HierValue[] {
  return withNormalizedOrder(
    values
      .filter((v) => v.id !== id)
      .map((v) =>
        v.parentIds.includes(id)
          ? { ...v, parentIds: v.parentIds.filter((p) => p !== id) }
          : v,
      ),
  );
}

export interface AccessLoss {
  target: HierValue;
  holders: HierValue[];
}

export interface DeleteImpact {
  grants: number;
  /** Exact coverage delta: who stops reaching what. Computed with `covers`. */
  losses: AccessLoss[];
  /** Children that stay reachable another way, and through which parents. */
  retained: Array<{ child: HierValue; via: HierValue[] }>;
  carriedBy: number;
}

/**
 * What access does this delete remove? Derived by diffing `covers` before and
 * after, so the confirm states fact rather than a guess.
 */
export function deleteImpact(values: HierValue[], id: string): DeleteImpact {
  const after = withValueRemoved(values, id);
  const targetIds = descendantsOf(values, id);
  const holderIds = ancestorsOf(values, id);
  const targets = values.filter((v) => targetIds.has(v.id));
  const holders = values.filter((v) => holderIds.has(v.id));

  const losses: AccessLoss[] = [];
  for (const target of targets) {
    const lost = holders.filter(
      (h) => covers(values, h.id, target.id) && !covers(after, h.id, target.id),
    );
    if (lost.length > 0) {
      losses.push({
        target,
        holders: lost
          .slice()
          .sort((a, b) => depthOf(values, a.id) - depthOf(values, b.id)),
      });
    }
  }

  const retained = orderedChildren(values, id)
    .filter((c) => c.parentIds.length > 1)
    .map((child) => ({
      child,
      via: orderedParents(values, child.id).filter((p) => p.id !== id),
    }));

  return {
    grants: targetIds.size,
    losses,
    retained,
    carriedBy: valueById(values, id)?.inUseCount ?? 0,
  };
}

// ── Single-chain detection (F5) ───────────────────────────────────────────────

/** One root, every value with at most one parent and at most one child. */
export function isSingleChain(values: HierValue[]): boolean {
  if (values.length < 3) return false;
  if (rootValues(values).length !== 1) return false;
  return values.every(
    (v) => v.parentIds.length <= 1 && orderedChildren(values, v.id).length <= 1,
  );
}

export function chainOrder(values: HierValue[]): HierValue[] {
  const out: HierValue[] = [];
  let cursor = rootValues(values)[0] ?? null;
  while (cursor && out.length <= values.length) {
    out.push(cursor);
    cursor = orderedChildren(values, cursor.id)[0] ?? null;
  }
  return out;
}

/**
 * The point of the chain notice is not the offer of another type — it is making
 * the author read the direction out loud.
 */
export function chainSentence(values: HierValue[]): string | null {
  const chain = chainOrder(values);
  if (chain.length < 2) return null;
  const [first, ...rest] = chain;
  return `Right now, holding “${first.label}” grants ${formatList(
    rest.map((v) => `“${v.label}”`),
    4,
  )}.`;
}

// ── Value order (F8) — one explicit order per parent ─────────────────────────

/**
 * Ordinals always exist on every edge. `ValueRanking` only decides whether they
 * are SHOWN and editable, which is why flipping it writes nothing and changes no
 * access — unlike the earlier chain encoding, which had to rewrite edges.
 *
 * There is deliberately no "order alphabetically" option. A derived ordinal would
 * make renaming a value silently change which users pass a comparative policy
 * rule — spooky action at a distance in an access-control surface, from a
 * keystroke that looks cosmetic. An ordinal the policy engine reads has to be one
 * a human set on purpose.
 */

/** Every ordering scope in the graph: the top level, plus every parent. */
function orderScopes(values: HierValue[]): Array<string | null> {
  const scopes: Array<string | null> = [null];
  for (const value of values) {
    if (values.some((child) => child.parentIds.includes(value.id))) {
      scopes.push(value.id);
    }
  }
  return scopes;
}

/**
 * Dense, gap-free ordinals for every scope, preserving the current display order
 * and dropping keys for edges that no longer exist.
 *
 * Run after EVERY structural change. This is what makes the "drift" the previous
 * chain-encoded model had to police impossible by construction: an edge cannot
 * exist without a position, and a position cannot exist without an edge.
 */
export function withNormalizedOrder(values: HierValue[]): HierValue[] {
  const next = new Map<string, Record<string, number>>();
  for (const scope of orderScopes(values)) {
    const key = orderKeyOf(scope);
    siblingsOf(values, scope).forEach((child, index) => {
      const record = next.get(child.id) ?? {};
      record[key] = index + 1;
      next.set(child.id, record);
    });
  }
  return values.map((value) => ({ ...value, order: next.get(value.id) ?? {} }));
}

/** Write explicit ordinals for one scope from an ordered id list, then normalize. */
function withScopeOrder(
  values: HierValue[],
  parentId: string | null,
  orderedIds: string[],
): HierValue[] {
  const key = orderKeyOf(parentId);
  const at = new Map(orderedIds.map((id, index) => [id, index + 1]));
  return withNormalizedOrder(
    values.map((value) => {
      const ordinal = at.get(value.id);
      return ordinal == null
        ? value
        : { ...value, order: { ...value.order, [key]: ordinal } };
    }),
  );
}

/**
 * `parentId`'s child ids with `childId` spliced in at `toIndex` — an index into
 * the list WITH the child taken out, so 0 is first and `length` is last.
 */
function spliceInto(
  values: HierValue[],
  childId: string,
  parentId: string | null,
  toIndex: number,
): string[] {
  const rest = siblingsOf(values, parentId)
    .map((value) => value.id)
    .filter((id) => id !== childId);
  const at = Math.min(Math.max(toIndex, 0), rest.length);
  return [...rest.slice(0, at), childId, ...rest.slice(at)];
}

export interface ReorderPlan {
  childId: string;
  /** The scope being reordered. `null` = the top level. */
  parentId: string | null;
  /** 1-based position the value ends up at. */
  position: number;
  /** How many values that list holds. */
  total: number;
  noop: boolean;
  /**
   * The rules a comparative operator could now read differently, or null. Shown
   * inline next to the list — never a modal, because most attributes have no
   * comparative rule and a blocking confirm on every drag makes ordering unusable.
   */
  ruleCaution: string | null;
  /** The live-region sentence. */
  announcement: string;
  apply: (values: HierValue[]) => HierValue[];
}

/**
 * Move one occurrence to a new position under its own parent.
 *
 * `toIndex` is an index into that parent's list with the value taken out.
 *
 * NO REJECTION CASES. No edge is created or destroyed, so a reorder cannot close
 * a cycle, cannot breach the depth limit, cannot breach the parent limit, and
 * cannot widen or narrow what anyone reaches — which is why it commits without a
 * confirm.
 *
 * IT IS NOT CONSEQUENCE-FREE, THOUGH. Policy rules can compare position, so
 * moving a value can change which users satisfy such a rule without any grant
 * being added or removed. That is a real outcome and the announcement says it;
 * where a rule actually references the value, `ruleCaution` names how many.
 */
export function reorderPlan(
  values: HierValue[],
  childId: string,
  parentId: string | null,
  toIndex: number,
): ReorderPlan {
  const label = labelOf(values, childId);
  const where =
    parentId == null
      ? 'at the top level'
      : `under “${labelOf(values, parentId)}”`;
  const current = siblingsOf(values, parentId).map((value) => value.id);

  if (!current.includes(childId)) {
    return {
      childId,
      parentId,
      position: 0,
      total: current.length,
      noop: true,
      ruleCaution: null,
      announcement: `Nothing moved. “${label}” is not listed ${where}.`,
      apply: (input) => input,
    };
  }

  const next = spliceInto(values, childId, parentId, toIndex);
  const position = next.indexOf(childId) + 1;
  const total = next.length;
  const noop = next.every((id, index) => id === current[index]);
  const caution = noop ? null : positionRuleCaution(values, childId);

  return {
    childId,
    parentId,
    position,
    total,
    noop,
    ruleCaution: caution,
    announcement: noop
      ? `Nothing moved. “${label}” is already ${position} of ${total} ${where}.`
      : `Moved “${label}” to position ${position} of ${total} ${where}. No grant was added or removed.${
          caution ? ` ${caution}` : ''
        }`,
    apply: (input) =>
      withScopeOrder(
        input,
        parentId,
        spliceInto(input, childId, parentId, toIndex),
      ),
  };
}

// ── Move (F4 + F8): a drag moves ONE edge — the one that row represents ──────

export interface MovePlan {
  childId: string;
  /** The edge being moved: the parent of the dragged OCCURRENCE. null = top level. */
  fromParentId: string | null;
  /** The parent that edge is retargeted to. null = the top level. */
  toParentId: string | null;
  /**
   * Where in the new parent's list it lands — an index into that list, or null
   * for "append at the end", which is what dropping on a row's body does.
   */
  insertIndex: number | null;
  /** True when the moved edge is also the one the value is edited under. */
  isHomeEdge: boolean;
  /** Set when the move must be refused. Fail closed — never confirm-to-allow. */
  rejection: string | null;
  /** True when the move would change nothing at all. */
  noop: boolean;
  /**
   * Rules a comparative operator could now read differently, or null. A move
   * relists the value under a different parent, so its position changes as well
   * as its grants.
   */
  ruleCaution: string | null;
  /** The live-region sentence: direction-explicit, in the grant register. */
  announcement: string;
}

/**
 * A drag MOVES THE EDGE THAT ROW REPRESENTS. It is not an add-parent, and it is
 * not a move of "the value".
 *
 * `fromParentId` is the parent of the dragged occurrence, passed in by the row
 * rather than derived, which is the whole correction: a value with several
 * parents holds an independent position under each of them, so the row the author
 * grabbed decides which grant is being retargeted. Every other parent of the
 * value is untouched.
 *
 * Two things it still refuses, both because they would delete grants nobody
 * confirmed: minting a second parent (that stays an explicit act in the Parents
 * pane, behind a grant confirm), and folding one edge into an edge that already
 * exists.
 *
 * `insertIndex` says where in the new parent's list it lands — an index into that
 * list, from a drop in the gap between two of its children. Omit it (or pass
 * null) for "append at the end", which is what dropping on a row's body does and
 * what adding a parent in the Parents pane does. The ordinal is display only, so
 * it changes nothing about what this plan grants or takes away.
 *
 * Every branch is re-validated here, at commit time, even though the drop
 * targets were pre-filtered by `wouldCreateCycle` (NIST 800-207 Tenet 5 — never
 * trust a pre-check that ran against a graph that may since have changed).
 */
export function movePlan(
  values: HierValue[],
  childId: string,
  fromParentId: string | null,
  targetId: string | null,
  insertIndex: number | null = null,
): MovePlan {
  const child = valueById(values, childId);
  const base: MovePlan = {
    childId,
    fromParentId,
    toParentId: targetId,
    insertIndex,
    isHomeEdge: false,
    rejection: null,
    noop: false,
    ruleCaution: null,
    announcement: '',
  };
  if (!child) {
    return { ...base, rejection: 'That value no longer exists.' };
  }
  if (fromParentId != null && !child.parentIds.includes(fromParentId)) {
    return {
      ...base,
      rejection: `“${child.label}” is no longer granted by “${labelOf(values, fromParentId)}”, so there is no link there to move.`,
      announcement: `Nothing moved. “${child.label}” is no longer granted by “${labelOf(values, fromParentId)}”.`,
    };
  }

  const label = child.label;
  const from: MovePlan = {
    ...base,
    isHomeEdge: homeParentIdOf(values, child) === fromParentId,
  };

  /**
   * "It sits 2 of 5 there." Only stated when the drop named a position — a drop
   * on a row's body appends, and there is no numeral worth reading back.
   */
  const landing = (scopeId: string | null): string => {
    if (insertIndex == null) return '';
    const total = siblingsOf(values, scopeId).length + 1;
    const at = Math.min(Math.max(insertIndex, 0), total - 1) + 1;
    return ` It sits ${at} of ${total} there.`;
  };

  if (targetId === fromParentId) {
    return {
      ...from,
      noop: true,
      announcement:
        fromParentId == null
          ? `Nothing moved. “${label}” is already at the top level.`
          : `Nothing moved. “${label}” already sits under “${labelOf(values, fromParentId)}”.`,
    };
  }

  if (targetId === null) {
    if (child.parentIds.length > 1) {
      return {
        ...from,
        rejection: `“${label}” is granted by ${child.parentIds.length} parents. Moving it to the top level would cut all ${child.parentIds.length} of those grants at once, so remove them in its Parents pane instead.`,
        announcement: `Can’t move “${label}” to the top level — it is granted by ${child.parentIds.length} parents. Remove them in its Parents pane instead. Nothing moved.`,
      };
    }
    const fromLabel = labelOf(values, fromParentId as string);
    const caution = positionRuleCaution(values, childId);
    return {
      ...from,
      ruleCaution: caution,
      announcement: `Moved “${label}” to the top level. Anyone holding “${fromLabel}” no longer reaches “${label}”. Nothing grants it now.${landing(
        null,
      )}${caution ? ` ${caution}` : ''}`,
    };
  }

  if (targetId === childId || wouldCreateCycle(values, childId, targetId)) {
    const targetLabel = labelOf(values, targetId);
    return {
      ...from,
      rejection: `“${label}” already grants “${targetLabel}”, so moving it under “${targetLabel}” would loop back on itself.`,
      announcement: `Can’t move “${label}” under “${targetLabel}” — “${label}” already grants “${targetLabel}”, so this would loop back on itself. Nothing moved.`,
    };
  }

  // Retargeting one edge onto a parent that already grants this value would
  // merge two grants into one — a silent removal, not a move.
  if (child.parentIds.includes(targetId)) {
    const targetLabel = labelOf(values, targetId);
    return {
      ...from,
      rejection: `“${targetLabel}” already grants “${label}”, so this would just remove the link from “${labelOf(values, fromParentId as string)}” and nothing else. Remove that parent in its Parents pane if that is what you want.`,
      announcement: `Can’t move “${label}” under “${targetLabel}” — it is already granted there, so this would only remove a grant. Nothing moved.`,
    };
  }

  const rejection = validateAddParent(values, childId, targetId);
  if (rejection) {
    return {
      ...from,
      rejection: rejection.message,
      announcement: `Can’t move “${label}” under “${labelOf(values, targetId)}”. ${rejection.message} Nothing moved.`,
    };
  }

  const targetLabel = labelOf(values, targetId);
  const others = child.parentIds.filter((p) => p !== fromParentId);
  const gained = `Anyone holding “${targetLabel}” now reaches “${label}”.`;
  const lost =
    fromParentId == null
      ? 'Nothing granted it before.'
      : `Anyone holding “${labelOf(values, fromParentId)}” no longer reaches it.`;
  const kept =
    others.length === 0
      ? ''
      : ` Its position under ${formatList(
          others.map((p) => `“${labelOf(values, p)}”`),
          3,
        )} is unchanged.`;

  const caution = positionRuleCaution(values, childId);

  return {
    ...from,
    ruleCaution: caution,
    announcement: `Moved “${label}” under “${targetLabel}”.${landing(targetId)} ${gained} ${lost}${kept}${
      caution ? ` ${caution}` : ''
    }`,
  };
}

export function applyMove(values: HierValue[], plan: MovePlan): HierValue[] {
  if (plan.rejection || plan.noop) return values;
  let next = values;
  if (plan.fromParentId != null) {
    next = withParentRemoved(next, plan.childId, plan.fromParentId);
  }
  if (plan.toParentId != null) {
    next = withParentAdded(
      next,
      plan.childId,
      plan.toParentId,
      plan.insertIndex,
    );
    // Only follow the drop with the editing occurrence when the edge that moved
    // IS the editing edge. Moving a pointer row must not relocate where the value
    // is edited — that would make one occurrence's drag reshuffle another.
    if (plan.isHomeEdge) {
      next = withShownUnder(next, plan.childId, plan.toParentId);
    }
  } else if (plan.insertIndex != null) {
    // Moved to the top level at a named position: the edge is gone, so all that
    // is left to place is the root ordinal.
    next = withScopeOrder(
      next,
      null,
      spliceInto(next, plan.childId, null, plan.insertIndex),
    );
  }
  return next;
}

/**
 * Move candidates for the keyboard equivalent of the drag: never self, never a
 * descendant (a cycle), never a parent it already has (that would merge two
 * grants), and never the parent of the edge being moved (a no-op).
 */
export function moveCandidates(
  values: HierValue[],
  id: string,
  fromParentId: string | null,
): HierValue[] {
  const self = valueById(values, id);
  const blocked = descendantsOf(values, id);
  return values
    .filter(
      (v) =>
        v.id !== id &&
        !blocked.has(v.id) &&
        v.id !== fromParentId &&
        !(self?.parentIds.includes(v.id) ?? false),
    )
    .slice()
    .sort(byCreateAt);
}

// ── Removing one edge (the narrower meaning of dragging a pointer row out) ────

export interface RemoveEdgePlan {
  childId: string;
  parentId: string;
  rejection: string | null;
  /** The one grant being removed, said in the grant register. */
  sentence: string;
  /** The parents that still grant it — why this is not an orphaning. */
  keptLabels: string[];
  announcement: string;
}

/**
 * Dragging a POINTER row to the top-level zone has a coherent narrow meaning:
 * remove just that one parent edge and leave the value's other parents alone.
 *
 * It is refused for the last remaining parent, because then it is not an edge
 * removal at all — it is a move to the top level, which `movePlan` handles and
 * announces differently.
 */
export function removeEdgePlan(
  values: HierValue[],
  childId: string,
  parentId: string,
): RemoveEdgePlan {
  const child = valueById(values, childId);
  const childLabel = child?.label ?? childId;
  const parentLabel = labelOf(values, parentId);
  const base: RemoveEdgePlan = {
    childId,
    parentId,
    rejection: null,
    sentence: `Anyone holding “${parentLabel}” stops reaching “${childLabel}”.`,
    keptLabels: [],
    announcement: '',
  };
  if (!child || !child.parentIds.includes(parentId)) {
    return {
      ...base,
      rejection: `“${parentLabel}” no longer grants “${childLabel}”.`,
      announcement: `Nothing changed. “${parentLabel}” no longer grants “${childLabel}”.`,
    };
  }
  if (child.parentIds.length < 2) {
    return {
      ...base,
      rejection: `“${parentLabel}” is the only thing granting “${childLabel}”, so removing it would leave the value at the top level. Drag its own row out instead.`,
      announcement: `Nothing changed. “${parentLabel}” is the only thing granting “${childLabel}”.`,
    };
  }
  const keptLabels = orderedParents(values, childId)
    .filter((p) => p.id !== parentId)
    .map((p) => p.label);
  return {
    ...base,
    keptLabels,
    announcement: `Stopped “${parentLabel}” granting “${childLabel}”. It is still granted by ${formatList(
      keptLabels.map((l) => `“${l}”`),
      3,
    )}, and its position there is unchanged.`,
  };
}

// ── Pure transforms ──────────────────────────────────────────────────────────

/**
 * Add one parent→child edge. The new edge lands at the END of that parent's list
 * unless `insertIndex` names a position — which is the designer's default: a
 * value gaining "A" as a parent turns up after A's existing children, and can be
 * dragged up afterwards.
 */
export function withParentAdded(
  values: HierValue[],
  childId: string,
  parentId: string,
  insertIndex: number | null = null,
): HierValue[] {
  const linked = values.map((v) =>
    v.id === childId && !v.parentIds.includes(parentId)
      ? { ...v, parentIds: [...v.parentIds, parentId] }
      : v,
  );
  // Append = one past the last of the parent's OTHER children.
  const at =
    insertIndex ??
    siblingsOf(values, parentId).filter((v) => v.id !== childId).length;
  return withScopeOrder(
    linked,
    parentId,
    spliceInto(linked, childId, parentId, at),
  );
}

export function withParentRemoved(
  values: HierValue[],
  childId: string,
  parentId: string,
): HierValue[] {
  return withNormalizedOrder(
    values.map((v) =>
      v.id === childId
        ? {
            ...v,
            parentIds: v.parentIds.filter((p) => p !== parentId),
            shownUnderParentId:
              v.shownUnderParentId === parentId
                ? undefined
                : v.shownUnderParentId,
          }
        : v,
    ),
  );
}

export function withShownUnder(
  values: HierValue[],
  childId: string,
  parentId: string,
): HierValue[] {
  return values.map((v) =>
    v.id === childId ? { ...v, shownUnderParentId: parentId } : v,
  );
}

export function withLabel(
  values: HierValue[],
  id: string,
  label: string,
): HierValue[] {
  return values.map((v) => (v.id === id ? { ...v, label } : v));
}

/**
 * A new value lands at the END of every list it joins — its parents', or the top
 * level's if it has none. Its ordinals come out of normalization: an unordered
 * edge sorts after the ordered ones, so "last" needs no arithmetic here.
 */
export function withNewValue(
  values: HierValue[],
  label: string,
  parentIds: string[],
): HierValue[] {
  return withNormalizedOrder([
    ...values,
    {
      id: `val-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
      label,
      parentIds,
      createAt: Date.now(),
      inUseCount: 0,
      policyRefCount: 0,
      source: 'manual',
    },
  ]);
}

/** Candidate parents: never self, never a descendant, never already a parent. */
export function parentCandidates(values: HierValue[], id: string): HierValue[] {
  const self = valueById(values, id);
  const blocked = descendantsOf(values, id);
  return values
    .filter(
      (v) =>
        v.id !== id &&
        !blocked.has(v.id) &&
        !(self?.parentIds.includes(v.id) ?? false),
    )
    .slice()
    .sort(byCreateAt);
}

/** Candidate children: never self, never an ancestor, never already a child. */
export function childCandidates(values: HierValue[], id: string): HierValue[] {
  const blocked = ancestorsOf(values, id);
  return values
    .filter(
      (v) => v.id !== id && !blocked.has(v.id) && !v.parentIds.includes(id),
    )
    .slice()
    .sort(byCreateAt);
}
