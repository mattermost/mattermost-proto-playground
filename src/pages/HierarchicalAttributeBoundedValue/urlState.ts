/**
 * Deep-link vocabulary for the Bounded Value prototype.
 *
 *   ?surface = post | channel | setup
 *   ?state   = inherited | explicit | rejected | cap-unresolved | conflict | graph-cap
 *   ?scheme  = levels | programs
 *   ?demo    = off        (hides the prototype band)
 *
 * `graph-cap` pins `scheme` to `programs` — it exists to exercise the "within"
 * semantics of a graph field, which only the Programs list has. Every other
 * state honours `?scheme` as given.
 *
 * Not every state is meaningful on every surface. A surface declares the states
 * it honours; an out-of-range state falls back to that surface's first state,
 * and the demo band says so rather than silently rendering the wrong thing.
 */

import type { SchemeKey } from './boundsModel';

export type SurfaceKey = 'post' | 'channel' | 'setup';

export type StateKey =
  | 'inherited'
  | 'explicit'
  | 'rejected'
  | 'cap-unresolved'
  | 'conflict'
  | 'graph-cap';

export const SURFACE_OPTIONS: Array<{ value: SurfaceKey; label: string }> = [
  { value: 'post', label: 'Post composer — author in a channel' },
  { value: 'channel', label: 'Channel settings — the channel’s own value' },
  { value: 'setup', label: 'Attribute setup — System Console' },
];

export const STATE_LABELS: Record<StateKey, string> = {
  inherited: 'Inherited — nothing stored on the post',
  explicit: 'Explicit — a value is stored',
  rejected: 'Rejected write — above the cap',
  'cap-unresolved': 'Cap unresolvable — fail-closed',
  conflict: 'Parent drops below children — blocked',
  'graph-cap': 'Graph cap — “within” semantics (Programs)',
};

export const STATES_BY_SURFACE: Record<SurfaceKey, StateKey[]> = {
  post: ['inherited', 'explicit', 'rejected', 'cap-unresolved', 'graph-cap'],
  channel: ['explicit', 'conflict', 'cap-unresolved', 'graph-cap'],
  setup: ['inherited', 'explicit', 'cap-unresolved', 'graph-cap'],
};

export function parseSurface(raw: string | null): SurfaceKey {
  return raw === 'channel' || raw === 'setup' ? raw : 'post';
}

export function resolveState(
  surface: SurfaceKey,
  raw: string | null,
): { state: StateKey; fellBack: boolean } {
  const allowed = STATES_BY_SURFACE[surface];
  if (raw && (allowed as string[]).includes(raw)) {
    return { state: raw as StateKey, fellBack: false };
  }
  return { state: allowed[0], fellBack: raw != null };
}

/** `graph-cap` pins the Programs list; everything else honours `?scheme`. */
export function resolveSchemeKey(
  state: StateKey,
  raw: string | null,
): SchemeKey {
  if (state === 'graph-cap') return 'programs';
  return raw === 'programs' ? 'programs' : 'levels';
}
