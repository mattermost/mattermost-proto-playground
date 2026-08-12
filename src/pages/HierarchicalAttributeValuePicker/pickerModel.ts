/**
 * Hierarchical (backend name `graph`) attribute type — VALUE PICKER model.
 *
 * This is the ASSIGNMENT surface, not the authoring surface. It is deliberately
 * built twice over — once for the SUBJECT side (assigning programs to a user)
 * and once for the RESOURCE side (marking a channel) — because the semantics
 * invert between them while the value list stays identical.
 *
 * The DAG math is NOT re-implemented here. `covers`, `ancestorsOf`,
 * `descendantsOf` and `reachabilityCoversAll` are imported verbatim from
 * `HierarchicalAttributeAuthoring/graphModel` — that implementation is correct
 * and is the single source of truth for the relation `a ⪰ b` ("a is at-or-above
 * b") and for `coversAll`. The Programs seed is imported verbatim from
 * `HierarchicalAttributeAuthoringV2/graphAuthoringModel` (`SEED_V2`).
 *
 * What lives here is only picker-specific derivation:
 *   • viewer scoping (P6)          — down-set masking of the option pool
 *   • canonical path + also-under  — one row per value (P4) and namespace (P5)
 *   • dominated pairs (P3)         — one computation, two opposite readings
 *   • consequence sentences (P1/P2)— the live prose that is the point of the screen
 *   • the counted user population  — so "how many users qualify" is real (P3)
 */
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import {
  ancestorsOf,
  covers,
  descendantsOf,
  optionMap,
  reachabilityCoversAll,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import { SEED_V2 } from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';

// ─── Vocabulary ────────────────────────────────────────────────────────────────

/** Product name of the field type. Backend name is `graph`. */
export const TYPE_NAME = 'Hierarchical';
/** The attribute being assigned on both sides. */
export const FIELD_NAME = 'Program';

/**
 * The shared option pool. The SAME list serves the subject side and the resource
 * side — that identity is the whole reason the two consequence readings have to
 * be spelled out in words.
 *
 * 5 unrelated roots (a forest, not a tree), two genuine multi-parent nodes:
 *   Mission Casper → Raptor Flight ∧ Dragon Spacecraft
 *   JTF Sentinel   → Operation Aurora ∧ Deepwater Patrol ∧ Northern Command
 */
export const PROGRAM_GRAPH: GraphOption[] = SEED_V2;

export type PickerSide = 'subject' | 'resource';
export type ViewerMode = 'admin' | 'restricted';

// ─── P6 · Viewer-scoped option pool ────────────────────────────────────────────

/**
 * The values the restricted demo viewer is cleared for. Their pool is the
 * down-set of these: Air Operations ▸ Falcon Wing ▸ Raptor Flight ▸ Mission
 * Casper, and Joint Command ▸ Operation Aurora ▸ JTF Sentinel. Seven of fourteen.
 */
export const RESTRICTED_VIEWER_HOLDS = ['air', 'joint'];

/**
 * PROTOTYPE FICTION — read this before porting anything from here.
 *
 * The real implementation computes the visible option pool SERVER-SIDE and never
 * ships out-of-scope values to the client. It has to: the hierarchy structure is
 * itself sensitive — value names plus their relationships are a compartmentation
 * map, so leaking the shape leaks as much as leaking the names. Here we filter a
 * fully-loaded graph in the browser purely so the demo toggle can flip between
 * the two viewers in one session. Do not treat this function as a design for the
 * masking mechanism; it is a stand-in for a response the client never sees.
 *
 * The masking rules it does encode ARE the design intent:
 *   • included = the down-set of the viewer's own values (self + descendants)
 *   • each included value's parent pointers are re-filtered to included values,
 *     so an out-of-scope parent can never surface in a breadcrumb, in an
 *     "also under" line, or in a root filter chip
 *   • nothing anywhere counts, totals, or hints at what was withheld
 */
export function scopeGraph(
  options: GraphOption[],
  viewerHolds: string[] | null,
): GraphOption[] {
  if (viewerHolds == null) return options;
  const inScope = new Set<string>();
  for (const held of viewerHolds) {
    inScope.add(held);
    for (const d of descendantsOf(options, held)) inScope.add(d);
  }
  return options
    .filter((o) => inScope.has(o.id))
    .map((o) => ({ ...o, parentIds: o.parentIds.filter((p) => inScope.has(p)) }));
}

export function graphForViewer(viewer: ViewerMode): GraphOption[] {
  return scopeGraph(
    PROGRAM_GRAPH,
    viewer === 'restricted' ? RESTRICTED_VIEWER_HOLDS : null,
  );
}

// ─── P4/P5 · One row per value, and which hierarchy it belongs to ───────────────

/** Values with no parents inside the given (possibly scoped) graph. */
export function rootsOfGraph(options: GraphOption[]): GraphOption[] {
  return options.filter((o) => o.parentIds.length === 0);
}

/** Every root reachable upward from `id`, in graph-declaration order. */
export function rootIdsOf(options: GraphOption[], id: string): string[] {
  const map = optionMap(options);
  const candidates = new Set<string>([id, ...ancestorsOf(options, id)]);
  return options
    .filter((o) => candidates.has(o.id) && o.parentIds.length === 0)
    .map((o) => o.id)
    .filter((rootId) => map.has(rootId));
}

/**
 * The canonical path to `id`, root-first, EXCLUDING the value itself. Canonical
 * = the chain of first-declared parents, so a multi-parent value still has
 * exactly one breadcrumb and therefore exactly one row (P4). Its other parents
 * are surfaced separately by `otherParentLabels`.
 */
export function canonicalPathLabels(
  options: GraphOption[],
  id: string,
): string[] {
  const map = optionMap(options);
  const out: string[] = [];
  const guard = new Set<string>();
  let cur = map.get(id);
  while (cur && cur.parentIds.length > 0 && !guard.has(cur.id)) {
    guard.add(cur.id);
    const parent = map.get(cur.parentIds[0]);
    if (!parent) break;
    out.unshift(parent.label);
    cur = parent;
  }
  return out;
}

/** Parents beyond the canonical one — the "also under: …" line. */
export function otherParentLabels(
  options: GraphOption[],
  id: string,
): string[] {
  const map = optionMap(options);
  return (map.get(id)?.parentIds ?? [])
    .slice(1)
    .map((p) => map.get(p)?.label)
    .filter((l): l is string => l != null);
}

/** Ancestors of `id`, nearest first — the "or anything above it" enumeration. */
export function ancestorLabelsNearestFirst(
  options: GraphOption[],
  id: string,
): string[] {
  const map = optionMap(options);
  const seen = new Set<string>();
  const out: string[] = [];
  let frontier = [...(map.get(id)?.parentIds ?? [])];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const f of frontier) {
      if (seen.has(f)) continue;
      seen.add(f);
      const o = map.get(f);
      if (!o) continue;
      out.push(o.label);
      next.push(...o.parentIds);
    }
    frontier = next;
  }
  return out;
}

export function labelsFor(options: GraphOption[], ids: string[]): string[] {
  const map = optionMap(options);
  return ids.map((id) => map.get(id)?.label ?? id);
}

/** Union of the down-sets of `ids` — self plus everything beneath. */
export function downSetOf(
  options: GraphOption[],
  ids: string[],
): Set<string> {
  const out = new Set<string>();
  for (const id of ids) {
    out.add(id);
    for (const d of descendantsOf(options, id)) out.add(d);
  }
  return out;
}

/** Roots spanned by a selection — >1 means the selection is incomparable (P5). */
export function spannedRootIds(
  options: GraphOption[],
  selected: string[],
): string[] {
  const roots = new Set<string>();
  for (const s of selected) for (const r of rootIdsOf(options, s)) roots.add(r);
  return options.filter((o) => roots.has(o.id)).map((o) => o.id);
}

// ─── P3 · Redundancy and dominance are the SAME computation ─────────────────────

export interface DominatedPair {
  /** The value that is at-or-below the other. */
  inertId: string;
  /** The ancestor that already covers it. */
  dominantId: string;
}

/**
 * Pairs where one selected value is an ancestor of another selected value.
 *
 * One relation, two opposite consequences — which is exactly why this is a
 * single function with two renderers rather than two functions:
 *
 *   SUBJECT side  the descendant is REDUNDANT. `{Air Operations, Raptor Flight}`
 *                 grants the same access as `{Air Operations}` alone. Harmless;
 *                 recording a specific read-on has audit value. Flag, never block.
 *
 *   RESOURCE side the descendant is INERT BUT STILL DISPLAYED. Requiring both
 *                 means "Air-or-above ∧ Raptor-or-above", and everyone who
 *                 satisfies the first already satisfies the second, so the
 *                 conjunction collapses to "Air-or-above". The restrictive-looking
 *                 Raptor Flight marking enforces nothing. Hard-warn.
 */
export function dominatedPairs(
  options: GraphOption[],
  selected: string[],
): DominatedPair[] {
  const out: DominatedPair[] = [];
  for (const inertId of selected) {
    for (const dominantId of selected) {
      if (dominantId === inertId) continue;
      if (covers(options, dominantId, inertId)) {
        out.push({ inertId, dominantId });
        break;
      }
    }
  }
  return out;
}

/** The requirement a resource selection actually enforces once inert values drop. */
export function effectiveRequirement(
  options: GraphOption[],
  selected: string[],
): string[] {
  const inert = new Set(dominatedPairs(options, selected).map((p) => p.inertId));
  return selected.filter((s) => !inert.has(s));
}

// ─── The counted population (P3 · "how many users qualify") ─────────────────────

export interface MockUser {
  id: string;
  name: string;
  username: string;
  avatarSrc: string;
  /** Program values held by this user. */
  holds: string[];
}

/**
 * Channel-eligible members, used only to make the resource-side qualifying count
 * a real number. The acting admin (Leonard Riley) is the person operating the
 * console and is deliberately NOT in this population — otherwise a
 * fully-cleared editor would qualify for everything and the zero-qualifying
 * state would be unreachable.
 */
export const MOCK_USERS: MockUser[] = [
  { id: 'u-aiko', name: 'Aiko Tan', username: 'aiko.tan', avatarSrc: avatarAiko, holds: ['air'] },
  { id: 'u-arjun', name: 'Arjun Patel', username: 'arjun.patel', avatarSrc: avatarArjun, holds: ['falcon'] },
  { id: 'u-danielle', name: 'Danielle Okoro', username: 'danielle.okoro', avatarSrc: avatarDanielle, holds: ['raptor'] },
  { id: 'u-darius', name: 'Darius Cole', username: 'darius.cole', avatarSrc: avatarDarius, holds: ['maritime'] },
  { id: 'u-david', name: 'David Liang', username: 'david.liang', avatarSrc: avatarDavid, holds: ['trident'] },
  { id: 'u-emma', name: 'Emma Novak', username: 'emma.novak', avatarSrc: avatarEmma, holds: ['deepwater'] },
  { id: 'u-ethan', name: 'Ethan Brooks', username: 'ethan.brooks', avatarSrc: avatarEthan, holds: ['space', 'joint'] },
  { id: 'u-isabella', name: 'Isabella Cruz', username: 'isabella.cruz', avatarSrc: avatarIsabella, holds: ['dragon'] },
  { id: 'u-leila', name: 'Leila Haddad', username: 'leila.haddad', avatarSrc: avatarLeila, holds: ['falcon', 'joint'] },
  { id: 'u-lukas', name: 'Lukas Meyer', username: 'lukas.meyer', avatarSrc: avatarLukas, holds: ['aurora', 'northcom'] },
  { id: 'u-marco', name: 'Marco Rinaldi', username: 'marco.rinaldi', avatarSrc: avatarMarco, holds: ['casper'] },
  { id: 'u-sofia', name: 'Sofia Bauer', username: 'sofia.bauer', avatarSrc: avatarSofia, holds: ['air', 'maritime'] },
];

/** The acting admin — console chrome only, never counted. */
export const ACTING_ADMIN = {
  name: 'Leonard Riley',
  username: 'leonard.riley',
  avatarSrc: avatarLeonard,
};

/** The user whose Program assignment the subject-side host is editing. */
export const SUBJECT_USER = {
  name: 'Aiko Tan',
  username: 'aiko.tan',
  avatarSrc: avatarAiko,
  meta: 'Member · Air Operations Directorate · joined March 2024',
};

/** The channel the resource-side host is marking. */
export const RESOURCE_CHANNEL = {
  displayName: 'Raptor Flight Coordination',
  url: 'raptor-flight-coordination',
  purpose: 'Sortie planning and readiness reporting.',
};

/**
 * Who can actually enter, evaluated on the FULL graph — never the viewer-scoped
 * one. Access is decided server-side against the real hierarchy; a restricted
 * editor's narrower view must not narrow the answer.
 */
export function qualifyingUsers(selected: string[]): MockUser[] {
  if (selected.length === 0) return [];
  return MOCK_USERS.filter(
    (u) => reachabilityCoversAll(PROGRAM_GRAPH, u.holds, selected).pass,
  );
}

/**
 * For an admin viewer only: which held value satisfies each requirement. Not
 * exposed to a restricted viewer, because a user can qualify through an ancestor
 * that sits outside the restricted pool — naming it would leak a withheld value.
 */
export function qualifyingVia(user: MockUser, selected: string[]): string[] {
  const map = optionMap(PROGRAM_GRAPH);
  const via: string[] = [];
  for (const target of selected) {
    const held = user.holds.find((h) => covers(PROGRAM_GRAPH, h, target));
    if (held) via.push(map.get(held)?.label ?? held);
  }
  return [...new Set(via)];
}

// ─── Prose helpers ─────────────────────────────────────────────────────────────

/** "A", "A and B", "A, B and C". */
export function listLabels(labels: string[]): string {
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export interface Consequence {
  /** The load-bearing sentence. Rendered large; never behind a tooltip. */
  headline: string;
  /** One supporting sentence. Explains the mechanism, not the copy. */
  detail: string;
}

/**
 * P1/P2 · SUBJECT side — selecting a higher value grants MORE, and multiple
 * values are DISJUNCTIVE (the union of their down-sets).
 */
export function subjectConsequence(
  options: GraphOption[],
  selected: string[],
  personName: string,
): Consequence {
  const map = optionMap(options);
  const labels = labelsFor(options, selected);

  if (selected.length === 0) {
    return {
      headline: `No programs assigned — ${personName} can't reach anything that carries a ${FIELD_NAME} value.`,
      detail: `An empty set denies. There is no reading in which "no programs" means "all programs".`,
    };
  }

  if (selected.length === 1) {
    const id = selected[0];
    const label = map.get(id)?.label ?? id;
    const beneath = [...descendantsOf(options, id)];
    if (beneath.length === 0) {
      const rootLabels = listLabels(labelsFor(options, rootIdsOf(options, id)));
      return {
        headline: `Assigning ${label} gives access to ${label} only — nothing sits beneath it.`,
        detail: `${personName} reaches nothing else under ${rootLabels}, and nothing at all in the other hierarchies.`,
      };
    }
    if (beneath.length === 1) {
      return {
        headline: `Assigning ${label} gives access to ${label} and the single program beneath it.`,
        detail: `${personName} reaches ${listLabels([label, ...labelsFor(options, beneath)])}.`,
      };
    }
    return {
      headline: `Assigning ${label} gives access to all ${beneath.length} programs beneath it.`,
      detail: `${personName} reaches ${listLabels([label, ...labelsFor(options, beneath)])}.`,
    };
  }

  const reached = downSetOf(options, selected);
  return {
    headline: `${listLabels(labels)} add up — ${personName} reaches anything any one of them covers, which is ${reached.size} ${plural(reached.size, 'program', 'programs')} in total.`,
    detail: `On this side the values are additive: adding one only ever grants more, and nothing you add here can take access away.`,
  };
}

/**
 * P1/P2 · RESOURCE side — selecting a higher value makes the channel MORE
 * accessible, and multiple values are CONJUNCTIVE, so each one added NARROWS who
 * can enter. That inversion is the reason this is a sentence and not an icon.
 *
 * A restricted viewer never gets the exhaustive "…, Falcon Wing and Air
 * Operations holders" enumeration, even when nothing is in fact withheld from
 * them: the sentence shape has to be constant, or its shape becomes a signal
 * that something was withheld (P6).
 */
export function resourceConsequence(
  options: GraphOption[],
  selected: string[],
  viewer: ViewerMode,
): Consequence {
  const map = optionMap(options);
  const labels = labelsFor(options, selected);

  if (selected.length === 0) {
    return {
      headline: `No ${FIELD_NAME} value set — no one can enter this channel.`,
      detail: `${FIELD_NAME} is required on this channel. An empty value denies everyone; it does not allow everyone.`,
    };
  }

  if (selected.length === 1) {
    const id = selected[0];
    const label = map.get(id)?.label ?? id;
    const above = ancestorLabelsNearestFirst(options, id);

    if (viewer === 'restricted') {
      return {
        headline: `Marking this channel ${label} limits entry to holders of ${label} or any value above it.`,
        detail: `Being higher in a hierarchy always means more access, never less — so everything above ${label} gets in too.`,
      };
    }
    if (above.length === 0) {
      return {
        headline: `Marking this channel ${label} lets anyone with ${label} enter.`,
        detail: `${label} is the top of its hierarchy, so there is nothing above it that could widen entry further.`,
      };
    }
    return {
      headline: `Marking it ${label} limits it to ${listLabels([label, ...above])} holders.`,
      detail: `Being higher in a hierarchy always means more access, never less — so everything above ${label} gets in too.`,
    };
  }

  const conjunction =
    selected.length === 2
      ? `This channel requires both ${labels[0]} and ${labels[1]}. A user must hold each one, or something above it.`
      : `This channel requires all ${selected.length} of ${listLabels(labels)}. A user must hold each one, or something above it.`;

  return {
    headline: conjunction,
    detail: `Each value you add here narrows who can enter — it does not widen it. That is the opposite of how tags, categories and labels behave.`,
  };
}

/** The people-count line under the resource-side consequence. */
export function qualifyingSentence(count: number): string {
  if (count === 0) return 'No one currently qualifies.';
  if (count === 1) return '1 person currently qualifies.';
  return `${count} people currently qualify.`;
}

export interface NoticeCopy {
  title: string;
  description: string;
}

/** P3 · subject side — redundancy is harmless. Flag, offer a fix, never block. */
export function redundancyNotice(
  options: GraphOption[],
  pairs: DominatedPair[],
  personName: string,
): NoticeCopy | null {
  if (pairs.length === 0) return null;
  const map = optionMap(options);
  const nameOf = (id: string) => map.get(id)?.label ?? id;

  if (pairs.length === 1) {
    const { inertId, dominantId } = pairs[0];
    return {
      title: `${nameOf(inertId)} is already included by ${nameOf(dominantId)}`,
      description: `${nameOf(dominantId)} already covers everything beneath it, so ${nameOf(inertId)} grants nothing extra. Keeping it is fine — recording a specific read-on has audit value — and it changes nothing about what ${personName} can reach.`,
    };
  }
  const phrases = pairs.map(
    (p) => `${nameOf(p.inertId)} (already inside ${nameOf(p.dominantId)})`,
  );
  return {
    title: `${pairs.length} selected values are already included by others`,
    description: `${listLabels(phrases)}. Keeping them is fine — recording a specific read-on has audit value — and none of them changes what ${personName} can reach.`,
  };
}

/**
 * P3 · resource side — the same pair is dangerous. The ancestor dominates and
 * the restrictive-looking marking becomes inert while still being displayed.
 */
export function inertMarkingNotice(
  options: GraphOption[],
  pairs: DominatedPair[],
): NoticeCopy | null {
  if (pairs.length === 0) return null;
  const map = optionMap(options);
  const nameOf = (id: string) => map.get(id)?.label ?? id;
  const { inertId, dominantId } = pairs[0];
  const extra =
    pairs.length > 1
      ? ` The same is true of ${listLabels(pairs.slice(1).map((p) => nameOf(p.inertId)))}.`
      : '';

  return {
    title: `Adding ${nameOf(dominantId)} makes the ${nameOf(inertId)} marking ineffective — anyone with ${nameOf(dominantId)} can enter.`,
    description: `Requiring ${nameOf(dominantId)} means "${nameOf(dominantId)} or above". Requiring ${nameOf(inertId)} means "${nameOf(inertId)} or above". Everyone who satisfies the first already satisfies the second, so the effective requirement collapses to ${nameOf(dominantId)} or above. ${nameOf(inertId)} stays on the channel and stays visible, but it restricts nothing.${extra} Remove ${nameOf(dominantId)} to keep the tighter restriction, or remove ${nameOf(inertId)} so the marking matches what the channel actually enforces.`,
  };
}

/** P5 · make incomparability visible rather than leaving it to be inferred. */
export function crossHierarchyNotice(
  options: GraphOption[],
  selected: string[],
  side: PickerSide,
  personName: string,
): NoticeCopy | null {
  const roots = spannedRootIds(options, selected);
  if (selected.length < 2 || roots.length < 2) return null;
  const labels = labelsFor(options, selected);
  const rootLabels = labelsFor(options, roots);

  const title =
    selected.length === 2
      ? `${labels[0]} and ${labels[1]} are in different hierarchies`
      : `This selection spans ${roots.length} unrelated hierarchies`;

  const shared = `${listLabels(rootLabels)} are unrelated roots, so none of these values is above or below another — they are incomparable, which is normal and not an error.`;

  return {
    title,
    description:
      side === 'resource'
        ? `${shared} But every one of them is required, so only someone holding a value at or above each one can enter.`
        : `${shared} Here the grants simply add up: ${personName} gets everything under ${listLabels(labels)}.`,
  };
}

/** P3 · zero qualifying users on the resource side — explicit confirm required. */
export function zeroQualifyingNotice(
  options: GraphOption[],
  selected: string[],
): NoticeCopy {
  const labels = labelsFor(options, selected);
  return {
    title: 'No one can enter this channel as marked',
    description: `${listLabels(labels)} are all required, and no current user holds a value at or above each one. As marked, this channel would be unenterable. That is almost always an authoring mistake — if it is deliberate, confirm it.`,
  };
}

export const ZERO_QUALIFYING_CONFIRMED: NoticeCopy = {
  title: 'Confirmed — this channel is intentionally unenterable',
  description:
    'It will save as marked. Access starts working the moment someone is assigned a value at or above each requirement; nothing else needs to change here.',
};

export const LOAD_ERROR: NoticeCopy = {
  title: `Couldn't load the ${FIELD_NAME} hierarchy`,
  description: `The value list and the relationships between values could not be resolved. No relationships are assumed and no value can be set until it loads — there is no retry-to-allow path here.`,
};

// ─── Deep-link states ──────────────────────────────────────────────────────────

export type StateKey =
  | 'empty'
  | 'selected'
  | 'redundant'
  | 'inert-marking'
  | 'cross-tree'
  | 'zero-qualifying'
  | 'browse'
  | 'loading'
  | 'error';

export const STATE_KEYS: StateKey[] = [
  'empty',
  'selected',
  'redundant',
  'inert-marking',
  'cross-tree',
  'zero-qualifying',
  'browse',
  'loading',
  'error',
];

/**
 * Seeded selection per state, per viewer. Two columns, not one, because the
 * restricted pool genuinely cannot express some of the admin seeds — and a
 * silently-truncated seed would make a state look broken rather than scoped.
 *
 * Every seed is verified against MOCK_USERS:
 *   selected        {Falcon Wing}                       → 4 qualify
 *   inert-marking   {Air Operations, Raptor Flight}     → 2 qualify, collapses to Air-or-above
 *   cross-tree      {Falcon Wing, Trident Fleet}        → 1 qualifies
 *   cross-tree/r    {Falcon Wing, Operation Aurora}     → 1 qualifies
 *   zero-qualifying {Dragon Spacecraft, Northern Command} → 0 qualify
 *   zero/restricted {Air Operations, Operation Aurora}  → 0 qualify
 */
export const SEEDED_SELECTION: Record<
  StateKey,
  Record<ViewerMode, string[]>
> = {
  empty: { admin: [], restricted: [] },
  selected: { admin: ['falcon'], restricted: ['falcon'] },
  redundant: { admin: ['air', 'raptor'], restricted: ['air', 'raptor'] },
  'inert-marking': { admin: ['air', 'raptor'], restricted: ['air', 'raptor'] },
  'cross-tree': { admin: ['falcon', 'trident'], restricted: ['falcon', 'aurora'] },
  'zero-qualifying': {
    admin: ['dragon', 'northcom'],
    restricted: ['air', 'aurora'],
  },
  browse: { admin: ['falcon'], restricted: ['falcon'] },
  loading: { admin: ['falcon'], restricted: ['falcon'] },
  error: { admin: [], restricted: [] },
};

export const STATE_LABELS: Record<StateKey, string> = {
  empty: 'Empty — nothing selected',
  selected: 'One value selected',
  redundant: 'Redundant pair (subject reading)',
  'inert-marking': 'Inert marking (resource reading)',
  'cross-tree': 'Cross-hierarchy selection',
  'zero-qualifying': 'Zero qualifying users — confirm required',
  browse: 'Browse hierarchy open',
  loading: 'Loading',
  error: 'Fail-secure error',
};

// ─── Search + filter (P6 · absolute count suppression) ──────────────────────────

export interface PickerRow {
  option: GraphOption;
  /** Canonical breadcrumb, root-first, excluding the value itself. */
  path: string[];
  /** Non-canonical parents, in scope only. */
  alsoUnder: string[];
  /** Roots this value belongs to, in scope only. */
  rootIds: string[];
}

export function buildRows(options: GraphOption[]): PickerRow[] {
  return options.map((option) => ({
    option,
    path: canonicalPathLabels(options, option.id),
    alsoUnder: otherParentLabels(options, option.id),
    rootIds: rootIdsOf(options, option.id),
  }));
}

/**
 * Typeahead + root filter. Matching is over the value label and its canonical
 * path, so "air fal" finds Falcon Wing.
 *
 * There is no "+N more" and no total. A query that would have matched an
 * out-of-scope value returns the ordinary no-results state — never
 * "1 match hidden", which would confirm the value exists.
 */
export function filterRows(
  rows: PickerRow[],
  query: string,
  rootFilter: string | null,
): PickerRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (rootFilter != null && !row.rootIds.includes(rootFilter)) return false;
    if (q === '') return true;
    const haystack = [row.option.label, ...row.path, ...row.alsoUnder]
      .join(' ')
      .toLowerCase();
    return q.split(/\s+/).every((term) => haystack.includes(term));
  });
}

// ─── Browse-hierarchy projection (P7 secondary control) ─────────────────────────

export interface BrowseNode {
  option: GraphOption;
  depth: number;
  hasChildren: boolean;
  alsoUnder: string[];
}

/**
 * Flatten one root's subtree for the Browse pane. A `visited` set guarantees P4
 * inside the tree too: if a value is reachable by two paths within the same
 * root, it still renders once, at its first (canonical) occurrence, with its
 * other parents named on the "also under" line.
 */
export function flattenBrowseTree(
  options: GraphOption[],
  rootId: string,
  expanded: Set<string>,
): BrowseNode[] {
  const out: BrowseNode[] = [];
  const visited = new Set<string>();
  const map = optionMap(options);

  const walk = (id: string, depth: number) => {
    if (visited.has(id)) return;
    visited.add(id);
    const option = map.get(id);
    if (!option) return;
    const children = options.filter((o) => o.parentIds.includes(id));
    out.push({
      option,
      depth,
      hasChildren: children.length > 0,
      alsoUnder: otherParentLabels(options, id),
    });
    if (!expanded.has(id)) return;
    for (const child of children) walk(child.id, depth + 1);
  };

  walk(rootId, 0);
  return out;
}

/** Every value id in a root's subtree — the default expanded set. */
export function subtreeIds(options: GraphOption[], rootId: string): string[] {
  return [rootId, ...descendantsOf(options, rootId)];
}
