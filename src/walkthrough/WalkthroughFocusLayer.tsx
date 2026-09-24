import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TourPoint,
  type TourPointPointerPosition,
} from '@mattermost/compass-ui/components/tour-point';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import type { WalkthroughFocus, WalkthroughFocusNote } from '@/walkthrough/types';
import styles from './WalkthroughFocusLayer.module.scss';

type Placement = 'below' | 'above' | 'beside';

type StageRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type NotePos = {
  top: number;
  left: number;
  placement: Placement;
};

type WalkthroughFocusLayerProps = {
  focus: WalkthroughFocus | null;
  /** Scope queries and overlays to the prototype stage root. */
  stageRef: React.RefObject<HTMLElement | null>;
};

const TOUR_POINT_WIDTH = 320;
/** Match TourPoint panel-in / `--duration-quick`. */
const NOTE_EXIT_MS = 150;

/** One callout style only — lightbox and ring never combine. */
function resolveEmphasis(focus: WalkthroughFocus): 'ring' | 'lightbox' {
  const raw = focus.emphasis;
  if (raw == null) return 'ring';
  const list = Array.isArray(raw) ? raw : [raw];
  if (list.includes('lightbox')) return 'lightbox';
  return 'ring';
}

function pointerFor(
  mode: 'anchored' | 'docked',
  placement: Placement | null,
): TourPointPointerPosition | 'none' {
  if (mode === 'docked' || !placement) return 'none';
  if (placement === 'below') return 'top-center';
  if (placement === 'above') return 'bottom-center';
  return 'left-center';
}

/** Place TourPoint in stage-local coordinates. */
function placeNote(
  target: StageRect,
  noteHeight: number,
  noteWidth: number,
  stageW: number,
  stageH: number,
): NotePos | 'dock' {
  const gap = 16;
  const width = Math.min(noteWidth, stageW - 24);
  const belowTop = target.top + target.height + gap;
  if (belowTop + noteHeight < stageH - 12) {
    return {
      top: belowTop,
      left: Math.min(Math.max(12, target.left), stageW - width - 12),
      placement: 'below',
    };
  }
  const aboveTop = target.top - gap - noteHeight;
  if (aboveTop > 12) {
    return {
      top: aboveTop,
      left: Math.min(Math.max(12, target.left), stageW - width - 12),
      placement: 'above',
    };
  }
  const besideLeft = target.left + target.width + gap;
  if (besideLeft + width < stageW - 12) {
    return {
      top: Math.min(Math.max(12, target.top), stageH - noteHeight - 12),
      left: besideLeft,
      placement: 'beside',
    };
  }
  return 'dock';
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
    placement: 'beside',
  };
}

function toStageLocal(target: DOMRect, stage: DOMRect): StageRect {
  return {
    top: target.top - stage.top,
    left: target.left - stage.left,
    width: target.width,
    height: target.height,
  };
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
  const [notePos, setNotePos] = useState<NotePos | null>(null);
  const [noteMode, setNoteMode] = useState<'anchored' | 'docked' | 'dismissed'>(
    'anchored',
  );
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
    setEntered(false);
    placedForFocusRef.current = null;
  }, [focus?.id]);

  useEffect(() => {
    if (!focus) return;

    let frame = 0;
    const find = () =>
      (stageRef.current ?? document).querySelector(
        `[data-wt-focus="${CSS.escape(focus.id)}"]`,
      ) as HTMLElement | null;

    const clearHighlight = () => {
      (stageRef.current ?? document)
        .querySelectorAll('[data-wt-highlight="true"]')
        .forEach((el) => el.removeAttribute('data-wt-highlight'));
    };

    const measure = (opts?: { forcePlace?: boolean }) => {
      const stage = stageRef.current;
      const el = find();
      if (!stage || !el) {
        setTargetLocal(null);
        return;
      }
      if (emphasis === 'ring') {
        el.setAttribute('data-wt-highlight', 'true');
      }
      const stageRect = stage.getBoundingClientRect();
      const local = toStageLocal(el.getBoundingClientRect(), stageRect);
      setTargetLocal(local);

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

      const placed = placeNote(local, noteH, noteW, stageRect.width, stageRect.height);
      if (placed === 'dock') {
        setNoteMode('docked');
        setNotePos(dockedPos(noteW, noteH, stageRect.width, stageRect.height));
      } else {
        setNotePos(placed);
      }
      placedForFocusRef.current = focus.id;
    };

    const t1 = window.setTimeout(() => {
      const el = find();
      el?.scrollIntoView({ block: 'center', behavior: 'instant' });
      measure({ forcePlace: true });
    }, 80);
    // One refine after layout settles (TourPoint height known).
    const t2 = window.setTimeout(() => measure({ forcePlace: true }), 220);

    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => measure({ forcePlace: true }));
    };

    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      clearHighlight();
    };
  }, [focus, emphasis, noteMode, stageRef]);

  useEffect(() => {
    if (!focus?.note || noteMode !== 'anchored') return;
    const onInteract = (event: Event) => {
      const target = event.target as Node | null;
      if (target && noteRef.current?.contains(target)) return;
      const stage = stageRef.current;
      if (stage && target && !stage.contains(target)) return;
      setNoteMode('docked');
    };
    document.addEventListener('mousedown', onInteract, true);
    document.addEventListener('focusin', onInteract, true);
    return () => {
      document.removeEventListener('mousedown', onInteract, true);
      document.removeEventListener('focusin', onInteract, true);
    };
  }, [focus?.note, noteMode, stageRef]);

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

  const showLightbox = focus && emphasis === 'lightbox' && targetLocal;

  const pad = 4;
  const cutout = targetLocal
    ? {
        top: targetLocal.top - pad,
        left: targetLocal.left - pad,
        width: targetLocal.width + pad * 2,
        height: targetLocal.height + pad * 2,
      }
    : null;

  const display = snapshot;
  const pointerPosition = display
    ? pointerFor(display.mode, display.pos.placement)
    : 'none';

  return (
    <div className={styles['wt-focus']} aria-hidden={!noteRendered || noteExiting}>
      {showLightbox && cutout && (
        <div className={styles['wt-focus__lightbox']}>
          <div
            className={styles['wt-focus__cutout']}
            style={{
              top: cutout.top,
              left: cutout.left,
              width: cutout.width,
              height: cutout.height,
            }}
          />
        </div>
      )}

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
          style={{ top: display.pos.top, left: display.pos.left }}
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
