import type { ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import HandRightIcon from '@mattermost/compass-icons/components/hand-right';
import HandRightOutlineIcon from '@mattermost/compass-icons/components/hand-right-outline';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import MonitorShareIcon from '@mattermost/compass-icons/components/monitor-share';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import VideoOffOutlineIcon from '@mattermost/compass-icons/components/video-off-outline';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import type { VideoStageClip, VideoStageParticipant } from '../VideoStage';
import { VideoTile } from '../VideoTile';
import styles from './VideoCallWidget.module.scss';

export interface VideoCallWidgetLabels {
  /** Accessible name of the widget region. */
  region?: string;
  expand?: string;
  participants?: (count: number) => string;
  mute?: string;
  unmute?: string;
  cameraOn?: string;
  cameraOff?: string;
  raiseHand?: string;
  lowerHand?: string;
  share?: string;
  stopShare?: string;
  more?: string;
  leave?: string;
  /** Suffix after the signed-in user's name on a tile, e.g. "You". */
  self?: string;
  overflow?: (count: number) => string;
  overflowAria?: (count: number) => string;
}

export interface VideoCallWidgetProps {
  channelName: string;
  /** `m:ss`. */
  elapsedLabel: string;
  /** Everyone in the call; the first two non-self participants get thumbnails. */
  participants: readonly VideoStageParticipant[];
  clips?: Record<string, VideoStageClip>;
  participantCount: number;
  participantsOpen?: boolean;
  onToggleParticipants: () => void;
  /** Host-rendered participants surface, anchored above the card. */
  participantsPopover?: ReactNode;

  micOn: boolean;
  onToggleMic: () => void;
  cameraOn: boolean;
  onToggleCamera: () => void;
  handRaised: boolean;
  onToggleHand: () => void;
  sharing: boolean;
  onToggleShare: () => void;
  moreOpen?: boolean;
  onToggleMore: () => void;
  /** Host-rendered menu, anchored above the card. */
  moreMenu?: ReactNode;

  onExpand: () => void;
  onLeave: () => void;
  labels?: VideoCallWidgetLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<VideoCallWidgetLabels> = {
  region: 'Active call',
  expand: 'Expand call window',
  participants: (n) => `Participants (${n})`,
  mute: 'Mute microphone',
  unmute: 'Unmute microphone',
  cameraOn: 'Turn camera on',
  cameraOff: 'Turn camera off',
  raiseHand: 'Raise hand',
  lowerHand: 'Lower hand',
  share: 'Share screen',
  stopShare: 'Stop sharing screen',
  more: 'More options',
  leave: 'Leave call',
  self: 'You',
  overflow: (n) => `+${n}`,
  overflowAria: (n) => `${n} more ${n === 1 ? 'participant' : 'participants'}`,
};

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * Minimized call card (Figma widget, 280px): header, two video thumbnails and a
 * compact controls row. Mirrors compass-proto `CallWidget` chrome but swaps its
 * avatar header for live thumbnails. Presentational; host owns every state and
 * popover.
 */
export function VideoCallWidget({
  channelName,
  elapsedLabel,
  participants,
  clips = {},
  participantCount,
  participantsOpen = false,
  onToggleParticipants,
  participantsPopover,
  micOn,
  onToggleMic,
  cameraOn,
  onToggleCamera,
  handRaised,
  onToggleHand,
  sharing,
  onToggleShare,
  moreOpen = false,
  onToggleMore,
  moreMenu,
  onExpand,
  onLeave,
  labels,
  className,
}: VideoCallWidgetProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const remote = participants.filter((p) => !p.self);
  const thumbs = remote.slice(0, 2);
  const extra = Math.max(0, remote.length - thumbs.length);

  return (
    <div
      className={cx(styles['video-call-widget'], className)}
      role="region"
      aria-label={l.region}
    >
      <div className={styles['video-call-widget__body']}>
        <div className={styles['video-call-widget__header']}>
          <span className={styles['video-call-widget__channel']}>
            <Icon size="16" glyph={<GlobeIcon />} />
            <span className={styles['video-call-widget__channel-name']}>
              {channelName}
            </span>
          </span>
          <span className={styles['video-call-widget__elapsed']}>
            &middot; {elapsedLabel}
          </span>
          <IconButton
            size="small"
            padding="compact"
            className={styles['video-call-widget__expand']}
            aria-label={l.expand}
            title={l.expand}
            icon={<Icon size="16" glyph={<ArrowExpandIcon />} />}
            onClick={onExpand}
          />
        </div>

        {thumbs.length > 0 && (
          <div className={styles['video-call-widget__thumbs']}>
            {thumbs.map((p, i) => {
              const clip = p.clipId ? clips[p.clipId] : undefined;
              const showOverflow = extra > 0 && i === thumbs.length - 1;
              return (
                <div key={p.id} className={styles['video-call-widget__thumb']}>
                  <VideoTile
                    name={p.name}
                    avatarSrc={p.avatarSrc}
                    videoSrc={clip?.src}
                    posterSrc={clip?.poster}
                    cameraOn={p.cameraOn}
                    muted={p.muted}
                    speaking={!!p.talking && !p.muted}
                    handRaised={p.handRaised}
                    reaction={p.reaction}
                    connection={p.connection}
                    size="thumbnail"
                    selfLabel={l.self}
                  />
                  {showOverflow && (
                    <span
                      className={styles['video-call-widget__overflow']}
                      role="img"
                      aria-label={l.overflowAria(extra)}
                    >
                      {l.overflow(extra)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className={styles['video-call-widget__controls']}>
          <button
            type="button"
            className={cx(
              styles['video-call-widget__participants'],
              participantsOpen &&
                styles['video-call-widget__participants--active'],
            )}
            aria-label={l.participants(participantCount)}
            aria-expanded={participantsOpen}
            title={l.participants(participantCount)}
            onClick={onToggleParticipants}
          >
            <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
            <span>{participantCount}</span>
          </button>

          <div className={styles['video-call-widget__actions']}>
            <IconButton
              size="small"
              padding="compact"
              className={cx(
                styles['video-call-widget__toggle'],
                !micOn && styles['video-call-widget__toggle--off'],
              )}
              aria-label={micOn ? l.mute : l.unmute}
              title={micOn ? l.mute : l.unmute}
              icon={
                <Icon
                  size="16"
                  glyph={micOn ? <MicrophoneIcon /> : <MicrophoneOffIcon />}
                />
              }
              onClick={onToggleMic}
            />
            <IconButton
              size="small"
              padding="compact"
              className={cx(
                styles['video-call-widget__toggle'],
                !cameraOn && styles['video-call-widget__toggle--off'],
              )}
              aria-label={cameraOn ? l.cameraOff : l.cameraOn}
              title={cameraOn ? l.cameraOff : l.cameraOn}
              icon={
                <Icon
                  size="16"
                  glyph={
                    cameraOn ? <VideoOutlineIcon /> : <VideoOffOutlineIcon />
                  }
                />
              }
              onClick={onToggleCamera}
            />
            <IconButton
              size="small"
              padding="compact"
              toggled={handRaised}
              aria-label={handRaised ? l.lowerHand : l.raiseHand}
              title={handRaised ? l.lowerHand : l.raiseHand}
              icon={
                <Icon
                  size="16"
                  glyph={
                    handRaised ? <HandRightIcon /> : <HandRightOutlineIcon />
                  }
                />
              }
              onClick={onToggleHand}
            />
            <IconButton
              size="small"
              padding="compact"
              toggled={sharing}
              aria-label={sharing ? l.stopShare : l.share}
              title={sharing ? l.stopShare : l.share}
              icon={<Icon size="16" glyph={<MonitorShareIcon />} />}
              onClick={onToggleShare}
            />
            <IconButton
              size="small"
              padding="compact"
              toggled={moreOpen}
              aria-label={l.more}
              title={l.more}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
              onClick={onToggleMore}
            />
            <button
              type="button"
              className={styles['video-call-widget__hangup']}
              aria-label={l.leave}
              title={l.leave}
              onClick={onLeave}
            >
              <Icon size="16" glyph={<PhoneHangupIcon />} />
            </button>
          </div>
        </div>
      </div>

      {participantsPopover && (
        <div className={styles['video-call-widget__popover']}>
          {participantsPopover}
        </div>
      )}
      {moreMenu && (
        <div className={styles['video-call-widget__popover']}>{moreMenu}</div>
      )}
    </div>
  );
}
