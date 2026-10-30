import type { ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import HandRightIcon from '@mattermost/compass-icons/components/hand-right';
import HandRightOutlineIcon from '@mattermost/compass-icons/components/hand-right-outline';
import MonitorOffIcon from '@mattermost/compass-icons/components/monitor-off';
import MonitorShareIcon from '@mattermost/compass-icons/components/monitor-share';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import type { VideoStageClip, VideoStageParticipant } from '../VideoStage';
import { VideoTile } from '../VideoTile';
import { WidgetFrame } from '../WidgetFrame';
import {
  WidgetMediaControls,
  type WidgetMediaControlsLabels,
} from '../WidgetMediaControls';
import styles from './VideoCallWidget.module.scss';

export interface VideoCallWidgetLabels extends WidgetMediaControlsLabels {
  /** Accessible name of the widget region. */
  region?: string;
  expand?: string;
  participants?: (count: number) => string;
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
  /** Chevron next to the mic: the host toggles its device menu. */
  onOpenMicMenu: () => void;
  micMenuOpen?: boolean;
  /** Host-rendered device menu, anchored above the card. */
  micMenu?: ReactNode;
  cameraOn: boolean;
  onToggleCamera: () => void;
  onOpenCameraMenu: () => void;
  cameraMenuOpen?: boolean;
  cameraMenu?: ReactNode;
  /** Live webcam stream shown (mirrored) in the signed-in user's thumbnail. */
  selfStream?: MediaStream | null;
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
  micOptions: 'Microphone options',
  cameraOn: 'Turn camera on',
  cameraOff: 'Turn camera off',
  cameraOptions: 'Camera options',
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

/**
 * Minimized call card (302px, same as the outbound-calls widget): header, two video thumbnails and a
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
  onOpenMicMenu,
  micMenuOpen = false,
  micMenu,
  cameraOn,
  onToggleCamera,
  onOpenCameraMenu,
  cameraMenuOpen = false,
  cameraMenu,
  selfStream,
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
  const self = participants.find((p) => p.self);
  // Peer(s) first, then the signed-in user; the chip counts remote people hidden.
  const thumbs = [remote[0], self].filter(
    (p): p is VideoStageParticipant => !!p,
  );
  const extra = Math.max(0, remote.length - 1);

  return (
    <WidgetFrame
      ariaLabel={l.region}
      className={[styles['video-call-widget'], className]
        .filter(Boolean)
        .join(' ')}
      popovers={
        <>
          {participantsPopover}
          {micMenu}
          {cameraMenu}
          {moreMenu}
        </>
      }
    >
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
            const showOverflow = extra > 0 && i === 0;
            return (
              <div key={p.id} className={styles['video-call-widget__thumb']}>
                <VideoTile
                  className={styles['video-call-widget__tile']}
                  name={p.name}
                  avatarSrc={p.avatarSrc}
                  videoSrc={clip?.src}
                  posterSrc={clip?.poster}
                  stream={p.self ? selfStream : undefined}
                  mirrored={!!p.self}
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
        <IconButton
          size="small"
          padding="compact"
          active={participantsOpen}
          count={participantCount}
          aria-label={l.participants(participantCount)}
          title={l.participants(participantCount)}
          aria-haspopup="true"
          aria-expanded={participantsOpen}
          icon={<Icon size="16" glyph={<AccountMultipleOutlineIcon />} />}
          onClick={onToggleParticipants}
        />

        <div className={styles['video-call-widget__actions']}>
          <WidgetMediaControls
            micOn={micOn}
            onToggleMic={onToggleMic}
            onOpenMicMenu={onOpenMicMenu}
            micMenuOpen={micMenuOpen}
            cameraOn={cameraOn}
            onToggleCamera={onToggleCamera}
            onOpenCameraMenu={onOpenCameraMenu}
            cameraMenuOpen={cameraMenuOpen}
            labels={labels}
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
            icon={
              <Icon
                size="16"
                glyph={sharing ? <MonitorOffIcon /> : <MonitorShareIcon />}
              />
            }
            onClick={onToggleShare}
          />
          <IconButton
            size="small"
            padding="compact"
            active={moreOpen}
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
    </WidgetFrame>
  );
}
