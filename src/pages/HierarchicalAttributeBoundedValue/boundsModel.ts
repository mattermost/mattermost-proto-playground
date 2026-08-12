/**
 * Bounded values + derivation — local model for the Bounded Value prototype.
 *
 * Two backend behaviours with no UX yet are modelled here:
 *
 * 1. BOUNDS — a field declares a bound against a *linked* field's value on
 *    another entity. Two leaves matter and they are not equivalent:
 *      • `write.value.bounds: [linked]`  — THE GUARD. Every write is rejected
 *        unless the value is at-or-below the reference value. Enforced
 *        server-side on every save, however the value was set, because an
 *        author can edit any part of their own post — so the value cannot
 *        police itself.
 *      • `read.option.bounds: [linked]`  — A CONVENIENCE. While composing,
 *        only the options at-or-below the reference are offered, so invalid
 *        choices are never presented. The client is never trusted; this only
 *        shapes the picker.
 *    The reference is reached through a linked-field relationship: a post's cap
 *    is its channel's value; a channel's cap is the system value. The caps
 *    chain: post ≤ channel ≤ system.
 *
 *    FAIL-CLOSED IS EXPLICIT AND ABSOLUTE. If the reference entity or its value
 *    cannot be resolved — no channel, no value, deleted, ambiguous — the bound
 *    resolves to NOTHING: the write is rejected and no options are offered at
 *    all. A missing cap never means "no limit". See `offeredValueIds`, which
 *    returns `[]` for an unresolved cap.
 *
 * 2. DERIVATION — a field-level setting (`parent` | `participants` | unset).
 *    There is NO per-value provenance flag anywhere. Whether a value is derived
 *    or explicit is read straight off the data:
 *      • a STORED value is explicit — an author's override, still subject to
 *        the cap;
 *      • NO STORED value means derivation applies and the value is computed on
 *        read.
 *    So an author re-inherits simply by clearing their value. There is no
 *    "revert" API — revert IS delete. See `effectiveValue`.
 *
 * Field type note: "at-or-below" has two shapes.
 *   • The ORDERED case is the `rank` field type — compare rank integers.
 *     Classification levels (UNCLASSIFIED < CUI < CONFIDENTIAL < SECRET <
 *     TOP SECRET) are the driving use case and are modelled that way.
 *   • The GRAPH case is the `hierarchical` field type, which GENERALISES the
 *     ordered case to "within": the value must be the reference or a
 *     descendant of it. On a strict chain (which is how the levels scheme is
 *     also expressed as a DAG below) rank comparison and `covers()` agree —
 *     `isWithin` asserts that equivalence in dev.
 *
 * DAG math is NOT reimplemented here. `covers`, `descendantsOf` and
 * `ancestorsOf` come from the existing authoring model.
 */

import {
  ancestorsOf,
  covers,
  descendantsOf,
  labelOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';

// ─── Scheme ───────────────────────────────────────────────────────────────────

export type SchemeKey = 'levels' | 'programs';

/** `rank` = ordered list, compare integers. `hierarchical` = DAG, compare "within". */
export type BoundedFieldType = 'rank' | 'hierarchical';

export interface ValueScheme {
  key: SchemeKey;
  fieldType: BoundedFieldType;
  /** The shared value list both linked fields draw from. */
  valueListName: string;
  /** Field name shown on the post / channel surfaces. */
  fieldLabel: string;
  /**
   * The DAG. Root is the broadest / highest value; children are narrower and
   * therefore at-or-below their parents. Both schemes carry one so the graph
   * helpers work uniformly.
   */
  options: GraphOption[];
  /**
   * Rank per option id — only populated for `rank` schemes. Higher integer =
   * higher value. Display order is highest-first.
   */
  ranks?: Record<string, number>;
  /** Display order, highest / broadest first. */
  displayOrder: string[];
}

export function optionLabel(scheme: ValueScheme, id: string): string {
  return labelOf(scheme.options, id);
}

function rankOf(scheme: ValueScheme, id: string): number {
  return scheme.ranks?.[id] ?? 0;
}

// ─── "At or below" / "within" ─────────────────────────────────────────────────

/**
 * Is `candidateId` at-or-below `refId`?
 *
 * `rank`         → candidate rank ≤ reference rank.
 * `hierarchical` → candidate is the reference or a descendant of it (`covers`).
 */
export function isWithin(
  scheme: ValueScheme,
  refId: string,
  candidateId: string,
): boolean {
  if (scheme.fieldType === 'rank') {
    return rankOf(scheme, candidateId) <= rankOf(scheme, refId);
  }
  return covers(scheme.options, refId, candidateId);
}

/**
 * Dev sanity check, not used by the UI: on a strict chain the ordered reading
 * and the graph reading of "at or below" must agree. Exported so the
 * equivalence claim in the file header is checkable rather than asserted.
 */
export function rankAndGraphAgree(scheme: ValueScheme): boolean {
  if (scheme.fieldType !== 'rank') return true;
  return scheme.displayOrder.every((refId) =>
    scheme.displayOrder.every(
      (candidateId) =>
        rankOf(scheme, candidateId) <= rankOf(scheme, refId) ===
        covers(scheme.options, refId, candidateId),
    ),
  );
}

/** Every value at-or-below `refId`, in display order. */
export function valuesAtOrBelow(scheme: ValueScheme, refId: string): string[] {
  if (scheme.fieldType === 'rank') {
    return scheme.displayOrder.filter((id) => isWithin(scheme, refId, id));
  }
  const within = new Set<string>([
    refId,
    ...descendantsOf(scheme.options, refId),
  ]);
  return scheme.displayOrder.filter((id) => within.has(id));
}

/**
 * Every value that keeps `currentId` inside it — the raise-only set for a
 * container whose own value is `currentId`.
 *
 * `rank`         → rank ≥ current rank.
 * `hierarchical` → the current value or one of its ancestors. In product
 *                  language: a value that still contains the current one.
 *                  Anything else is a "lowering" — it does not contain the
 *                  current value, so content already marked inside it would
 *                  fall outside.
 */
export function valuesContaining(
  scheme: ValueScheme,
  currentId: string,
): string[] {
  if (scheme.fieldType === 'rank') {
    return scheme.displayOrder.filter(
      (id) => rankOf(scheme, id) >= rankOf(scheme, currentId),
    );
  }
  const up = new Set<string>([
    currentId,
    ...ancestorsOf(scheme.options, currentId),
  ]);
  return scheme.displayOrder.filter((id) => up.has(id));
}

// ─── Cap resolution (fail-closed) ─────────────────────────────────────────────

export type CapUnresolvedReason =
  | 'no-reference-entity'
  | 'no-reference-value'
  | 'reference-deleted'
  | 'ambiguous-reference';

export interface CapResolution {
  status: 'resolved' | 'unresolved';
  /** Resolved cap value id. Present only when `status === 'resolved'`. */
  capId?: string;
  /** Human name of the reference entity, for honest copy ("~falcon-ops"). */
  sourceLabel: string;
  reason?: CapUnresolvedReason;
}

export const CAP_UNRESOLVED_REASON_TEXT: Record<CapUnresolvedReason, string> = {
  'no-reference-entity': 'there is no linked entity to read it from',
  'no-reference-value': 'no value is set on it',
  'reference-deleted': 'its record could not be read',
  'ambiguous-reference':
    'more than one linked field matched, so the cap is ambiguous',
};

export function resolvedCap(capId: string, sourceLabel: string): CapResolution {
  return { status: 'resolved', capId, sourceLabel };
}

export function unresolvedCap(
  reason: CapUnresolvedReason,
  sourceLabel: string,
): CapResolution {
  return { status: 'unresolved', reason, sourceLabel };
}

/**
 * `read.option.bounds` — the picker convenience.
 *
 * An unresolved cap yields NO options. That is not "nothing configured"; it is
 * fail-closed. A caller must never fall back to the full list here.
 */
export function offeredValueIds(
  scheme: ValueScheme,
  cap: CapResolution,
): string[] {
  if (cap.status !== 'resolved' || !cap.capId) return [];
  return valuesAtOrBelow(scheme, cap.capId);
}

// ─── Write guard ──────────────────────────────────────────────────────────────

export type WriteRejectionKind = 'above-cap' | 'cap-unresolved';

export interface WriteResult {
  ok: boolean;
  kind?: WriteRejectionKind;
  /** The value the caller tried to write. */
  attemptedId?: string;
  /** The cap in force, when it resolved. */
  capId?: string;
}

/**
 * `write.value.bounds` — the guard. Server-side, on every save, including
 * edits. The client-side picker narrowing is not a substitute for this; a value
 * that never appeared in a picker can still arrive here.
 */
export function validateWrite(
  scheme: ValueScheme,
  cap: CapResolution,
  valueId: string,
): WriteResult {
  if (cap.status !== 'resolved' || !cap.capId) {
    return { ok: false, kind: 'cap-unresolved', attemptedId: valueId };
  }
  if (!isWithin(scheme, cap.capId, valueId)) {
    return {
      ok: false,
      kind: 'above-cap',
      attemptedId: valueId,
      capId: cap.capId,
    };
  }
  return { ok: true, capId: cap.capId };
}

// ─── Derivation ───────────────────────────────────────────────────────────────

export type DerivationMode = 'unset' | 'parent' | 'participants';

export interface EffectiveValue {
  valueId: string | null;
  /**
   * True when the value came from the container rather than from storage.
   *
   * Inferred from the ABSENCE of a stored value — there is no provenance flag
   * on the value itself. Any UI marking that claims "inherited" is making this
   * same inference, which is why the copy has to be honest about it.
   */
  derived: boolean;
}

/**
 * Resolve the value shown for an entity.
 *
 * A stored value is explicit. No stored value + derivation `parent` means the
 * container's value is computed on read. No stored value + derivation `unset`
 * means there is simply no value.
 */
export function effectiveValue(
  storedValueId: string | null,
  derivation: DerivationMode,
  containerValueId: string | null,
): EffectiveValue {
  if (storedValueId != null) return { valueId: storedValueId, derived: false };
  if (derivation === 'parent') {
    return { valueId: containerValueId, derived: containerValueId != null };
  }
  return { valueId: null, derived: false };
}

// ─── Parent-drops-below-child conflict scan ───────────────────────────────────

export interface ConflictCandidate {
  id: string;
  storedValueId: string | null;
}

/**
 * Which children would fall outside the container's NEW value.
 *
 * Only children with a STORED value can conflict. Children that store nothing
 * derive the container's value and therefore follow it wherever it goes — a
 * direct consequence of derivation having no provenance flag.
 */
export function conflictingChildIds<T extends ConflictCandidate>(
  scheme: ValueScheme,
  children: T[],
  nextContainerValueId: string,
): T[] {
  return children.filter(
    (c) =>
      c.storedValueId != null &&
      !isWithin(scheme, nextContainerValueId, c.storedValueId),
  );
}

// ─── Field configuration (what Surface 3 edits) ───────────────────────────────

export interface BoundLeafConfig {
  /** `write.value.bounds: [linked]` — always on when the bound is on. */
  writeValueBounds: boolean;
  /** `read.option.bounds: [linked]` — optional picker narrowing. */
  readOptionBounds: boolean;
}

export interface BoundedFieldConfig {
  /** Field this config belongs to, e.g. "Post classification". */
  fieldName: string;
  /** Entity the field is attached to. */
  appliesTo: string;
  derivation: DerivationMode;
  /** Whether a bound is declared at all. */
  bounded: boolean;
  bounds: BoundLeafConfig;
  /** The linked field the cap is read from, e.g. "Channel classification". */
  linkedFieldName: string;
  /** Entity the linked field is attached to. */
  linkedFieldAppliesTo: string;
  /** Both fields must draw from this same list or there is nothing to compare. */
  sharedValueListName: string;
}
