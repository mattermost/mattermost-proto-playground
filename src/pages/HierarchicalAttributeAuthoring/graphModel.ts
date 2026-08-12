/**
 * Graph (Hierarchical) Attribute Type — local authoring data model.
 *
 * NET-NEW for this prototype. The Attribute Management hub's `AttrValue` carries
 * a `tier` + display-only `children` but has NO real parent-pointer / DAG. This
 * module supplies a true edge/parent model (multi-parent, cycle-aware, depth-
 * aware) so the authoring surface can demonstrate SD-1 (Roster) and SD-3
 * (Ledger + Map). It does NOT edit hubData.ts.
 *
 * Canonical example: programs at dozens-scale (7 roots × 5–10 children).
 * No customer identities — codenames only (Dragon Spacecraft, Operation Aurora,
 * Northern Command, …). At least one genuine multi-parent node ("Mission Casper"
 * under both Dragon Spacecraft and Aurora Recon) plus a cross-command overlay
 * ("JTF Sentinel" under both Operation Aurora and Northern Command).
 */

export const DEPTH_LIMIT = 100;
export const PARENT_LIMIT = 100;
export const OPTION_LIMIT = 100_000;
export const EDGE_LIMIT = 1_000_000;

export type OptionSource = 'manual' | 'linked' | 'uas';

export interface GraphOption {
  id: string;
  label: string;
  /** Palette CSS custom property (never a raw hex) — used for the color swatch. */
  color?: string;
  /** Parent option ids. A root holds []. Multi-parent = length > 1. */
  parentIds: string[];
  /** How many resources currently carry this value. */
  inUseCount: number;
  /** Active policies referencing this option — gates rename (A5) + delete (A4). */
  policyRefCount: number;
  /** Policies referencing it that the acting DGA manager does NOT own (F-6). */
  crossOwnerPolicyCount?: number;
  /** Disabled for new assignment (kept for existing). */
  disabled?: boolean;
  /** Where the option comes from. `linked` = inherited read-only (A7/A9). */
  source?: OptionSource;
}

export interface GraphEdge {
  parentId: string;
  childId: string;
}

// ─── Derivations ──────────────────────────────────────────────────────────────

export function optionMap(options: GraphOption[]): Map<string, GraphOption> {
  return new Map(options.map((o) => [o.id, o]));
}

/** Every parent→child edge derived from the parentIds pointers. */
export function edgesOf(options: GraphOption[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  for (const o of options) {
    for (const p of o.parentIds) {
      edges.push({ parentId: p, childId: o.id });
    }
  }
  return edges;
}

export function childrenOf(options: GraphOption[], id: string): GraphOption[] {
  return options.filter((o) => o.parentIds.includes(id));
}

export function parentsOf(options: GraphOption[], id: string): GraphOption[] {
  const map = optionMap(options);
  const self = map.get(id);
  if (!self) return [];
  return self.parentIds
    .map((p) => map.get(p))
    .filter((o): o is GraphOption => o != null);
}

export function isRoot(o: GraphOption): boolean {
  return o.parentIds.length === 0;
}

export function rootsOf(options: GraphOption[]): GraphOption[] {
  return options.filter(isRoot);
}

/** All ancestors of `id` (transitive parents), excluding self. */
export function ancestorsOf(options: GraphOption[], id: string): Set<string> {
  const map = optionMap(options);
  const seen = new Set<string>();
  const stack = [...(map.get(id)?.parentIds ?? [])];
  while (stack.length) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const p of map.get(cur)?.parentIds ?? []) stack.push(p);
  }
  return seen;
}

/** All descendants of `id` (transitive children), excluding self. */
export function descendantsOf(options: GraphOption[], id: string): Set<string> {
  const seen = new Set<string>();
  const stack = childrenOf(options, id).map((c) => c.id);
  while (stack.length) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const c of childrenOf(options, cur)) stack.push(c.id);
  }
  return seen;
}

/**
 * Would adding parent `parentId` to `childId` create a cycle?
 * The edge parent→child is a loop iff parent === child, or parent is already a
 * descendant of child (so the graph would reach back to itself).
 */
export function wouldCreateCycle(
  options: GraphOption[],
  childId: string,
  parentId: string,
): boolean {
  if (childId === parentId) return true;
  return descendantsOf(options, childId).has(parentId);
}

/** Longest root→node path length (a root is depth 1). Memoized per call. */
export function depthOf(options: GraphOption[], id: string): number {
  const map = optionMap(options);
  const memo = new Map<string, number>();
  const visiting = new Set<string>();
  const walk = (cur: string): number => {
    if (memo.has(cur)) return memo.get(cur)!;
    if (visiting.has(cur)) return 1; // defensive: cycle guard
    visiting.add(cur);
    const parents = map.get(cur)?.parentIds ?? [];
    const d = parents.length === 0 ? 1 : 1 + Math.max(...parents.map(walk));
    visiting.delete(cur);
    memo.set(cur, d);
    return d;
  };
  return walk(id);
}

/** Deepest node depth reachable from `id` downward (id itself + descendants). */
export function subtreeMaxDepthAfterReparent(
  options: GraphOption[],
  childId: string,
  candidateParentId: string,
): number {
  // depth the child would land at, plus the height of its own subtree.
  const parentDepth = depthOf(options, candidateParentId);
  const childHeight = subtreeHeight(options, childId);
  return parentDepth + childHeight; // parentDepth already counts the parent node
}

function subtreeHeight(options: GraphOption[], id: string): number {
  const kids = childrenOf(options, id);
  if (kids.length === 0) return 1;
  return 1 + Math.max(...kids.map((k) => subtreeHeight(options, k.id)));
}

// ─── Reachability (policy covers* semantics, previewed at authoring time) ──────

export interface ReachabilityResult {
  pass: boolean;
  covered: string[];
  uncovered: string[];
}

/** `u` covers `t` iff t is at-or-below u (u is an ancestor-or-self of t). */
export function covers(
  options: GraphOption[],
  userId: string,
  targetId: string,
): boolean {
  if (userId === targetId) return true;
  return descendantsOf(options, userId).has(targetId);
}

/**
 * coversAll — every target is covered by at least one held user option
 * (the standard program-access rule). Empty side = deny (no vacuous truth).
 */
export function reachabilityCoversAll(
  options: GraphOption[],
  userSet: string[],
  targetSet: string[],
): ReachabilityResult {
  if (userSet.length === 0 || targetSet.length === 0) {
    return { pass: false, covered: [], uncovered: [...targetSet] };
  }
  const covered: string[] = [];
  const uncovered: string[] = [];
  for (const t of targetSet) {
    const ok = userSet.some((u) => covers(options, u, t));
    (ok ? covered : uncovered).push(t);
  }
  return { pass: uncovered.length === 0, covered, uncovered };
}

export function labelOf(options: GraphOption[], id: string): string {
  return optionMap(options).get(id)?.label ?? id;
}

// ─── Parent-set validation (A3 inline rejection) ───────────────────────────────

export type ParentRejectionKind = 'cycle' | 'depth' | 'parent-limit';

export interface ParentRejection {
  kind: ParentRejectionKind;
  message: string;
}

/** Validate adding `candidateParentId` as a parent of `childId`. */
export function validateAddParent(
  options: GraphOption[],
  childId: string,
  candidateParentId: string,
): ParentRejection | null {
  const child = optionMap(options).get(childId);
  if (!child) return null;

  if (wouldCreateCycle(options, childId, candidateParentId)) {
    const c = labelOf(options, childId);
    const p = labelOf(options, candidateParentId);
    return {
      kind: 'cycle',
      message: `'${p}' can't be a parent of '${c}' — that would create a loop (${c} → … → ${p} → ${c}).`,
    };
  }

  const projected = subtreeMaxDepthAfterReparent(
    options,
    childId,
    candidateParentId,
  );
  if (projected > DEPTH_LIMIT) {
    return {
      kind: 'depth',
      message: `Adding this parent pushes '${labelOf(options, childId)}' to depth ${projected}; the limit is ${DEPTH_LIMIT}.`,
    };
  }

  if (child.parentIds.length + 1 > PARENT_LIMIT) {
    return {
      kind: 'parent-limit',
      message: `An option can have at most ${PARENT_LIMIT} parents.`,
    };
  }

  return null;
}

// ─── Delete gate (A4 — two independent, distinct reasons) ──────────────────────

export interface DeleteGate {
  blocked: boolean;
  hasChildrenReason: string | null;
  policyReason: string | null;
}

export function deleteGateFor(
  options: GraphOption[],
  id: string,
): DeleteGate {
  const kids = childrenOf(options, id);
  const opt = optionMap(options).get(id);
  const hasChildrenReason =
    kids.length > 0
      ? `'${labelOf(options, id)}' has ${kids.length} child ${
          kids.length === 1 ? 'option' : 'options'
        } — re-parent them first.`
      : null;
  const policyReason =
    opt && opt.policyRefCount > 0
      ? `'${labelOf(options, id)}' is referenced by ${opt.policyRefCount} active ${
          opt.policyRefCount === 1 ? 'policy' : 'policies'
        } — update those policies first.`
      : null;
  return {
    blocked: hasChildrenReason != null || policyReason != null,
    hasChildrenReason,
    policyReason,
  };
}

// ─── Seed data (programs · dozens-scale · codenames only) ───────────────────────

const C = {
  air: 'var(--color-blue-400)',
  sea: 'var(--color-cyan-400)',
  space: 'var(--color-indigo-400)',
  op: 'var(--color-purple-400)',
  north: 'var(--color-teal-400)',
  cyber: 'var(--color-green-500)',
  ground: 'var(--color-orange-500)',
} as const;

/** The shared Option pool. User-field and channel-field both draw from this. */
export const SEED_OPTIONS: GraphOption[] = [
  // 1 — Air Operations
  opt('air', 'Air Operations', C.air, [], 0, 1),
  opt('fighter-jet', 'Fighter Jet', C.air, ['air'], 6, 2),
  opt('f18', 'F-18 Program', C.air, ['fighter-jet'], 18, 2, { cross: 1 }),
  opt('f22', 'F-22 Program', C.air, ['fighter-jet'], 12, 1),
  opt('f35', 'F-35 Program', C.air, ['fighter-jet'], 9, 0),
  opt('rotary', 'Rotary Wing', C.air, ['air'], 4, 0),
  opt('apache', 'Apache', C.air, ['rotary'], 7, 0),
  opt('blackhawk', 'Blackhawk', C.air, ['rotary'], 5, 0),
  opt('tanker', 'Tanker', C.air, ['air'], 2, 0),
  opt('tanker-sqd', 'Tanker Squadron 9', C.air, ['tanker'], 3, 0),

  // 2 — Maritime Operations
  opt('maritime', 'Maritime Operations', C.sea, [], 0, 1),
  opt('carrier', 'Carrier Group', C.sea, ['maritime'], 3, 1),
  opt('carrier-alpha', 'Carrier Alpha', C.sea, ['carrier'], 11, 0),
  opt('carrier-bravo', 'Carrier Bravo', C.sea, ['carrier'], 8, 0),
  opt('carrier-charlie', 'Carrier Charlie', C.sea, ['carrier'], 4, 0),
  opt('sub', 'Submarine Force', C.sea, ['maritime'], 2, 1),
  opt('sub-nautilus', 'Sub Nautilus', C.sea, ['sub'], 6, 0),

  // 3 — Space Operations
  opt('space', 'Space Operations', C.space, [], 0, 0),
  opt('dragon', 'Dragon Spacecraft', C.space, ['space'], 5, 2),
  opt('vega', 'Mission Vega', C.space, ['dragon'], 4, 0),
  opt('orion', 'Mission Orion', C.space, ['dragon'], 3, 0),
  opt('orbital', 'Orbital Relay', C.space, ['space'], 2, 0),
  opt('relay-north', 'Relay North', C.space, ['orbital'], 3, 0),

  // 4 — Operation Aurora
  opt('aurora', 'Operation Aurora', C.op, [], 0, 3),
  opt('aurora-recon', 'Aurora Recon', C.op, ['aurora'], 4, 1),
  opt('aurora-log', 'Aurora Logistics', C.op, ['aurora'], 6, 0),
  // multi-parent: Mission Casper under BOTH Dragon Spacecraft and Aurora Recon
  opt('casper', 'Mission Casper', C.op, ['dragon', 'aurora-recon'], 9, 2, {
    cross: 1,
  }),

  // 5 — Northern Command
  opt('northcom', 'Northern Command', C.north, [], 0, 2),
  opt('arctic', 'Arctic Watch', C.north, ['northcom'], 5, 1),
  opt('arctic-alpha', 'Arctic Patrol Alpha', C.north, ['arctic'], 7, 0),
  opt('arctic-bravo', 'Arctic Patrol Bravo', C.north, ['arctic'], 4, 0),
  opt('border', 'Border Shield', C.north, ['northcom'], 3, 0),
  // cross-command overlay: JTF Sentinel under BOTH Aurora and Northern Command
  opt('jtf-sentinel', 'JTF Sentinel', C.op, ['aurora', 'northcom'], 6, 1, {
    cross: 1,
  }),

  // 6 — Cyber Operations
  opt('cyber', 'Cyber Operations', C.cyber, [], 0, 1),
  opt('netdef', 'Network Defense', C.cyber, ['cyber'], 8, 1),
  opt('threat-hunt', 'Threat Hunt', C.cyber, ['netdef'], 5, 0),
  opt('mal-lab', 'Malware Lab', C.cyber, ['netdef'], 3, 0),
  opt('signals', 'Signals', C.cyber, ['cyber'], 4, 0),
  opt('sigint', 'SIGINT Team', C.cyber, ['signals'], 6, 0),

  // 7 — Ground Forces
  opt('ground', 'Ground Forces', C.ground, [], 0, 0),
  opt('armor', 'Armor Brigade', C.ground, ['ground'], 5, 0),
  opt('armor-b1', 'Armor Battalion 1', C.ground, ['armor'], 9, 0),
  opt('infantry', 'Infantry', C.ground, ['ground'], 4, 0),
  opt('inf-b3', 'Infantry Battalion 3', C.ground, ['infantry'], 8, 0),
  opt('inf-b4', 'Infantry Battalion 4', C.ground, ['infantry'], 6, 0),
];

function opt(
  id: string,
  label: string,
  color: string,
  parentIds: string[],
  inUseCount: number,
  policyRefCount: number,
  extra?: { cross?: number; disabled?: boolean; source?: OptionSource },
): GraphOption {
  return {
    id,
    label,
    color,
    parentIds,
    inUseCount,
    policyRefCount,
    crossOwnerPolicyCount: extra?.cross,
    disabled: extra?.disabled,
    source: extra?.source ?? 'manual',
  };
}

/** Multi-parent ids for the "appears under N parents" badge. */
export function multiParentIds(options: GraphOption[]): string[] {
  return options.filter((o) => o.parentIds.length > 1).map((o) => o.id);
}
