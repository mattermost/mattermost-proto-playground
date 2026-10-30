import { useEffect, useRef, useState, type ReactNode } from 'react';
import { RecordingIndicator } from '@mattermost/compass-proto';
import type { StageLayout } from '../../layout/computeStageLayout';
import { CallControlsBar, type CallControlsBarProps } from '../CallControlsBar';
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

/** Matches `--duration-moderate`; the pane is unmounted after this. */
const PANE_EXIT_MS = 300;

/**
 * Keeps the last pane mounted through its exit and flips `expanded` a frame
 * after mount so the open transition runs. Reduced motion unmounts at once.
 */
function usePaneTransition(pane: ReactNode) {
  const open = Boolean(pane);
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open);
  const lastPane = useRef(pane);
  if (pane) lastPane.current = pane;

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setExpanded(true)),
      );
      return () => cancelAnimationFrame(raf);
    }
    setExpanded(false);
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(
      () => setMounted(false),
      reduce ? 0 : PANE_EXIT_MS,
    );
    return () => window.clearTimeout(t);
  }, [open]);

  return {
    node: mounted ? lastPane.current : null,
    expanded: expanded && open,
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
      headerRight={
        <ViewToggle
          view={view}
          onChange={onViewChange}
          open={viewMenuOpen}
          onOpenChange={onViewMenuOpenChange}
        />
      }
    >
      <div className={styles['video-call-window']}>
        <div className={styles['video-call-window__stage']}>
          <div
            className={cx(
              styles['video-call-window__room'],
              Boolean(banner) && styles['video-call-window__room--has-banner'],
            )}
            onPointerDown={onDismissOverlays}
          >
            <VideoStage
              layout={layout}
              participants={participants}
              clips={clips}
              selfStream={selfStream}
              shareContent={shareContent}
              labels={stageLabels}
              getTileMenu={getTileMenu}
            />
            {banner && (
              <div className={styles['video-call-window__banner']}>
                {banner}
              </div>
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
                paneSlot.expanded && styles['video-call-window__pane--open'],
              )}
              aria-hidden={!paneSlot.expanded}
              inert={!paneSlot.expanded}
            >
              <div className={styles['video-call-window__pane-clip']}>
                <div className={styles['video-call-window__pane-body']}>
                  {paneSlot.node}
                </div>
              </div>
            </div>
          )}
        </div>

        <CallControlsBar {...controls} />
      </div>
    </VideoCallWindowFrame>
  );
}
