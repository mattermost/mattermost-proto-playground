import { useEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
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

function resolveEmphasis(focus: WalkthroughFocus): Set<'ring' | 'lightbox'> {
  const list = focus.emphasis?.length ? focus.emphasis : (['ring'] as const);
  return new Set(list);
}

/** Place note in stage-local coordinates. */
function placeNote(
  target: StageRect,
  noteHeight: number,
  stageW: number,
  stageH: number,
): NotePos | 'dock' {
  const gap = 12;
  const width = Math.min(300, stageW - 24);
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
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [notePos, setNotePos] = useState<NotePos | null>(null);
  const [noteMode, setNoteMode] = useState<'anchored' | 'docked' | 'dismissed'>(
    'anchored',
  );
  const noteRef = useRef<HTMLDivElement>(null);

  const emphasis = useMemo(
    () => (focus ? resolveEmphasis(focus) : new Set<'ring' | 'lightbox'>()),
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
        `[data-tour-focus="${CSS.escape(focus.id)}"]`,
      ) as HTMLElement | null;

    const clearHighlight = () => {
      (stageRef.current ?? document)
        .querySelectorAll('[data-tour-highlight="true"]')
        .forEach((el) => el.removeAttribute('data-tour-highlight'));
    };

    const measure = () => {
      const stage = stageRef.current;
      const el = find();
      if (!stage || !el) {
        setTargetLocal(null);
        return;
      }
      if (emphasis.has('ring')) {
        el.setAttribute('data-tour-highlight', 'true');
      }
      const stageRect = stage.getBoundingClientRect();
      setStageSize({ width: stageRect.width, height: stageRect.height });
      const local = toStageLocal(el.getBoundingClientRect(), stageRect);
      setTargetLocal(local);
      if (focus.note && noteMode === 'anchored') {
        const h = noteRef.current?.offsetHeight ?? 160;
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
      // Ignore interactions in the narrative / jump chrome — only dock when
      // the user engages the prototype stage itself.
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

  const showLightbox = emphasis.has('lightbox') && targetLocal;
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
            notePos ? styles[`wt-focus__note--${notePos.placement}`] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            noteMode === 'docked'
              ? undefined
              : { top: notePos?.top, left: notePos?.left }
          }
          role="note"
          aria-label={`Design note: ${focus.note.title}`}
        >
          <p className={styles['wt-focus__note-eyebrow']}>Design note</p>
          <div className={styles['wt-focus__note-head']}>
            <div className={styles['wt-focus__note-title']}>{focus.note.title}</div>
            <IconButton
              size="x-small"
              aria-label="Dismiss annotation"
              icon={<Icon glyph={<CloseIcon />} />}
              onClick={() => setNoteMode('dismissed')}
            />
          </div>
          <ul className={styles['wt-focus__note-list']}>
            {focus.note.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Keep stageSize referenced so measure updates stay intentional */}
      <span className={styles['wt-focus__sr']} aria-hidden>
        {stageSize.width}x{stageSize.height}
      </span>
    </div>
  );
}
