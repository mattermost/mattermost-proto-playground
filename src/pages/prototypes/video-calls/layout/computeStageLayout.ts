/**
 * Pure stage-layout model for the video call prototype. No React, no DOM.
 *
 * Imports are relative with explicit `.ts` extensions (no `@/` alias) so the
 * module also runs under `node --experimental-strip-types` for the check
 * script next to it.
 *
 * The model returns explicit ROWS of cell ids (participant ids plus
 * `OVERFLOW_CELL` for the "+N" chip). The stage renders every tile in one flat
 * keyed list and places it with CSS grid lines derived from these rows, so a
 * layout change never reparents or remounts a tile.
 *
 * ── Grid view rows (cells = tiles + chip) ───────────────────────────────────
 * Picked by screenshot in a ~1200x560 stage, favouring tiles near 16:9 and a
 * centred short last row (Figma: 3 people = 2 on top + 1 centred):
 *   1 → [1]        2 → [2]        3 → [2,1]      4 → [2,2]      5 → [3,2]
 *   6 → [3,3]      7 → [4,3]      8 → [4,4]      9 → [3,3,3]   10 → [4,3,3]
 * 10 uses three rows: 4+3+3 gives ~290x175 tiles (1.66:1) vs 5+5 at ~230x270
 * (portrait), and keeps every tile at least as large as the 9-up grid's height.
 *
 * ── Speaker view, 3+ people ─────────────────────────────────────────────────
 * One large featured tile (the active speaker) under a horizontal strip of
 * everyone else. The strip is a single row up to `STRIP_ROW_MAX` cells and
 * two centred rows beyond that (see `stripRowSizes`). Self stays in the strip.
 * 2 people in speaker view = remote large + self picture-in-picture.
 *
 * ── Ordering rules (deterministic) ──────────────────────────────────────────
 * - Base order is the `participants` order (join order). Self keeps its index.
 * - Grid view always displays visible tiles in base order. Talking never
 *   reorders a grid.
 * - When there are more participants than cells (`maxVisible`, default 10),
 *   `maxVisible - 1` tiles show plus a "+N" overflow chip. Self, the presenter
 *   (share) and the active speaker are required members of the visible set.
 *   Membership is sticky: with `previous`, the previous visible set is kept and
 *   the active speaker is promoted ONLY when not already visible, by replacing
 *   the last non-required tile of the previous set.
 * - Speaker view: on a speaker change with a previous speaker layout, the old
 *   featured tile takes the new speaker's strip slot (a swap); every other
 *   strip tile stays put. Otherwise the strip is in base order.
 * - Self is never featured and never dropped.
 */
import {
  MAX_PARTICIPANTS,
  type StageView,
  type VideoParticipant,
} from '../../../../types/videoCall.ts';

/** Fields of a participant the layout reads. `VideoParticipant` satisfies it. */
export type LayoutParticipant = Pick<
  VideoParticipant,
  'id' | 'self' | 'sharing' | 'talking'
>;

/** Cell id of the "+N" overflow chip inside `rows` / `stripRows`. */
export const OVERFLOW_CELL = '__overflow__';

export const DEFAULT_MAX_VISIBLE = MAX_PARTICIPANTS;
export const DEFAULT_MAX_FILMSTRIP = 6;
/** Speaker strip cells (incl. chip) — default fits everyone at 10 people. */
export const DEFAULT_MAX_STRIP = MAX_PARTICIPANTS - 1;
/** Speaker strip cells per row before it wraps to two rows. */
export const STRIP_ROW_MAX = 7;

export interface StageLayoutInput {
  participants: readonly LayoutParticipant[];
  view: StageView;
  /** Someone is sharing their screen (content takes the stage). */
  sharing: boolean;
  /** Non-self participant to feature / keep visible. */
  activeSpeakerId?: string;
  /** Max cells in a grid including self and the overflow chip. Default 10. */
  maxVisible?: number;
  /** Max cells in the share filmstrip including the overflow chip. Default 6. */
  maxFilmstrip?: number;
  /** Max cells in the speaker strip including the overflow chip. Default 9. */
  maxStrip?: number;
  /** Layout from the previous render, for sticky membership / swap ordering. */
  previous?: StageLayout | null;
}

export interface PipLayout {
  kind: 'pip';
  /** Remote participant filling the stage. */
  mainId: string;
  /** Self, in the floating picture-in-picture. */
  pipId: string;
}

export interface GridLayout {
  kind: 'grid';
  /** Cell ids per row, top to bottom (`OVERFLOW_CELL` = the chip, always last). */
  rows: string[][];
  /** Widest row (cells). */
  cols: number;
  /** Visible tiles in display order. */
  tileIds: string[];
  /** Participants behind the "+N" chip. */
  overflowIds: string[];
}

export interface SpeakerLayout {
  kind: 'speaker';
  /** Large tile under the strip (active speaker, never self). */
  featuredId: string;
  /** Strip cell ids per row (`OVERFLOW_CELL` = the chip, always last). */
  stripRows: string[][];
  /** Strip tiles in display order (no chip). */
  stripIds: string[];
  overflowIds: string[];
}

export interface ShareLayout {
  kind: 'share';
  presenterId: string;
  /** Camera tiles beside the shared content (includes presenter and self). */
  filmstripIds: string[];
  overflowIds: string[];
}

export type StageLayout = PipLayout | GridLayout | SpeakerLayout | ShareLayout;

const GRID_ROWS: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [2, 1],
  4: [2, 2],
  5: [3, 2],
  6: [3, 3],
  7: [4, 3],
  8: [4, 4],
  9: [3, 3, 3],
  10: [4, 3, 3],
};

/** Grid cells → cells per row. See the table in the file header. */
export function gridRowSizes(cells: number): number[] {
  if (cells <= 0) return [];
  const known = GRID_ROWS[cells];
  if (known) return [...known];
  // Beyond the cap (not reachable after clamping): rows of at most 4.
  const rows = Math.ceil(cells / 4);
  return splitEvenly(cells, rows);
}

/** Speaker strip cells → cells per row (one row up to STRIP_ROW_MAX). */
export function stripRowSizes(cells: number): number[] {
  if (cells <= 0) return [];
  return splitEvenly(cells, Math.ceil(cells / STRIP_ROW_MAX));
}

/** `n` into `rows` rows, larger rows first (e.g. 9 in 2 → [5, 4]). */
function splitEvenly(n: number, rows: number): number[] {
  const base = Math.floor(n / rows);
  const extra = n % rows;
  return Array.from({ length: rows }, (_, i) => base + (i < extra ? 1 : 0));
}

function chunk(ids: string[], sizes: number[]): string[][] {
  const out: string[][] = [];
  let at = 0;
  for (const size of sizes) {
    out.push(ids.slice(at, at + size));
    at += size;
  }
  return out;
}

function clampInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const n =
    typeof value === 'number' && Number.isFinite(value)
      ? Math.floor(value)
      : fallback;
  return Math.min(max, Math.max(min, n));
}

/** Dedupe by id, cap at MAX_PARTICIPANTS while always keeping self. */
function normalize(
  participants: readonly LayoutParticipant[],
): LayoutParticipant[] {
  const seen = new Set<string>();
  const unique = participants.filter((p) => {
    if (!p || !p.id || p.id === OVERFLOW_CELL || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  if (unique.length <= MAX_PARTICIPANTS) return unique;
  const self = unique.find((p) => p.self);
  const kept = unique
    .filter((p) => !p.self)
    .slice(0, self ? MAX_PARTICIPANTS - 1 : MAX_PARTICIPANTS);
  if (!self) return kept;
  // Re-insert self at its original relative position.
  const selfIndex = unique.indexOf(self);
  const before = unique.slice(0, selfIndex).filter((p) => !p.self).length;
  kept.splice(Math.min(before, kept.length), 0, self);
  return kept;
}

/** Visible participant ids of a layout, in display order. */
export function visibleIds(layout: StageLayout | null | undefined): string[] {
  if (!layout) return [];
  switch (layout.kind) {
    case 'pip':
      return [layout.mainId, layout.pipId];
    case 'grid':
      return layout.tileIds;
    case 'speaker':
      return [layout.featuredId, ...layout.stripIds];
    case 'share':
      return layout.filmstripIds;
  }
}

/**
 * Choose which ids are visible when `order` may exceed `cap` cells.
 * Returns ids in previous-set order (when sticky) or base order.
 */
function selectVisible(
  order: string[],
  cap: number,
  required: string[],
  previous: string[],
): { visible: string[]; overflow: string[] } {
  const present = new Set(order);
  if (order.length <= cap) {
    // Everyone fits: keep the previous arrangement, newcomers appended.
    const kept = previous.filter(
      (id, i) => present.has(id) && previous.indexOf(id) === i,
    );
    return {
      visible: [...kept, ...order.filter((id) => !kept.includes(id))],
      overflow: [],
    };
  }
  const slots = Math.max(1, cap - 1);
  const req = required
    .filter((id, i) => present.has(id) && required.indexOf(id) === i)
    .slice(0, slots);
  const visible = previous.filter((id) => present.has(id)).slice(0, slots);

  for (const id of req) {
    if (visible.includes(id)) continue;
    if (visible.length < slots) {
      visible.push(id);
      continue;
    }
    // Replace the last tile that is not required; it keeps its position.
    for (let i = visible.length - 1; i >= 0; i -= 1) {
      if (!req.includes(visible[i])) {
        visible[i] = id;
        break;
      }
    }
  }
  for (const id of order) {
    if (visible.length >= slots) break;
    if (!visible.includes(id)) visible.push(id);
  }
  const shown = new Set(visible);
  return { visible, overflow: order.filter((id) => !shown.has(id)) };
}

function sortByOrder(ids: string[], order: string[]) {
  return [...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

export function computeStageLayout(input: StageLayoutInput): StageLayout {
  const list = normalize(input.participants ?? []);
  const order = list.map((p) => p.id);
  const selfId = list.find((p) => p.self)?.id;
  const maxVisible = clampInt(
    input.maxVisible,
    DEFAULT_MAX_VISIBLE,
    2,
    MAX_PARTICIPANTS,
  );
  const maxFilmstrip = clampInt(
    input.maxFilmstrip,
    DEFAULT_MAX_FILMSTRIP,
    2,
    MAX_PARTICIPANTS,
  );
  const maxStrip = clampInt(
    input.maxStrip,
    DEFAULT_MAX_STRIP,
    2,
    MAX_PARTICIPANTS - 1,
  );
  const prevLayout = input.previous ?? null;
  const prev = visibleIds(prevLayout);
  const speakerId =
    input.activeSpeakerId &&
    input.activeSpeakerId !== selfId &&
    order.includes(input.activeSpeakerId)
      ? input.activeSpeakerId
      : undefined;
  const required = (...ids: (string | undefined)[]) =>
    ids.filter((id): id is string => !!id);

  if (list.length === 0) {
    return { kind: 'grid', rows: [], cols: 0, tileIds: [], overflowIds: [] };
  }

  // ── Screen share: content on stage, cameras in a filmstrip ───────────────
  if (input.sharing) {
    const presenterId = list.find((p) => p.sharing)?.id ?? selfId ?? order[0];
    const { visible, overflow } = selectVisible(
      order,
      maxFilmstrip,
      required(selfId, presenterId, speakerId),
      prev,
    );
    return {
      kind: 'share',
      presenterId,
      filmstripIds: prev.length ? visible : sortByOrder(visible, order),
      overflowIds: overflow,
    };
  }

  // ── 1:1 speaker view: remote large, self floating ────────────────────────
  if (list.length === 2 && input.view === 'speaker') {
    const pipId = selfId ?? order.find((id) => id !== speakerId) ?? order[1];
    const mainId = order.find((id) => id !== pipId) ?? order[0];
    return { kind: 'pip', mainId, pipId };
  }

  // ── Grid view (any count) ────────────────────────────────────────────────
  if (input.view === 'grid' || list.length < 3) {
    const { visible, overflow } = selectVisible(
      order,
      maxVisible,
      required(selfId, speakerId),
      prev,
    );
    const tileIds = sortByOrder(visible, order);
    const cells = overflow.length ? [...tileIds, OVERFLOW_CELL] : tileIds;
    const rows = chunk(cells, gridRowSizes(cells.length));
    return {
      kind: 'grid',
      rows,
      cols: Math.max(...rows.map((r) => r.length)),
      tileIds,
      overflowIds: overflow,
    };
  }

  // ── Speaker view, 3+ people: featured speaker under a strip ──────────────
  const prevFeatured =
    prevLayout?.kind === 'speaker'
      ? prevLayout.featuredId
      : prevLayout?.kind === 'pip'
        ? prevLayout.mainId
        : undefined;
  const featuredId =
    speakerId ??
    (prevFeatured && prevFeatured !== selfId && order.includes(prevFeatured)
      ? prevFeatured
      : undefined) ??
    order.find((id) => id !== selfId) ??
    order[0];
  const { visible, overflow } = selectVisible(
    order,
    maxStrip + 1,
    required(selfId, featuredId),
    prev,
  );
  const inStrip = new Set(visible.filter((id) => id !== featuredId));

  let stripIds: string[];
  if (prevLayout?.kind === 'speaker') {
    // Keep the previous strip; the old featured tile takes the new one's slot.
    const swapped = prevLayout.stripIds.map((id) =>
      id === featuredId ? prevLayout.featuredId : id,
    );
    stripIds = swapped.filter(
      (id, i) => inStrip.has(id) && swapped.indexOf(id) === i,
    );
    for (const id of sortByOrder([...inStrip], order)) {
      if (!stripIds.includes(id)) stripIds.push(id);
    }
  } else {
    stripIds = sortByOrder([...inStrip], order);
  }

  const cells = overflow.length ? [...stripIds, OVERFLOW_CELL] : stripIds;
  return {
    kind: 'speaker',
    featuredId,
    stripRows: chunk(cells, stripRowSizes(cells.length)),
    stripIds,
    overflowIds: overflow,
  };
}
