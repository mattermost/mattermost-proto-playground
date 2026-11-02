import { useEffect, useRef, useState, type ReactNode } from 'react';
import { RecordingIndicator } from '@mattermost/compass-proto';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import type { StageLayout } from '../../layout/computeStageLayout';
import { CallControlsBar, type CallControlsBarProps } from '../CallControlsBar';
import { AudioRoom } from '../AudioRoom';
import { CallNotice, type CallNoticeItem } from '../CallNotice';
import { ReactionBurst } from '../ReactionBurst';
import type { VideoTileMenu } from '../VideoTile';
import { ViewToggle, type ViewToggleValue } from '../ViewToggle';
import {
  VideoStage,
  type VideoStageClip,
  type VideoStageLabels,
  type VideoStageParticipant,
} from '../VideoStage';
import { VideoCallWindowFrame } from './VideoCallWindowFrame';
import styles from './VideoCallWindow.module.scss';

export interface VideoCallWindowLabels {
  /** Fake window title bar text and dialog name. */
  title?: string;
  closeWindow?: string;
  collapse?: string;
  participants?: (count: number) => string;
}

export interface VideoCallWindowProps {
  /** `windowed` adds the fake window title bar; `fullscreen` fills the frame. */
  variant?: 'windowed' | 'fullscreen';

  /** Header: elapsed time (`m:ss`) and participant count. */
  elapsedLabel: string;
  participantCount: number;
  /** Optional recording pill (hidden when undefined). */
  recording?: 'initializing' | 'recording';
  onStopRecording?: () => void;
  view: ViewToggleValue;
  onViewChange: (view: ViewToggleValue) => void;
  viewMenuOpen: boolean;
  onViewMenuOpenChange: (open: boolean) => void;
  onCollapse: () => void;
  /**
   * Video is not available: the old-style room (avatars, no layouts, no self
   * view) instead of the video stage, and no view toggle. A screen share still
   * uses the share layout.
   */
  audioOnly?: boolean;

  /** Stage. */
  layout: StageLayout;
  participants: readonly VideoStageParticipant[];
  clips?: Record<string, VideoStageClip>;
  selfStream?: MediaStream | null;
  shareContent?: ReactNode;
  stageLabels?: VideoStageLabels;
  notices?: readonly CallNoticeItem[];
  onDismissNotice?: (id: string) => void;
  /** Stage-wide floating emoji; change `key` to replay. */
  burst?: { emoji: string; key: string | number } | null;
  /** Banner rendered over the top of the stage (e.g. "You are sharing"). */
  banner?: ReactNode;
  /**
   * Side pane slot (participants / chat). Set to open, `undefined` to close: the
   * window keeps the last pane mounted while it animates out.
   */
  pane?: ReactNode;
  /** Pointer-down on the stage; hosts close open menus here. */
  onDismissOverlays?: () => void;

  /** Host controls: per-tile menu (passed through to `VideoStage`). */
  getTileMenu?: (participantId: string) => VideoTileMenu | undefined;

  controls: CallControlsBarProps;

  labels?: VideoCallWindowLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<VideoCallWindowLabels> = {
  title: 'Mattermost Call',
  closeWindow: 'Close call window',
  collapse: 'Collapse call',
  participants: (n) => `${n} ${n === 1 ? 'participant' : 'participants'}`,
};

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/** Matches `--duration-quick`; the pane is unmounted after its exit. */
const PANE_EXIT_MS = 150;

/**
 * Keeps the last pane mounted through its exit animation (`useExitAnimation`).
 * Reduced motion is handled in CSS (animation off); the unmount delay is moot.
 */
function usePaneTransition(pane: ReactNode) {
  const open = Boolean(pane);
  const lastPane = useRef(pane);
  if (pane) lastPane.current = pane;
  const { rendered, exiting } = useExitAnimation(open, PANE_EXIT_MS);
  return {
    node: rendered || open ? lastPane.current : null,
    exiting: exiting || !open,
  };
}

/**
 * Windowed call popout hosting `VideoStage` (mirrors compass-proto `CallPopout`
 * chrome via `VideoCallWindowFrame`: title bar, header row, dark stage, 3-zone controls). Plain props; the
 * scene wires state. Owns only the Meet-style shortcuts (Ctrl/Cmd+D mute, Ctrl/Cmd+E camera) while mounted.
 */
export function VideoCallWindow({
  variant = 'windowed',
  elapsedLabel,
  participantCount,
  recording,
  onStopRecording,
  view,
  onViewChange,
  viewMenuOpen,
  onViewMenuOpenChange,
  onCollapse,
  audioOnly = false,
  layout,
  participants,
  clips,
  selfStream,
  shareContent,
  stageLabels,
  notices = [],
  onDismissNotice,
  burst,
  banner,
  pane,
  onDismissOverlays,
  getTileMenu,
  controls,
  labels,
  className,
}: VideoCallWindowProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const paneSlot = usePaneTransition(pane);
  const paneOpen = !!paneSlot.node && !paneSlot.exiting;
  const stageElRef = useRef<HTMLDivElement>(null);
  const [settledStageWidth, setSettledStageWidth] = useState<
    number | undefined
  >(undefined);

  // The room width once the pane slide finishes. The stage's own width does
  // not animate (only its end padding does), so project the target from it;
  // the speaker strip decides paging against this, not the in-flight width.
  useEffect(() => {
    const el = stageElRef.current;
    if (!el) return undefined;
    const read = () => {
      const cs = getComputedStyle(el);
      const inset = paneOpen
        ? (parseFloat(cs.getPropertyValue('--video-call-window-pane-w')) || 0) +
          (parseFloat(cs.getPropertyValue('--spacing-s')) || 0)
        : 0;
      setSettledStageWidth(Math.round(el.clientWidth - inset));
    };
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [paneOpen]);
  const shortcutRef = useRef({
    mic: controls.onToggleMic,
    camera: controls.onToggleCamera,
  });

  useEffect(() => {
    shortcutRef.current = {
      mic: controls.onToggleMic,
      camera: controls.onToggleCamera,
    };
  });

  // Document-level call shortcuts while the window is mounted.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === 'd') {
        e.preventDefault();
        shortcutRef.current.mic();
      } else if (key === 'e') {
        e.preventDefault();
        shortcutRef.current.camera();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <VideoCallWindowFrame
      variant={variant}
      onCollapse={onCollapse}
      className={className}
      labels={{
        title: l.title,
        closeWindow: l.closeWindow,
        collapse: l.collapse,
      }}
      headerLeft={
        <>
          {recording && (
            <RecordingIndicator state={recording} onStop={onStopRecording} />
          )}
          <span className={styles['video-call-window__elapsed']}>
            {elapsedLabel} &bull; {l.participants(participantCount)}
          </span>
        </>
      }
      headerCenter={banner}
      headerRight={
        audioOnly ? undefined : (
          <ViewToggle
            view={view}
            onChange={onViewChange}
            open={viewMenuOpen}
            onOpenChange={onViewMenuOpenChange}
          />
        )
      }
    >
      <div className={styles['video-call-window']}>
        <div
          ref={stageElRef}
          className={cx(
            styles['video-call-window__stage'],
            paneOpen && styles['video-call-window__stage--pane-open'],
          )}
        >
          <div
            className={styles['video-call-window__room']}
            onPointerDown={onDismissOverlays}
          >
            {audioOnly && !shareContent ? (
              <AudioRoom participants={participants} />
            ) : (
              <VideoStage
                layout={layout}
                participants={participants}
                clips={clips}
                selfStream={selfStream}
                shareContent={shareContent}
                labels={stageLabels}
                getTileMenu={getTileMenu}
                settledWidth={settledStageWidth}
              />
            )}
            {onDismissNotice && (
              <CallNotice notices={notices} onDismiss={onDismissNotice} />
            )}
            <ReactionBurst emoji={burst?.emoji} burstKey={burst?.key} />
          </div>
          {paneSlot.node && (
            <div
              className={cx(
                styles['video-call-window__pane'],
                paneSlot.exiting && styles['video-call-window__pane--exiting'],
              )}
              aria-hidden={paneSlot.exiting}
              inert={paneSlot.exiting}
            >
              {paneSlot.node}
            </div>
          )}
        </div>

        <CallControlsBar {...controls} />
      </div>
    </VideoCallWindowFrame>
  );
}
