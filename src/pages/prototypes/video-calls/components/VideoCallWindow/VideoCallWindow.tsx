import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import ArrowCollapseIcon from '@mattermost/compass-icons/components/arrow-collapse';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { RecordingPill } from '@mattermost/compass-proto';
import type { StageLayout } from '../../layout/computeStageLayout';
import { CallControlsBar, type CallControlsBarProps } from '../CallControlsBar';
import { CallNotice, type CallNoticeItem } from '../CallNotice';
import { ReactionBurst } from '../ReactionBurst';
import { ViewToggle, type ViewToggleValue } from '../ViewToggle';
import {
  VideoStage,
  type VideoStageClip,
  type VideoStageLabels,
  type VideoStageParticipant,
} from '../VideoStage';
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
  /** Side pane slot (participants / chat). */
  pane?: ReactNode;
  /** Pointer-down on the stage; hosts close open menus here. */
  onDismissOverlays?: () => void;

  controls: Omit<CallControlsBarProps, 'hidden'>;
  /** Keep the controls visible (a menu or pane is open). */
  keepControlsVisible?: boolean;
  /** Idle time before the controls hide. Default 3000. */
  idleHideMs?: number;

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

/**
 * Windowed call popout hosting `VideoStage` (mirrors compass-proto `CallPopout`
 * chrome: title bar, header row, dark stage, 3-zone controls). Plain props; the
 * scene wires state. Owns only the idle auto-hide timer and the Meet-style
 * shortcuts (Ctrl/Cmd+D mute, Ctrl/Cmd+E camera) while mounted.
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
  controls,
  keepControlsVisible = false,
  idleHideMs = 3000,
  labels,
  className,
}: VideoCallWindowProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const fullscreen = variant === 'fullscreen';
  const rootRef = useRef<HTMLDivElement>(null);
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const keepRef = useRef(keepControlsVisible);
  const shortcutRef = useRef({
    mic: controls.onToggleMic,
    camera: controls.onToggleCamera,
  });

  useEffect(() => {
    keepRef.current = keepControlsVisible;
    shortcutRef.current = {
      mic: controls.onToggleMic,
      camera: controls.onToggleCamera,
    };
  });

  const wake = useCallback(() => {
    setIdle(false);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const bar = rootRef.current?.querySelector('[role="toolbar"]');
      const focusInBar = !!bar && bar.contains(document.activeElement);
      if (!keepRef.current && !focusInBar) setIdle(true);
    }, idleHideMs);
  }, [idleHideMs]);

  // Start the idle timer on mount; restart whenever a menu/pane closes.
  useEffect(() => {
    wake();
    return () => window.clearTimeout(timerRef.current);
  }, [wake, keepControlsVisible]);

  // Document-level keyboard: wake the bar and handle the call shortcuts.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      wake();
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
  }, [wake]);

  return (
    <div
      ref={rootRef}
      className={cx(
        styles['video-call-window'],
        fullscreen && styles['video-call-window--fullscreen'],
        className,
      )}
      role="dialog"
      aria-modal="false"
      aria-label={l.title}
      onPointerMove={wake}
      onPointerDown={wake}
      onFocus={wake}
      onBlur={wake}
    >
      {!fullscreen && (
        <div className={styles['video-call-window__app-header']}>
          <span className={styles['video-call-window__window-controls']}>
            <button
              type="button"
              aria-label={l.closeWindow}
              className={cx(
                styles['video-call-window__window-dot'],
                styles['video-call-window__window-dot--close'],
              )}
              onClick={onCollapse}
            />
            <span
              aria-hidden
              className={cx(
                styles['video-call-window__window-dot'],
                styles['video-call-window__window-dot--min'],
              )}
            />
            <span
              aria-hidden
              className={cx(
                styles['video-call-window__window-dot'],
                styles['video-call-window__window-dot--max'],
              )}
            />
          </span>
          <span className={styles['video-call-window__app-title']}>
            {l.title}
          </span>
        </div>
      )}

      <div className={styles['video-call-window__container']}>
        <div className={styles['video-call-window__header']}>
          <div className={styles['video-call-window__header-left']}>
            {recording && (
              <RecordingPill state={recording} onStop={onStopRecording} />
            )}
            <span className={styles['video-call-window__elapsed']}>
              {elapsedLabel} &bull; {l.participants(participantCount)}
            </span>
          </div>
          <div className={styles['video-call-window__header-right']}>
            <ViewToggle
              view={view}
              onChange={onViewChange}
              open={viewMenuOpen}
              onOpenChange={onViewMenuOpenChange}
            />
            <IconButton
              size="small"
              style="inverted"
              aria-label={l.collapse}
              title={l.collapse}
              icon={<Icon size="16" glyph={<ArrowCollapseIcon />} />}
              onClick={onCollapse}
            />
          </div>
        </div>

        <div className={styles['video-call-window__stage']}>
          <div
            className={styles['video-call-window__room']}
            onPointerDown={onDismissOverlays}
          >
            <VideoStage
              layout={layout}
              participants={participants}
              clips={clips}
              selfStream={selfStream}
              shareContent={shareContent}
              labels={stageLabels}
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
          {pane}
        </div>

        <CallControlsBar {...controls} hidden={idle && !keepControlsVisible} />
      </div>
    </div>
  );
}
