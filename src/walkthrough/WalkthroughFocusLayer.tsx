import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TourPoint,
  type TourPointPointerPosition,
} from '@mattermost/compass-ui/components/tour-point';
import type { WalkthroughFocus } from '@/walkthrough/types';
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

/** Ring and lightbox are mutually exclusive; lightbox wins if both are listed. */
function resolveEmphasis(focus: WalkthroughFocus): 'ring' | 'lightbox' {
  const list = focus.emphasis?.length ? focus.emphasis : (['ring'] as const);
  return list.includes('lightbox') ? 'lightbox' : 'ring';
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
  stageW: number,
  stageH: number,
): NotePos | 'dock' {
  const gap = 16;
  const width = Math.min(TOUR_POINT_WIDTH, stageW - 24);
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

function toStageLocal(target: DOMRect, stage: DOMRect): StageRect {
  return {
    top: target.top - stage.top,
    left: target.left - stage.left,
    width: target.width,
    height: target.height,
  };
}

export default function WalkthroughFocusLayer({
  focus,
  stageRef,
}: WalkthroughFocusLayerProps) {
  const [targetLocal, setTargetLocal] = useState<StageRect | null>(null);
  const [notePos, setNotePos] = useState<NotePos | null>(null);
  const [noteMode, setNoteMode] = useState<'anchored' | 'docked' | 'dismissed'>(
    'anchored',
  );
  const noteRef = useRef<HTMLDivElement>(null);

  const emphasis = useMemo(
    () => (focus ? resolveEmphasis(focus) : null),
    [focus],
  );

  useEffect(() => {
    setNoteMode('anchored');
    setNotePos(null);
    setTargetLocal(null);
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

    const measure = () => {
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
      if (focus.note && noteMode === 'anchored') {
        const h = noteRef.current?.offsetHeight ?? 180;
        const placed = placeNote(local, h, stageRect.width, stageRect.height);
        if (placed === 'dock') setNoteMode('docked');
        else setNotePos(placed);
      }
    };

    const t1 = window.setTimeout(() => {
      const el = find();
      el?.scrollIntoView({ block: 'center', behavior: 'instant' });
      measure();
    }, 80);
    const t2 = window.setTimeout(measure, 200);

    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
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

  if (!focus) return null;

  const showLightbox = emphasis === 'lightbox' && targetLocal;
  const showNote =
    focus.note &&
    noteMode !== 'dismissed' &&
    (noteMode === 'docked' || notePos != null);

  const pad = 4;
  const cutout = targetLocal
    ? {
        top: targetLocal.top - pad,
        left: targetLocal.left - pad,
        width: targetLocal.width + pad * 2,
        height: targetLocal.height + pad * 2,
      }
    : null;

  const pointerPosition = pointerFor(
    noteMode === 'docked' ? 'docked' : 'anchored',
    notePos?.placement ?? null,
  );

  return (
    <div className={styles['wt-focus']} aria-hidden={!showNote}>
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

      {showNote && focus.note && (
        <div
          ref={noteRef}
          className={[
            styles['wt-focus__note'],
            noteMode === 'docked' ? styles['wt-focus__note--docked'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            noteMode === 'docked'
              ? undefined
              : { top: notePos?.top, left: notePos?.left }
          }
        >
          <TourPoint
            title={focus.note.title}
            pointerPosition={pointerPosition}
            showPulsingDot={noteMode === 'anchored'}
            onClose={() => setNoteMode('dismissed')}
          >
            <ul className={styles['wt-focus__note-list']}>
              {focus.note.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </TourPoint>
        </div>
      )}
    </div>
  );
}
