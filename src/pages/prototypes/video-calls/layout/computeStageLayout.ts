/**
 * Pure stage-layout model for the video call prototype. No React, no DOM.
 *
 * Imports are relative with explicit `.ts` extensions (no `@/` alias) so the
 * module also runs under `node --experimental-strip-types` for the check
 * script next to it.
 *
 * ── Grid sizes ──────────────────────────────────────────────────────────────
 * Cells (tiles + the overflow chip, if any) → cols x rows. Chosen to maximise
 * the area of a 16:9 tile inside a ~1200x560 stage with 12px gaps (checked by
 * hand: e.g. 10 → 4x3 gives ~291x164 tiles vs ~230x129 for 5x2):
 *   1 → 1x1, 2 → 2x1, 3-4 → 2x2, 5-6 → 3x2, 7-9 → 3x3, 10 → 4x3.
 * Tiles fill their cell (Figma two-person grid tiles are ~614x524, not 16:9);
 * the stage centers a short last row (Figma: 3 people = 2 on top + 1 centered).
 *
 * ── Ordering rules (deterministic) ──────────────────────────────────────────
 * - Base order is the `participants` order (join order). Self keeps its index.
 * - Grid view always displays visible tiles in base order. Talking never
 *   reorders a grid.
 * - When there are more participants than cells (`maxVisible`, default 9),
 *   `maxVisible - 1` tiles show plus a "+N" overflow chip. Self, the presenter
 *   (share) and the active speaker are required members of the visible set.
 *   Membership is sticky: with `previous`, the previous visible set is kept and
 *   the active speaker is promoted ONLY when not already visible, by replacing
 *   the last non-required tile of the previous set.
 * - Speaker view (3+ people) features the active speaker in the first cell
 *   (spanning any empty cells of the last row, so it is the largest tile).
 *   On a speaker change with `previous`, the new speaker swaps places with the
 *   previously featured tile; every other tile stays put. Without `previous`,
 *   the speaker moves to the front and the rest keep base order.
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

export const DEFAULT_MAX_VISIBLE = 9;
export const DEFAULT_MAX_FILMSTRIP = 6;

export interface StageLayoutInput {
  participants: readonly LayoutParticipant[];
  view: StageView;
  /** Someone is sharing their screen (content takes the stage). */
  sharing: boolean;
  /** Non-self participant to feature / keep visible. */
  activeSpeakerId?: string;
  /** Max cells in a grid including self and the overflow chip. Default 9. */
  maxVisible?: number;
  /** Max cells in the share filmstrip including the overflow chip. Default 6. */
  maxFilmstrip?: number;
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
  cols: number;
  rows: number;
  /** Visible tiles in display order. */
  tileIds: string[];
  /** Participants behind the "+N" chip (chip is the last cell when non-empty). */
  overflowIds: string[];
  /** Speaker view: the tile in the first, largest cell. */
  featuredId?: string;
  /** Columns the featured tile spans (absorbs empty last-row cells). 1 otherwise. */
  featuredSpan: number;
}

export interface ShareLayout {
  kind: 'share';
  presenterId: string;
  /** Camera tiles beside the shared content (includes presenter and self). */
  filmstripIds: string[];
  overflowIds: string[];
}

export type StageLayout = PipLayout | GridLayout | ShareLayout;

/** Cells → [cols, rows]. See the table in the file header. */
export function gridDimensions(cells: number): { cols: number; rows: number } {
  if (cells <= 0) return { cols: 0, rows: 0 };
  if (cells === 1) return { cols: 1, rows: 1 };
  if (cells === 2) return { cols: 2, rows: 1 };
  if (cells <= 4) return { cols: 2, rows: 2 };
  if (cells <= 6) return { cols: 3, rows: 2 };
  if (cells <= 9) return { cols: 3, rows: 3 };
  if (cells <= 12) return { cols: 4, rows: 3 }; // 10 = MAX_PARTICIPANTS
  // Beyond the cap (not reachable after clamping): roughly square-ish 4:3 cell grid.
  const cols = Math.ceil(Math.sqrt((cells * 4) / 3));
  return { cols, rows: Math.ceil(cells / cols) };
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
    if (!p || !p.id || seen.has(p.id)) return false;
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

function previousIds(previous: StageLayout | null | undefined): string[] {
  if (!previous) return [];
  switch (previous.kind) {
    case 'pip':
      return [previous.mainId, previous.pipId];
    case 'grid':
      return previous.tileIds;
    case 'share':
      return previous.filmstripIds;
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
  const prev = previousIds(input.previous);
  const speakerId =
    input.activeSpeakerId &&
    input.activeSpeakerId !== selfId &&
    order.includes(input.activeSpeakerId)
      ? input.activeSpeakerId
      : undefined;
  const required = (...ids: (string | undefined)[]) =>
    ids.filter((id): id is string => !!id);

  if (list.length === 0) {
    return {
      kind: 'grid',
      cols: 0,
      rows: 0,
      tileIds: [],
      overflowIds: [],
      featuredSpan: 1,
    };
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
    const { cols, rows } = gridDimensions(
      tileIds.length + (overflow.length ? 1 : 0),
    );
    return {
      kind: 'grid',
      cols,
      rows,
      tileIds,
      overflowIds: overflow,
      featuredSpan: 1,
    };
  }

  // ── Speaker view, 3+ people: active speaker featured first ───────────────
  const prevFeatured =
    input.previous?.kind === 'grid' ? input.previous.featuredId : undefined;
  const featuredId =
    speakerId ??
    (prevFeatured && prevFeatured !== selfId && order.includes(prevFeatured)
      ? prevFeatured
      : undefined) ??
    order.find((id) => id !== selfId) ??
    order[0];
  const { visible, overflow } = selectVisible(
    order,
    maxVisible,
    required(selfId, featuredId),
    prev,
  );

  let tileIds: string[];
  if (prev.length) {
    // Keep the previous arrangement; swap the featured tile into cell 0.
    tileIds = [...visible];
    const at = tileIds.indexOf(featuredId);
    if (at > 0) {
      [tileIds[0], tileIds[at]] = [tileIds[at], tileIds[0]];
    }
  } else {
    tileIds = [
      featuredId,
      ...sortByOrder(
        visible.filter((id) => id !== featuredId),
        order,
      ),
    ];
  }

  const cells = tileIds.length + (overflow.length ? 1 : 0);
  const { cols, rows } = gridDimensions(cells);
  const featuredSpan = Math.min(cols, 1 + (cols * rows - cells));
  return {
    kind: 'grid',
    cols,
    rows,
    tileIds,
    overflowIds: overflow,
    featuredId,
    featuredSpan,
  };
}
