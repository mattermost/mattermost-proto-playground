import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TourPoint,
  type TourPointPointerPosition,
} from '@mattermost/compass-ui/components/tour-point';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import type {
  WalkthroughFocus,
  WalkthroughFocusNote,
  WalkthroughNotePlacement,
} from '@/walkthrough/types';
import styles from './WalkthroughFocusLayer.module.scss';

type StageRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type RingRect = StageRect & {
  /** CSS border-radius matched to the target, outset by the ring pad. */
  borderRadius: string;
};

type NotePos = {
  top: number;
  left: number;
  pointer: TourPointPointerPosition | 'none';
};

type WalkthroughFocusLayerProps = {
  focus: WalkthroughFocus | null;
  /** Scope queries and overlays to the prototype stage root. */
  stageRef: React.RefObject<HTMLElement | null>;
};

const TOUR_POINT_WIDTH = 320;
/** Match TourPoint `--spacing-xl` tip inset for left/right pointer variants. */
const POINTER_EDGE_INSET = 24;
/** Match TourPoint panel-in / `--duration-quick`. */
const NOTE_EXIT_MS = 150;
const GAP = 16;
const MARGIN = 12;
/** Match former outline-offset so the overlay ring sits just outside the target. */
const RING_PAD = 3;
const DEFAULT_RING_RADIUS = 'var(--radius-s)';

/** Grow each px corner radius by `pad` so an outset ring stays concentric. */
function outsetBorderRadius(radius: string, pad: number): string {
  if (!radius || radius === '0px') {
    return pad > 0 ? `${pad}px` : '0';
  }
  return radius
    .split('/')
    .map((axis) =>
      axis
        .trim()
        .split(/\s+/)
        .map((token) => {
          const match = /^(-?[\d.]+)(px|rem|em|%)$/.exec(token);
          if (!match) return token;
          const value = parseFloat(match[1]);
          const unit = match[2];
          // Percent radii (e.g. pills) stay as-is — they already follow the box.
          if (unit === '%') return token;
          return `${Math.max(0, value + pad)}${unit}`;
        })
        .join(' '),
    )
    .join(' / ');
}

function readBorderRadius(el: HTMLElement): string {
  const radius = getComputedStyle(el).borderRadius;
  if (!radius || radius === '0px') return DEFAULT_RING_RADIUS;
  return radius;
}

type EmphasisFlags = { ring: boolean; lightbox: boolean };

/** Lightbox can combine with ring; omit → ring only. */
function resolveEmphasis(focus: WalkthroughFocus): EmphasisFlags {
  const raw = focus.emphasis;
  if (raw == null) return { ring: true, lightbox: false };
  const list = Array.isArray(raw) ? raw : [raw];
  const lightbox = list.includes('lightbox');
  const ring = list.includes('ring') || lightbox;
  return { ring, lightbox };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/**
 * Pick top/bottom-* pointer and card left so the tip aims at `targetCx`.
 * Prefers center, then left/right edge variants when the card is clamped.
 */
function alignHorizontal(
  targetCx: number,
  noteW: number,
  stageW: number,
  edge: 'top' | 'bottom',
): { left: number; pointer: TourPointPointerPosition } {
  const minLeft = MARGIN;
  const maxLeft = Math.max(minLeft, stageW - noteW - MARGIN);

  const options: { left: number; pointer: TourPointPointerPosition; tip: number }[] = [
    {
      left: clamp(targetCx - noteW / 2, minLeft, maxLeft),
      pointer: `${edge}-center`,
      tip: 0,
    },
    {
      left: clamp(targetCx - POINTER_EDGE_INSET, minLeft, maxLeft),
      pointer: `${edge}-left`,
      tip: 0,
    },
    {
      left: clamp(targetCx - (noteW - POINTER_EDGE_INSET), minLeft, maxLeft),
      pointer: `${edge}-right`,
      tip: 0,
    },
  ];

  for (const opt of options) {
    const tipOffset =
      opt.pointer.endsWith('-center')
        ? noteW / 2
        : opt.pointer.endsWith('-left')
          ? POINTER_EDGE_INSET
          : noteW - POINTER_EDGE_INSET;
    opt.tip = opt.left + tipOffset;
  }

  options.sort((a, b) => Math.abs(a.tip - targetCx) - Math.abs(b.tip - targetCx));
  return { left: options[0].left, pointer: options[0].pointer };
}

type Candidate = NotePos & { score: number; side: WalkthroughNotePlacement };

/** Place TourPoint in stage-local coordinates, aiming the pointer at the target. */
function placeNote(
  target: StageRect,
  noteHeight: number,
  noteWidth: number,
  stageW: number,
  stageH: number,
  preferred?: WalkthroughNotePlacement,
): NotePos | 'dock' {
  const width = Math.min(noteWidth, stageW - MARGIN * 2);
  const height = noteHeight;
  const targetCx = target.left + target.width / 2;
  const targetCy = target.top + target.height / 2;
  const candidates: Candidate[] = [];

  const spaceBelow = stageH - (target.top + target.height) - MARGIN;
  if (spaceBelow >= height + GAP) {
    const { left, pointer } = alignHorizontal(targetCx, width, stageW, 'top');
    candidates.push({
      top: target.top + target.height + GAP,
      left,
      pointer,
      score: spaceBelow,
      side: 'below',
    });
  }

  const spaceAbove = target.top - MARGIN;
  if (spaceAbove >= height + GAP) {
    const { left, pointer } = alignHorizontal(targetCx, width, stageW, 'bottom');
    candidates.push({
      top: target.top - GAP - height,
      left,
      pointer,
      score: spaceAbove,
      side: 'above',
    });
  }

  const spaceRight = stageW - (target.left + target.width) - MARGIN;
  if (spaceRight >= width + GAP) {
    candidates.push({
      top: clamp(targetCy - height / 2, MARGIN, Math.max(MARGIN, stageH - height - MARGIN)),
      left: target.left + target.width + GAP,
      pointer: 'left-center',
      score: spaceRight,
      side: 'right',
    });
  }

  const spaceLeft = target.left - MARGIN;
  if (spaceLeft >= width + GAP) {
    candidates.push({
      top: clamp(targetCy - height / 2, MARGIN, Math.max(MARGIN, stageH - height - MARGIN)),
      left: target.left - GAP - width,
      pointer: 'right-center',
      score: spaceLeft,
      side: 'left',
    });
  }

  if (!candidates.length) return 'dock';

  if (preferred) {
    const preferredHit = candidates.find((c) => c.side === preferred);
    if (preferredHit) {
      return { top: preferredHit.top, left: preferredHit.left, pointer: preferredHit.pointer };
    }
  }

  // Prefer the roomiest side; below wins ties so the first look reads naturally.
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const rank = (p: TourPointPointerPosition | 'none') =>
      p.startsWith('top') ? 0 : p.startsWith('bottom') ? 1 : p.startsWith('left') ? 2 : 3;
    return rank(a.pointer) - rank(b.pointer);
  });

  const best = candidates[0];
  return { top: best.top, left: best.left, pointer: best.pointer };
}

function dockedPos(
  noteWidth: number,
  noteHeight: number,
  stageW: number,
  stageH: number,
): NotePos {
  const margin = 16;
  const width = Math.min(noteWidth, stageW - margin * 2);
  return {
    top: Math.max(margin, stageH - noteHeight - margin),
    left: Math.max(margin, stageW - width - margin),
    pointer: 'none',
  };
}

function transformOriginFor(pointer: TourPointPointerPosition | 'none'): string {
  switch (pointer) {
    case 'top-center':
      return 'top center';
    case 'top-left':
      return 'top left';
    case 'top-right':
      return 'top right';
    case 'bottom-center':
      return 'bottom center';
    case 'bottom-left':
      return 'bottom left';
    case 'bottom-right':
      return 'bottom right';
    case 'left-center':
      return 'center left';
    case 'right-center':
      return 'center right';
    default:
      return 'center center';
  }
}

function toStageLocal(target: DOMRect, stage: DOMRect): StageRect {
  return {
    top: target.top - stage.top,
    left: target.left - stage.left,
    width: target.width,
    height: target.height,
  };
}

function unionClientRects(rects: DOMRectReadOnly[]): DOMRect {
  let top = Infinity;
  let left = Infinity;
  let bottom = -Infinity;
  let right = -Infinity;
  for (const r of rects) {
    top = Math.min(top, r.top);
    left = Math.min(left, r.left);
    bottom = Math.max(bottom, r.bottom);
    right = Math.max(right, r.right);
  }
  return new DOMRect(left, top, right - left, bottom - top);
}

type NoteSnapshot = {
  id: string;
  note: WalkthroughFocusNote;
  pos: NotePos;
  mode: 'anchored' | 'docked';
};

export default function WalkthroughFocusLayer({
  focus,
  stageRef,
}: WalkthroughFocusLayerProps) {
  const [targetLocal, setTargetLocal] = useState<StageRect | null>(null);
  /** Per-target rings drawn in this layer (avoids overflow clipping on the element). */
  const [ringLocals, setRingLocals] = useState<RingRect[]>([]);
  /** Stage-local bounds of `[data-wt-shell]`, or full stage when absent. */
  const [shellLocal, setShellLocal] = useState<StageRect | null>(null);
  const [notePos, setNotePos] = useState<NotePos | null>(null);
  const [noteMode, setNoteMode] = useState<'anchored' | 'docked' | 'dismissed'>(
    'anchored',
  );
  /** Ring/lightbox stay until the user interacts with a focus target. */
  const [calloutActive, setCalloutActive] = useState(true);
  const [entered, setEntered] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<NoteSnapshot | null>(null);
  const placedForFocusRef = useRef<string | null>(null);

  const emphasis = useMemo(
    () => (focus ? resolveEmphasis(focus) : null),
    [focus],
  );

  useEffect(() => {
    setNoteMode('anchored');
    setNotePos(null);
    setTargetLocal(null);
    setRingLocals([]);
    setShellLocal(null);
    setCalloutActive(true);
    setEntered(false);
    placedForFocusRef.current = null;
  }, [focus?.id]);

  useEffect(() => {
    if (!focus) return;

    let frame = 0;
    const findAll = () =>
      Array.from(
        (stageRef.current ?? document).querySelectorAll(
          `[data-wt-focus="${CSS.escape(focus.id)}"]`,
        ),
      ) as HTMLElement[];

    const measure = (opts?: { forcePlace?: boolean }) => {
      const stage = stageRef.current;
      if (!stage) {
        setTargetLocal(null);
        setRingLocals([]);
        setShellLocal(null);
        return;
      }
      const stageRect = stage.getBoundingClientRect();
      const shellEl = stage.querySelector('[data-wt-shell]') as HTMLElement | null;
      setShellLocal(
        shellEl
          ? toStageLocal(shellEl.getBoundingClientRect(), stageRect)
          : {
              top: 0,
              left: 0,
              width: stageRect.width,
              height: stageRect.height,
            },
      );

      const els = findAll();
      if (!els.length) {
        setTargetLocal(null);
        setRingLocals([]);
        // Menu/overlay focus targets often unmount on click — still dock the note.
        if (focus.note && noteMode === 'docked') {
          const noteW = noteRef.current?.offsetWidth || TOUR_POINT_WIDTH;
          const noteH = noteRef.current?.offsetHeight || 180;
          setNotePos(dockedPos(noteW, noteH, stageRect.width, stageRect.height));
        }
        return;
      }
      const clientRects = els.map((el) => el.getBoundingClientRect());
      const local = toStageLocal(unionClientRects(clientRects), stageRect);
      setTargetLocal(local);
      setRingLocals(
        emphasis?.ring
          ? els.map((el, i) => ({
              ...toStageLocal(clientRects[i], stageRect),
              borderRadius: readBorderRadius(el),
            }))
          : [],
      );

      if (!focus.note || noteMode === 'dismissed') return;

      const noteW = noteRef.current?.offsetWidth || TOUR_POINT_WIDTH;
      const noteH = noteRef.current?.offsetHeight || 180;
      const alreadyPlaced = placedForFocusRef.current === focus.id;

      if (noteMode === 'docked') {
        setNotePos(dockedPos(noteW, noteH, stageRect.width, stageRect.height));
        return;
      }

      // Avoid mid-entrance jumps from the second measure pass.
      if (alreadyPlaced && !opts?.forcePlace) return;

      const placed = placeNote(
        local,
        noteH,
        noteW,
        stageRect.width,
        stageRect.height,
        focus.notePlacement,
      );
      if (placed === 'dock') {
        setNoteMode('docked');
        setNotePos(dockedPos(noteW, noteH, stageRect.width, stageRect.height));
      } else {
        setNotePos(placed);
      }
      placedForFocusRef.current = focus.id;
    };

    const t1 = window.setTimeout(() => {
      findAll()[0]?.scrollIntoView({ block: 'center', behavior: 'instant' });
      measure({ forcePlace: true });
    }, 80);
    // Refine after layout / delayed overlays (e.g. profile popover phones).
    const t2 = window.setTimeout(() => measure({ forcePlace: true }), 220);
    const t3 = window.setTimeout(() => measure({ forcePlace: true }), 400);

    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => measure({ forcePlace: true }));
    };

    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [focus, emphasis, noteMode, stageRef]);

  useEffect(() => {
    if (!focus) return;

    const focusTargets = () =>
      Array.from(
        (stageRef.current ?? window.document).querySelectorAll(
          `[data-wt-focus="${CSS.escape(focus.id)}"]`,
        ),
      ) as HTMLElement[];

    const onInteract = (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (noteRef.current?.contains(target)) return;

      const dockNote = () => {
        if (!focus.note || noteMode !== 'anchored') return;
        setNoteMode('docked');
        const stage = stageRef.current;
        if (!stage) return;
        const stageRect = stage.getBoundingClientRect();
        const noteW = noteRef.current?.offsetWidth || TOUR_POINT_WIDTH;
        const noteH = noteRef.current?.offsetHeight || 180;
        setNotePos(dockedPos(noteW, noteH, stageRect.width, stageRect.height));
      };

      const hitFocusTarget = focusTargets().some((el) => el.contains(target));
      if (hitFocusTarget) {
        setCalloutActive(false);
        dockNote();
        return;
      }

      // Other stage interaction: dock the TourPoint, keep ring/lightbox.
      const stage = stageRef.current;
      if (stage && !stage.contains(target)) return;
      dockNote();
    };

    window.document.addEventListener('mousedown', onInteract, true);
    window.document.addEventListener('focusin', onInteract, true);
    return () => {
      window.document.removeEventListener('mousedown', onInteract, true);
      window.document.removeEventListener('focusin', onInteract, true);
    };
  }, [focus, noteMode, stageRef]);

  const noteOpen = Boolean(
    focus?.note &&
      noteMode !== 'dismissed' &&
      notePos != null &&
      (noteMode === 'docked' || noteMode === 'anchored'),
  );

  if (noteOpen && focus?.note && notePos) {
    snapshotRef.current = {
      id: focus.id,
      note: focus.note,
      pos: notePos,
      mode: noteMode === 'docked' ? 'docked' : 'anchored',
    };
  }

  const { rendered: noteRendered, exiting: noteExiting } = useExitAnimation(
    noteOpen,
    NOTE_EXIT_MS,
  );
  const snapshot = snapshotRef.current;

  useEffect(() => {
    if (!noteRendered || noteExiting) {
      setEntered(false);
      return;
    }
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setEntered(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [noteRendered, noteExiting, snapshot?.id]);

  if (!focus && !noteRendered) return null;

  const showLightbox = Boolean(
    focus && calloutActive && emphasis?.lightbox && targetLocal && shellLocal,
  );
  const showRings = Boolean(
    focus && calloutActive && emphasis?.ring && ringLocals.length,
  );

  const pad = 4;
  // Cutout is positioned inside the shell-scoped lightbox.
  const cutout =
    targetLocal && shellLocal
      ? {
          top: targetLocal.top - shellLocal.top - pad,
          left: targetLocal.left - shellLocal.left - pad,
          width: targetLocal.width + pad * 2,
          height: targetLocal.height + pad * 2,
          borderRadius: outsetBorderRadius(
            ringLocals[0]?.borderRadius ?? DEFAULT_RING_RADIUS,
            pad,
          ),
        }
      : null;

  const display = snapshot;
  const pointerPosition = display?.pos.pointer ?? 'none';

  return (
    <div className={styles['wt-focus']} aria-hidden={!noteRendered || noteExiting}>
      {showLightbox && cutout && shellLocal && (
        <div
          className={styles['wt-focus__lightbox']}
          style={{
            top: shellLocal.top,
            left: shellLocal.left,
            width: shellLocal.width,
            height: shellLocal.height,
          }}
        >
          <div
            className={styles['wt-focus__cutout']}
            style={{
              top: cutout.top,
              left: cutout.left,
              width: cutout.width,
              height: cutout.height,
              borderRadius: cutout.borderRadius,
            }}
          />
        </div>
      )}

      {showRings &&
        ringLocals.map((rect, i) => (
          <div
            key={`${rect.top}-${rect.left}-${i}`}
            className={styles['wt-focus__ring']}
            style={{
              top: rect.top - RING_PAD,
              left: rect.left - RING_PAD,
              width: rect.width + RING_PAD * 2,
              height: rect.height + RING_PAD * 2,
              borderRadius: outsetBorderRadius(rect.borderRadius, RING_PAD),
            }}
          />
        ))}

      {noteRendered && display && (
        <div
          ref={noteRef}
          className={[
            styles['wt-focus__note'],
            entered && !noteExiting ? styles['wt-focus__note--entered'] : '',
            noteExiting ? styles['wt-focus__note--exiting'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            top: display.pos.top,
            left: display.pos.left,
            transformOrigin: transformOriginFor(display.pos.pointer),
          }}
        >
          <TourPoint
            title={display.note.title}
            pointerPosition={pointerPosition}
            showPulsingDot={false}
            onClose={() => setNoteMode('dismissed')}
          >
            <ul className={styles['wt-focus__note-list']}>
              {display.note.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </TourPoint>
        </div>
      )}
    </div>
  );
}
