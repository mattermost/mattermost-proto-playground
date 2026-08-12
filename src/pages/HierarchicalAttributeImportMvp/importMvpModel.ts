/**
 * Lightweight inline import — data + validation model. [AI DRAFT]
 *
 * NET-NEW glue for the P0 lightweight import variation. It does NOT rebuild the
 * DAG math and it does NOT edit any existing prototype. It re-uses (read-only):
 *   - `SEED_V2` + `wouldCreateCycle` from the RD-C authoring model
 *     (`HierarchicalAttributeAuthoringV2/graphAuthoringModel`), and
 *   - `depthOf` + `DEPTH_LIMIT` from the base graph math
 *     (`HierarchicalAttributeAuthoring/graphModel`).
 *
 * What lives here is only:
 *   - two CANNED "file" payloads (there is no backend / no live pull — this is an
 *     air-gapped IL5 file pick, faked with in-memory edge-lists), and
 *   - a single all-or-nothing `validateImport` that walks the WHOLE payload and
 *     reports every structural problem (cycle / duplicate label / unknown parent)
 *     without ever partially applying a broken graph.
 */
import {
  SEED_V2,
  wouldCreateCycle,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import {
  depthOf,
  DEPTH_LIMIT,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';

/** One parsed row of an imported edge-list "file". */
export interface ImportRow {
  id: string;
  label: string;
  parentIds: string[];
}

export type PayloadKey = 'clean' | 'violations';

export interface CannedPayload {
  key: PayloadKey;
  /** File name shown in the pick affordance + confirmation copy. */
  fileName: string;
  /** One-line human description of what's in the file (demo band only). */
  kindLabel: string;
  rows: ImportRow[];
}

// ── Canned payloads ────────────────────────────────────────────────────────────
// The clean file is the trimmed 14-node Programs seed. The violations file is the
// same seed with exactly three planted problems so the inline error reads
// "1 loop, 1 duplicate name, 1 unknown parent".

const CLEAN_ROWS: ImportRow[] = SEED_V2.map((o) => ({
  id: o.id,
  label: o.label,
  parentIds: [...o.parentIds],
}));

function buildViolationRows(): ImportRow[] {
  const rows: ImportRow[] = CLEAN_ROWS.map((r) => ({
    id: r.id,
    label: r.label,
    parentIds: [...r.parentIds],
  }));

  // (1) Cycle — give the top-level "Air Operations" a parent that sits below it
  //     (Raptor Flight), closing Air → Falcon Wing → Raptor Flight → Air.
  const air = rows.find((r) => r.id === 'air');
  if (air) air.parentIds = ['raptor'];

  // (2) Duplicate label — a second value literally named "Raptor Flight".
  rows.push({ id: 'raptor-2', label: 'Raptor Flight', parentIds: ['falcon'] });

  // (3) Unknown parent — points at an id that isn't defined anywhere in the file.
  rows.push({ id: 'ghost', label: 'Ghost Unit', parentIds: ['does-not-exist'] });

  return rows;
}

export const CLEAN_PAYLOAD: CannedPayload = {
  key: 'clean',
  fileName: 'programs.json',
  kindLabel: 'Clean edge-list · 14 values',
  rows: CLEAN_ROWS,
};

export const VIOLATIONS_PAYLOAD: CannedPayload = {
  key: 'violations',
  fileName: 'programs-draft.json',
  kindLabel: 'Draft with problems · 1 loop, 1 duplicate, 1 unknown parent',
  rows: buildViolationRows(),
};

export const PAYLOADS: Record<PayloadKey, CannedPayload> = {
  clean: CLEAN_PAYLOAD,
  violations: VIOLATIONS_PAYLOAD,
};

// ── Validation (all-or-nothing) ─────────────────────────────────────────────────

export interface ImportProblems {
  /** 1 if any loop exists among the values, else 0 (kept coarse on purpose). */
  cycles: number;
  /** Count of labels that appear on more than one value. */
  duplicates: number;
  /** Count of parent references that point at an id not in the file. */
  orphans: number;
  /** Count of values that would exceed the depth limit. */
  tooDeep: number;
  /** Short, human, one-per-line problem lines for the compact inline error. */
  details: string[];
}

export type ImportResult =
  | { ok: true; options: GraphOption[]; count: number }
  | { ok: false; problems: ImportProblems };

/** Turn parsed rows into the graph options the tree renders. */
export function toOptions(rows: ImportRow[]): GraphOption[] {
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    parentIds: [...r.parentIds],
    inUseCount: 0,
    policyRefCount: 0,
    source: 'manual' as const,
  }));
}

/**
 * Validate the WHOLE payload. Fail-closed and all-or-nothing: if any structural
 * problem is found, nothing is returned to apply. Re-uses `wouldCreateCycle`
 * (loop detection) and `depthOf` / `DEPTH_LIMIT` (depth ceiling) from the shared
 * model rather than re-deriving the DAG math here.
 */
export function validateImport(rows: ImportRow[]): ImportResult {
  const ids = new Set(rows.map((r) => r.id));
  const details: string[] = [];

  // Unknown (orphan) parents — a parent id not defined by any row in the file.
  let orphans = 0;
  for (const r of rows) {
    for (const p of r.parentIds) {
      if (!ids.has(p)) {
        orphans += 1;
        details.push(`Unknown parent — “${r.label}” points at a value that isn't in the file.`);
      }
    }
  }

  // Duplicate labels — same display name on more than one value.
  const byLabel = new Map<string, number>();
  for (const r of rows) {
    const key = r.label.trim().toLowerCase();
    byLabel.set(key, (byLabel.get(key) ?? 0) + 1);
  }
  let duplicates = 0;
  for (const [, n] of byLabel) if (n > 1) duplicates += 1;
  if (duplicates > 0) {
    const dupLabels = rows
      .filter((r) => (byLabel.get(r.label.trim().toLowerCase()) ?? 0) > 1)
      .map((r) => r.label);
    const unique = [...new Set(dupLabels)];
    details.push(
      `Duplicate name — ${unique.map((l) => `“${l}”`).join(', ')} is used more than once.`,
    );
  }

  // Loops — build the graph over KNOWN parents only, then ask the shared cycle
  // checker whether any edge closes a loop. Reported coarsely as 1 loop / 0.
  const options = toOptions(
    rows.map((r) => ({
      ...r,
      parentIds: r.parentIds.filter((p) => ids.has(p)),
    })),
  );
  const hasLoop = options.some((o) =>
    o.parentIds.some((p) => wouldCreateCycle(options, o.id, p)),
  );
  const cycles = hasLoop ? 1 : 0;
  if (hasLoop) {
    details.push('Loop — some values reference each other in a circle.');
  }

  // Depth ceiling (kept for parity with the heavyweight flow; the seed never hits it).
  let tooDeep = 0;
  for (const o of options) {
    if (depthOf(options, o.id) > DEPTH_LIMIT) {
      tooDeep += 1;
    }
  }
  if (tooDeep > 0) {
    details.push(`Too deep — ${tooDeep} value(s) exceed the depth limit of ${DEPTH_LIMIT}.`);
  }

  if (orphans > 0 || duplicates > 0 || cycles > 0 || tooDeep > 0) {
    return { ok: false, problems: { cycles, duplicates, orphans, tooDeep, details } };
  }

  return { ok: true, options: toOptions(rows), count: rows.length };
}

/** Compact one-line summary of the problem counts for the error headline. */
export function problemSummary(p: ImportProblems): string {
  const parts: string[] = [];
  if (p.cycles > 0) parts.push(`${p.cycles} loop`);
  if (p.duplicates > 0) {
    parts.push(`${p.duplicates} duplicate ${p.duplicates === 1 ? 'name' : 'names'}`);
  }
  if (p.orphans > 0) {
    parts.push(`${p.orphans} unknown ${p.orphans === 1 ? 'parent' : 'parents'}`);
  }
  if (p.tooDeep > 0) parts.push(`${p.tooDeep} too deep`);
  return parts.join(', ');
}
