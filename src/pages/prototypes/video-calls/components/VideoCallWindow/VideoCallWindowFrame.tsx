import type { ReactNode } from 'react';
import ArrowCollapseIcon from '@mattermost/compass-icons/components/arrow-collapse';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import styles from './VideoCallWindowFrame.module.scss';

export interface VideoCallWindowFrameLabels {
  /** Fake window title bar text and dialog name. */
  title?: string;
  closeWindow?: string;
  collapse?: string;
}

export interface VideoCallWindowFrameProps {
  /** `windowed` adds the fake window title bar; `fullscreen` fills the frame. */
  variant?: 'windowed' | 'fullscreen';
  onCollapse: () => void;
  /** Header row, left side (e.g. elapsed time and count). */
  headerLeft?: ReactNode;
  /** Header row, right side, before the collapse button (e.g. the View toggle). */
  headerRight?: ReactNode;
  /** Body, below the header row, on the dark call surface. */
  children?: ReactNode;
  labels?: VideoCallWindowFrameLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<VideoCallWindowFrameLabels> = {
  title: 'Mattermost Call',
  closeWindow: 'Close call window',
  collapse: 'Collapse call',
};

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * The dark windowed call chrome shared by every window state (pre-join,
 * calling, live): fake title bar, header row with a collapse button and the
 * `--calls-bg` surface. Mirrors compass-proto `CallPopout`.
 */
export function VideoCallWindowFrame({
  variant = 'windowed',
  onCollapse,
  headerLeft,
  headerRight,
  children,
  labels,
  className,
}: VideoCallWindowFrameProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const fullscreen = variant === 'fullscreen';
  return (
    <div
      className={cx(
        styles['video-call-window-frame'],
        fullscreen && styles['video-call-window-frame--fullscreen'],
        className,
      )}
      role="dialog"
      aria-modal="false"
      aria-label={l.title}
    >
      {!fullscreen && (
        <div className={styles['video-call-window-frame__app-header']}>
          <span className={styles['video-call-window-frame__window-controls']}>
            <button
              type="button"
              aria-label={l.closeWindow}
              className={cx(
                styles['video-call-window-frame__window-dot'],
                styles['video-call-window-frame__window-dot--close'],
              )}
              onClick={onCollapse}
            />
            <span
              aria-hidden
              className={cx(
                styles['video-call-window-frame__window-dot'],
                styles['video-call-window-frame__window-dot--min'],
              )}
            />
            <span
              aria-hidden
              className={cx(
                styles['video-call-window-frame__window-dot'],
                styles['video-call-window-frame__window-dot--max'],
              )}
            />
          </span>
          <span className={styles['video-call-window-frame__app-title']}>
            {l.title}
          </span>
        </div>
      )}

      <div className={styles['video-call-window-frame__container']}>
        <div className={styles['video-call-window-frame__header']}>
          <div className={styles['video-call-window-frame__header-left']}>
            {headerLeft}
          </div>
          <div className={styles['video-call-window-frame__header-right']}>
            {headerRight}
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
        {children}
      </div>
    </div>
  );
}
