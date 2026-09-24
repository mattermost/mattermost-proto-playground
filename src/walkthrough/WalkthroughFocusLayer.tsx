import { useEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import type { WalkthroughFocus } from '@/walkthrough/types';
import styles from './WalkthroughFocusLayer.module.scss';

type Placement = 'below' | 'above' | 'beside';

type NotePos = {
  top: number;
  left: number;
  placement: Placement;
};

type WalkthroughFocusLayerProps = {
  focus: WalkthroughFocus | null;
  /** Scope queries to the prototype stage root. */
  stageRef: React.RefObject<HTMLElement | null>;
};

function resolveEmphasis(focus: WalkthroughFocus): Set<'ring' | 'lightbox'> {
  const list = focus.emphasis?.length ? focus.emphasis : (['ring'] as const);
  return new Set(list);
}

function placeNote(
  target: DOMRect,
  noteHeight: number,
  viewportW: number,
  viewportH: number,
): NotePos | 'dock' {
  const gap = 12;
  const width = Math.min(300, viewportW - 24);
  const belowTop = target.bottom + gap;
  if (belowTop + noteHeight < viewportH - 12) {
    return {
      top: belowTop,
      left: Math.min(Math.max(12, target.left), viewportW - width - 12),
      placement: 'below',
    };
  }
  const aboveTop = target.top - gap - noteHeight;
  if (aboveTop > 12) {
    return {
      top: aboveTop,
      left: Math.min(Math.max(12, target.left), viewportW - width - 12),
      placement: 'above',
    };
  }
  const besideLeft = target.right + gap;
  if (besideLeft + width < viewportW - 12) {
    return {
      top: Math.min(Math.max(12, target.top), viewportH - noteHeight - 12),
      left: besideLeft,
      placement: 'beside',
    };
  }
  return 'dock';
}

export default function WalkthroughFocusLayer({
  focus,
  stageRef,
}: WalkthroughFocusLayerProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
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
    setTargetRect(null);
  }, [focus?.id]);

  useEffect(() => {
    if (!focus) return;

    let frame = 0;
    const find = () =>
      (stageRef.current ?? document).querySelector(
        `[data-tour-focus="${CSS.escape(focus.id)}"]`,
      ) as HTMLElement | null;

    const clearHighlight = () => {
      document
        .querySelectorAll('[data-tour-highlight="true"]')
        .forEach((el) => el.removeAttribute('data-tour-highlight'));
    };

    const measure = () => {
      const el = find();
      if (!el) {
        setTargetRect(null);
        return;
      }
      if (emphasis.has('ring')) {
        el.setAttribute('data-tour-highlight', 'true');
      }
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      if (focus.note && noteMode === 'anchored') {
        const h = noteRef.current?.offsetHeight ?? 160;
        const placed = placeNote(rect, h, window.innerWidth, window.innerHeight);
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
      setNoteMode('docked');
    };
    document.addEventListener('mousedown', onInteract, true);
    document.addEventListener('focusin', onInteract, true);
    return () => {
      document.removeEventListener('mousedown', onInteract, true);
      document.removeEventListener('focusin', onInteract, true);
    };
  }, [focus?.note, noteMode]);

  if (!focus) return null;

  const showLightbox = emphasis.has('lightbox') && targetRect;
  const showNote =
    focus.note &&
    noteMode !== 'dismissed' &&
    (noteMode === 'docked' || notePos != null);

  return (
    <>
      {showLightbox && targetRect && (
        <div className={styles['wt-focus__lightbox']} aria-hidden>
          <div
            className={styles['wt-focus__cutout']}
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
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
    </>
  );
}
