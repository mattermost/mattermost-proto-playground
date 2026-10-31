import type { ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import MonitorOffIcon from '@mattermost/compass-icons/components/monitor-off';
import MonitorShareIcon from '@mattermost/compass-icons/components/monitor-share';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { UserAvatarGroup } from '@mattermost/compass-ui/components/user-avatar-group';
import { CallingPulse } from '../CallingPulse';
import { MicLevelMeter } from '../MicLevelMeter';
import { PhaseCrossfade } from '../PhaseCrossfade';
import type { VideoStageClip, VideoStageParticipant } from '../VideoStage';
import { VideoTile } from '../VideoTile';
import { WidgetFrame } from '../WidgetFrame';
import {
  WidgetMediaControls,
  type WidgetMediaControlsLabels,
} from '../WidgetMediaControls';
import styles from './VideoCallWidget.module.scss';

export type VideoCallWidgetPhase = 'pre-join' | 'calling' | 'active';

export interface VideoCallWidgetPerson {
  key: string;
  name: string;
  src?: string;
}

export interface VideoCallWidgetLabels extends WidgetMediaControlsLabels {
  /** Accessible name of the widget region, per phase. */
  regionPreJoin?: string;
  regionCalling?: string;
  regionActive?: string;
  expand?: string;
  /** Heading when starting a 1:1 call. */
  titleStart?: string;
  /** Heading when joining a group / channel call. */
  titleJoin?: string;
  start?: string;
  join?: string;
  cancel?: string;
  micLevel?: string;
  /** "Calling Name…". */
  calling?: (name: string) => string;
  /** "N people in the call". */
  peopleInCall?: (count: number) => string;
  participants?: (count: number) => string;
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
  /** Which step of the call the card shows; the card itself stays mounted. */
  phase: VideoCallWidgetPhase;

  // --- Shared -------------------------------------------------------------
  micOn: boolean;
  onToggleMic: () => void;
  /** Chevron next to the mic; omit for a plain toggle (the host offers the picker elsewhere). */
  onOpenMicMenu?: () => void;
  micMenuOpen?: boolean;
  /** Host-rendered device menu, anchored above the card. */
  micMenu?: ReactNode;
  cameraOn: boolean;
  onToggleCamera: () => void;
  /** Omit for a plain camera toggle. */
  onOpenCameraMenu?: () => void;
  cameraMenuOpen?: boolean;
  cameraMenu?: ReactNode;
  /** Live webcam stream for the self preview / self thumbnail. */
  selfStream?: MediaStream | null;
  onExpand: () => void;
  /** Cancel (pre-join, calling). */
  onCancel?: () => void;

  // --- Pre-join -----------------------------------------------------------
  /** `start` rings the other person (1:1); `join` enters a call in progress. */
  joinMode?: 'start' | 'join';
  selfName?: string;
  selfAvatarSrc?: string;
  /** Mic input level 0..1 for the test meter. */
  micLevel?: number;
  /** Who is already in the call (join mode). */
  people?: readonly VideoCallWidgetPerson[];
  onPrimary?: () => void;

  // --- Calling ------------------------------------------------------------
  peerName?: string;
  peerAvatarSrc?: string;

  // --- Active -------------------------------------------------------------
  channelName?: string;
  /** `m:ss`. */
  elapsedLabel?: string;
  /** Everyone in the call; the first two non-self participants get thumbnails. */
  participants?: readonly VideoStageParticipant[];
  clips?: Record<string, VideoStageClip>;
  participantCount?: number;
  participantsOpen?: boolean;
  onToggleParticipants?: () => void;
  /** Host-rendered participants surface, anchored above the card. */
  participantsPopover?: ReactNode;
  sharing?: boolean;
  onToggleShare?: () => void;
  moreOpen?: boolean;
  onToggleMore?: () => void;
  /** Host-rendered menu, anchored above the card. */
  moreMenu?: ReactNode;
  /** Additional host-rendered popovers (e.g. output picker, call info). */
  extraPopovers?: ReactNode;
  /** Shows a small recording dot in the header. */
  recording?: boolean;
  onLeave?: () => void;

  labels?: VideoCallWidgetLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<VideoCallWidgetLabels> = {
  regionPreJoin: 'Call setup',
  regionCalling: 'Outgoing call',
  regionActive: 'Active call',
  expand: 'Expand call window',
  titleStart: 'Ready to start the call?',
  titleJoin: 'Ready to join?',
  start: 'Start call',
  join: 'Join call',
  cancel: 'Cancel',
  micLevel: 'Microphone level',
  calling: (name) => `Calling ${name}…`,
  peopleInCall: (n) => `${n} ${n === 1 ? 'person' : 'people'} in the call`,
  participants: (n) => `Participants (${n})`,
  mute: 'Mute microphone',
  unmute: 'Unmute microphone',
  micOptions: 'Microphone options',
  cameraOn: 'Turn camera on',
  cameraOff: 'Turn camera off',
  cameraOptions: 'Camera options',
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
 * The call widget (302px, same width as the outbound-calls widget): ONE card
 * for pre-join, calling and the live call. The frame, header, media row and
 * controls row stay mounted across phases; the media area animates its height
 * and crossfades its content, and the mic / camera controls keep their place.
 * Presentational; the host owns every state and popover.
 */
export function VideoCallWidget({
  phase,
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
  onExpand,
  onCancel,
  joinMode = 'start',
  selfName = '',
  selfAvatarSrc,
  micLevel = 0,
  people = [],
  onPrimary,
  peerName = '',
  peerAvatarSrc,
  channelName = '',
  elapsedLabel = '',
  participants = [],
  clips = {},
  participantCount = 0,
  participantsOpen = false,
  onToggleParticipants,
  participantsPopover,
  sharing = false,
  onToggleShare,
  moreOpen = false,
  onToggleMore,
  moreMenu,
  extraPopovers,
  recording = false,
  onLeave,
  labels,
  className,
}: VideoCallWidgetProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const showPeople =
    phase === 'pre-join' && joinMode === 'join' && people.length > 0;

  const remote = participants.filter((p) => !p.self);
  const self = participants.find((p) => p.self);
  // Peer(s) first, then the signed-in user; the chip counts remote people hidden.
  const thumbs = [remote[0], self].filter(
    (p): p is VideoStageParticipant => !!p,
  );
  const extra = Math.max(0, remote.length - 1);

  const region =
    phase === 'pre-join'
      ? l.regionPreJoin
      : phase === 'calling'
        ? l.regionCalling
        : l.regionActive;

  const lead =
    phase === 'pre-join' ? (
      <h2 className={styles['video-call-widget__title']}>
        {joinMode === 'start' ? l.titleStart : l.titleJoin}
      </h2>
    ) : phase === 'active' ? (
      <>
        <span className={styles['video-call-widget__channel']}>
          <span className={styles['video-call-widget__channel-name']}>
            {channelName}
          </span>
        </span>
        <span className={styles['video-call-widget__elapsed']}>
          &middot; {elapsedLabel}
        </span>
        {recording && (
          <span
            className={styles['video-call-widget__rec']}
            role="img"
            aria-label="Recording"
            title="Recording"
          />
        )}
      </>
    ) : null;

  const media =
    phase === 'pre-join' ? (
      <div className={styles['video-call-widget__pre-join']}>
        <div className={styles['video-call-widget__preview']}>
          <VideoTile
            name={selfName}
            avatarSrc={selfAvatarSrc}
            stream={selfStream}
            cameraOn={cameraOn}
            muted={!micOn}
            mirrored
            selfLabel={l.self}
          />
        </div>
        {showPeople && (
          <div className={styles['video-call-widget__people']}>
            <UserAvatarGroup
              avatars={people.map((p) => ({
                key: p.key,
                src: p.src,
                name: p.name,
              }))}
              max={4}
              size="24"
            />
            <span className={styles['video-call-widget__people-label']}>
              {l.peopleInCall(people.length)}
            </span>
          </div>
        )}
      </div>
    ) : phase === 'calling' ? (
      <div className={styles['video-call-widget__peer']} aria-live="polite">
        <CallingPulse>
          <UserAvatar src={peerAvatarSrc} alt="" name={peerName} size="48" />
        </CallingPulse>
        <p className={styles['video-call-widget__status']}>
          {l.calling(peerName)}
        </p>
      </div>
    ) : (
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
    );

  const trailing =
    phase === 'pre-join' ? (
      <MicLevelMeter
        className={styles['video-call-widget__meter']}
        level={micLevel}
        segments={10}
        muted={!micOn}
        label={l.micLevel}
        showIcon={false}
      />
    ) : phase === 'calling' ? (
      <Button emphasis="primary" destructive size="small" onClick={onCancel}>
        {l.cancel}
      </Button>
    ) : (
      <>
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
      </>
    );

  return (
    <WidgetFrame
      ariaLabel={region}
      className={cx(styles['video-call-widget'], className)}
      popovers={
        <>
          {participantsPopover}
          {micMenu}
          {cameraMenu}
          {moreMenu}
          {extraPopovers}
        </>
      }
    >
      <div className={styles['video-call-widget__header']}>
        <PhaseCrossfade phaseKey={phase} align="fill">
          <div className={styles['video-call-widget__lead']}>{lead}</div>
        </PhaseCrossfade>
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

      <div
        className={cx(
          styles['video-call-widget__media'],
          styles[`video-call-widget__media--${phase}`],
          showPeople && styles['video-call-widget__media--people'],
        )}
      >
        <PhaseCrossfade phaseKey={phase} align="fill">
          {media}
        </PhaseCrossfade>
      </div>

      <div
        className={cx(
          styles['video-call-widget__controls'],
          phase === 'pre-join' &&
            styles['video-call-widget__controls--with-actions'],
        )}
      >
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
        <div className={styles['video-call-widget__trailing']}>
          <PhaseCrossfade phaseKey={phase} align="fill">
            <div className={styles['video-call-widget__trailing-inner']}>
              {trailing}
            </div>
          </PhaseCrossfade>
        </div>
      </div>

      {/* Pre-join actions: stay mounted, collapse once the call is on. */}
      <div
        className={cx(
          styles['video-call-widget__actions'],
          phase === 'pre-join' && styles['video-call-widget__actions--open'],
        )}
        aria-hidden={phase !== 'pre-join'}
        inert={phase !== 'pre-join'}
      >
        <div className={styles['video-call-widget__actions-clip']}>
          <div className={styles['video-call-widget__actions-row']}>
            <Button emphasis="tertiary" size="small" onClick={onCancel}>
              {l.cancel}
            </Button>
            <Button
              className={styles['video-call-widget__start']}
              emphasis="primary"
              size="small"
              leadingIcon={<Icon size="12" glyph={<PhoneIcon />} />}
              onClick={onPrimary}
            >
              {joinMode === 'start' ? l.start : l.join}
            </Button>
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
