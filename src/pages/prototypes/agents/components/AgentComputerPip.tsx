import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import ArrowCollapseIcon from '@mattermost/compass-icons/components/arrow-collapse';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import AgentAvatar from './AgentAvatar';
import type { AgentColor, AgentShape } from '../agentsData';
import styles from './AgentComputerPip.module.scss';

const EXIT_MS = 150;
const GAP = 8;
const EDGE = 16;
const FALLBACK_W = 420;
const FALLBACK_H = 280;

type AgentComputerPipProps = {
  open: boolean;
  fullscreen: boolean;
  /** Button rect used to anchor the PiP near the computer control. */
  anchorRect: DOMRect | null;
  agentName: string;
  shape: AgentShape;
  color: AgentColor;
  imageSrc?: string;
  onClose: () => void;
  onToggleFullscreen: () => void;
};

function clampPosition(nextLeft: number, nextTop: number, width: number, height: number) {
  const maxLeft = window.innerWidth - width - EDGE;
  const maxTop = window.innerHeight - height - EDGE;
  return {
    left: Math.min(Math.max(EDGE, nextLeft), Math.max(EDGE, maxLeft)),
    top: Math.min(Math.max(EDGE, nextTop), Math.max(EDGE, maxTop)),
  };
}

/**
 * Floating “agent computer” frame — PiP by default, expandable to fullscreen.
 * Content surface is a placeholder until the demo beat is defined.
 */
export default function AgentComputerPip({
  open,
  fullscreen,
  anchorRect,
  agentName,
  shape,
  color,
  imageSrc,
  onClose,
  onToggleFullscreen,
}: AgentComputerPipProps) {
  const { rendered, exiting } = useExitAnimation(open, EXIT_MS);
  const panelRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [dragging, setDragging] = useState(false);
  // Keep last open anchor through exit so the panel doesn’t jump.
  const lastAnchorRef = useRef<DOMRect | null>(null);
  const userMovedRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (anchorRect) {
      lastAnchorRef.current = anchorRect;
      userMovedRef.current = false;
    }
  }, [anchorRect]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreen) {
          onToggleFullscreen();
          return;
        }
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, fullscreen, onClose, onToggleFullscreen]);

  useLayoutEffect(() => {
    if (!rendered || fullscreen || userMovedRef.current) return;
    const anchor = lastAnchorRef.current;
    if (!anchor) return;

    const panel = panelRef.current;
    const width = panel?.offsetWidth || FALLBACK_W;
    const height = panel?.offsetHeight || FALLBACK_H;

    // Hang under the control, right edges aligned (header button sits top-right).
    const spaceBelow = window.innerHeight - anchor.bottom - GAP - EDGE;
    const placeAbove = height > spaceBelow && anchor.top - GAP - EDGE >= height;
    const next = clampPosition(
      anchor.right - width,
      placeAbove ? anchor.top - height - GAP : anchor.bottom + GAP,
      width,
      height,
    );
    setLeft(next.left);
    setTop(next.top);
  }, [rendered, fullscreen, anchorRect, open]);

  const onHeaderPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (fullscreen || exiting) return;
    if ((event.target as Element).closest('button')) return;

    const panel = panelRef.current;
    if (!panel) return;

    event.preventDefault();
    dragOffsetRef.current = {
      x: event.clientX - left,
      y: event.clientY - top,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onHeaderPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging) return;
    const panel = panelRef.current;
    const width = panel?.offsetWidth || FALLBACK_W;
    const height = panel?.offsetHeight || FALLBACK_H;
    const next = clampPosition(
      event.clientX - dragOffsetRef.current.x,
      event.clientY - dragOffsetRef.current.y,
      width,
      height,
    );
    userMovedRef.current = true;
    setLeft(next.left);
    setTop(next.top);
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!rendered) return null;

  return createPortal(
    <div
      className={[
        styles['agent-computer-pip'],
        fullscreen ? styles['agent-computer-pip--fullscreen'] : '',
        exiting ? styles['agent-computer-pip--exiting'] : '',
        dragging ? styles['agent-computer-pip--dragging'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={fullscreen ? undefined : { top, left }}
      role="dialog"
      aria-label={`${agentName} computer`}
      aria-modal={fullscreen}
    >
      {fullscreen ? (
        <button
          type="button"
          className={styles['agent-computer-pip__backdrop']}
          aria-label="Exit fullscreen"
          onClick={onToggleFullscreen}
        />
      ) : null}
      <div
        ref={panelRef}
        className={styles['agent-computer-pip__panel']}
      >
        <header
          className={styles['agent-computer-pip__header']}
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className={styles['agent-computer-pip__title']}>
            <AgentAvatar
              shape={shape}
              color={color}
              size="xs"
              eyes
              shadow={false}
              imageSrc={imageSrc}
            />
            <div className={styles['agent-computer-pip__title-text']}>
              <p className={styles['agent-computer-pip__name']}>{agentName}</p>
              <p className={styles['agent-computer-pip__subtitle']}>Computer</p>
            </div>
          </div>
          <div className={styles['agent-computer-pip__actions']}>
            <IconButton
              size="small"
              padding="compact"
              icon={
                <Icon
                  glyph={
                    fullscreen ? <ArrowCollapseIcon /> : <ArrowExpandIcon />
                  }
                  size="16"
                />
              }
              aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              onClick={onToggleFullscreen}
            />
            <IconButton
              size="small"
              padding="compact"
              icon={<Icon glyph={<CloseIcon />} size="16" />}
              aria-label="Close computer"
              onClick={onClose}
            />
          </div>
        </header>
        <div className={styles['agent-computer-pip__screen']}>
          <div className={styles['agent-computer-pip__placeholder']}>
            <p className={styles['agent-computer-pip__placeholder-title']}>
              {agentName} is working…
            </p>
            <p className={styles['agent-computer-pip__placeholder-body']}>
              Agent computer view — content TBD.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
