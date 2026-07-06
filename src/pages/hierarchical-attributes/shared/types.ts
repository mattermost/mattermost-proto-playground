// Phase 6 prototype types — Ranked v1.0.
// Top of list = highest precedence (Phase 1 Q6 / Phase 4 Q1-C1 lock).
//
// 2026-05-22 PM+Eng sync overrides:
//  - Colors removed from scope (chips render neutral; `color` field retained
//    on the data shape for forward-compat with v1.1 colors-revisit).
//  - Ties removed from scope (ranks must be unique, non-zero, explicit).
//    `groupByTiedBand` is deprecated and retained only for the D2 prototype.
//    D1 surfaces no longer call it.

/**
 * @deprecated 2026-05-22 — color was descoped for Ranked v1.0. The field
 * still exists on data records and Select rows (non-ranked) so v1.1 can
 * restore it without a schema migration, but `RankedValueChip` ignores it.
 */
export type ChipColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'neutral';

export interface RankedValue {
  /** Stable id for the option. Backend B-1: option in a select. */
  id: string;
  /** Display label, e.g., "Top Secret". */
  label: string;
  /**
   * Integer rank per Krauser B-1. Higher = higher rank (B-2).
   *
   * Per the 2026-05-22 sync, ranks are required to be unique, explicit,
   * and >= 1. Zero and missing ranks are rejected at the editor layer.
   * The type stays optional only because old prototype snapshots may
   * not satisfy the invariant yet.
   */
  rank?: number;
  /**
   * @deprecated 2026-05-22 — descoped for Ranked v1.0; the chip renders
   * a single neutral tone. Field retained on the data shape for v1.1.
   */
  color?: ChipColor;
}

export interface RankedSchema {
  id: string;
  /** Attribute name, e.g., "User.Clearance". */
  attributeName: string;
  /** Schema version per FR-4. Mints on save; prior versions immutable. */
  version: number;
  /** Source of truth: locally authored vs UAS-sourced read-only (Story 2 / FR-5). */
  source: 'local' | 'uas';
  /** UAS provenance metadata when source = 'uas'. */
  provenance?: {
    pluginName: string;
    lastSyncRelative: string;
    lastSyncAbsolute: string;
    lastKnownGoodRelative: string;
    lastKnownGoodAbsolute: string;
  };
  values: RankedValue[];
  /** When true, this schema is being demonstrated in a state-matrix card. */
  demoOnly?: boolean;
}

/** Sort values for rendering. Top of list = highest rank (Q1-C1 lock). */
export function sortByRankDesc(values: RankedValue[]): RankedValue[] {
  return [...values].sort((a, b) => {
    const ra = a.rank ?? 0;
    const rb = b.rank ?? 0;
    if (rb !== ra) return rb - ra;
    return a.label.localeCompare(b.label);
  });
}

/** Next integer for a new value per B-6: max(existing) + 1, minimum 1. */
export function nextRank(values: RankedValue[]): number {
  if (values.length === 0) return 1;
  return Math.max(...values.map((v) => v.rank ?? 0)) + 1;
}

/**
 * @deprecated 2026-05-22 — ties are no longer in scope for Ranked v1.0
 * (PM+Eng sync: unique-explicit-required). This function is retained only
 * to keep the D2 prototype compiling; consumers in D1 surfaces have been
 * removed. D2 will be retired in the spec markdown.
 *
 * Behavior is a no-op for non-tied datasets: when every rank is unique
 * (the v1.0 invariant), each group has exactly one member, so the result
 * is equivalent to `sortByRankDesc(values).map((v) => [v])`.
 */
export function groupByTiedBand(values: RankedValue[]): RankedValue[][] {
  const sorted = sortByRankDesc(values);
  const groups: RankedValue[][] = [];
  let current: RankedValue[] = [];
  let currentRank: number | null = null;
  for (const v of sorted) {
    const r = v.rank ?? 0;
    if (currentRank === null || r === currentRank) {
      current.push(v);
      currentRank = r;
    } else {
      groups.push(current);
      current = [v];
      currentRank = r;
    }
  }
  if (current.length) groups.push(current);
  return groups;
}

/**
 * Returns the set of ranks already in use by other values (excluding the
 * one being edited). Used by the modal to enforce uniqueness on rank edits.
 */
export function usedRanks(
  values: RankedValue[],
  excludeId?: string,
): Set<number> {
  const set = new Set<number>();
  for (const v of values) {
    if (excludeId && v.id === excludeId) continue;
    if (typeof v.rank === 'number') set.add(v.rank);
  }
  return set;
}
