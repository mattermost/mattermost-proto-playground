// [AI DRAFT] The explanation built from the rules, and the placements under
// test (round 2, M7, plus the designer's Sections rail). Components live in Explain.tsx.
import { directionOf, type Direction } from '../model/direction';
import { allRules, isIncomplete, prune, readback, type Group, type Policy, type Readback } from '../model/rules';
import type { Vocabulary } from '../model/vocabulary';
import { READBACK } from '../copy';

export type ExplainPlacement = 'rail' | 'button' | 'summary' | 'views' | 'permissions' | 'savebar' | 'panel';

/** Reviewer chrome (the switch above the frame), not product copy. */
export const EXPLAIN_PLACEMENTS: { value: ExplainPlacement; label: string }[] = [
  { value: 'rail', label: 'Sections rail (designer)' },
  { value: 'summary', label: 'Live summary (loop pick)' },
  { value: 'button', label: 'Button (round 1)' },
  { value: 'views', label: 'Three views' },
  { value: 'permissions', label: 'In Permissions' },
  { value: 'savebar', label: 'Save bar' },
  { value: 'panel', label: 'Side panel' },
];

export function explainPlacementFromParam(v: string | null): ExplainPlacement {
  // The designer's Sections rail is the default (2026-10-31): it lifts the
  // Live summary's two-line cap and collapsed barrier list, the limits that
  // held it at 4 (10-explain-loop/designer-rail-comparison.md).
  return EXPLAIN_PLACEMENTS.some((p) => p.value === v) ? (v as ExplainPlacement) : 'rail';
}

export interface Explanation {
  /** The one sentence every placement leads with. */
  sentence: string;
  rb: Readback | null;
  direction: Direction;
  /** Nothing written yet: a rule tree with no complete rules. */
  pending: boolean;
}

export function explain(
  policy: Policy,
  vocab: Vocabulary,
  root: Group | null,
  { error = false, rulesError = false }: { error?: boolean; rulesError?: boolean } = {},
): Explanation {
  // Rules with no value yet are left out, and counted (CON4-2).
  const usable = root ? prune(root) : null;
  const dropped = root ? allRules(root).filter(isIncomplete).length : 0;
  const rb = usable && !rulesError ? readback({ ...policy, root: usable }, vocab) : null;
  const direction = usable && !rulesError ? directionOf(usable, policy.permissions, policy.role) : null;
  const base = rulesError ? READBACK.fixRules : rb ? rb.sentence : error ? READBACK.fixFirst : READBACK.noReadback;
  return {
    sentence: `${base}${dropped ? ` ${READBACK.orphaned(dropped)}` : ''}`,
    rb,
    direction,
    // With rules but no permissions, the readback says so (UX1-4). An
    // expression the builder can't turn into rules isn't "nothing written":
    // its sentence is the caution (UX2-1).
    pending: Boolean(usable) && usable!.children.length === 0,
  };
}

export function hasDetails(e: Explanation): boolean {
  return Boolean(e.rb?.denied || e.rb?.deniedList || e.direction === 'one-way');
}

