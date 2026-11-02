import { useEffect, useRef, type ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import MonitorOffIcon from '@mattermost/compass-icons/components/monitor-off';
import MonitorShareIcon from '@mattermost/compass-icons/components/monitor-share';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import DialpadIcon from '@mattermost/compass-icons/components/dialpad';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { UserAvatarGroup } from '@mattermost/compass-ui/components/user-avatar-group';
import type { CallMode } from '@/types/videoCall';
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

/** Small live preview of what you share; a placeholder when there is no capture. */
function ShareThumb({ stream }: { stream?: MediaStream | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream ?? null;
  }, [stream]);
  return (
    <span
      className={styles['video-call-widget__share-thumb']}
      aria-hidden="true"
    >
      {stream ? (
        <video
          ref={ref}
          className={styles['video-call-widget__share-video']}
          autoPlay
          muted
          playsInline
        />
      ) : (
        <Icon size="24" glyph={<MonitorShareIcon />} />
      )}
    </span>
  );
}

export type VideoCallWidgetPhase =
  'pre-join' | 'calling' | 'joining' | 'active';

export interface VideoCallWidgetPerson {
  key: string;
  name: string;
  src?: string;
}

export interface VideoCallWidgetLabels extends WidgetMediaControlsLabels {
  /** Accessible name of the widget region, per phase. */
  regionPreJoin?: string;
  regionCalling?: string;
  regionJoining?: string;
  regionActive?: string;
  expand?: string;
  /** Heading when starting a 1:1 call. */
  titleStart?: (name: string) => string;
  /** Heading when joining a group / channel call. */
  titleJoin?: (name: string) => string;
  start?: string;
  join?: string;
  cancel?: string;
  micLevel?: string;
  /** "Calling Name…". */
  calling?: (name: string) => string;
  /** Compact header title while someone speaks: "Name is talking". */
  isTalking?: (name: string) => string;
  /** Phone badge text. */
  phone?: string;
  keypad?: string;
  /** "Joining call with Name…" after accepting an incoming call. */
  joining?: (name: string) => string;
  /** "N people in the call". */
  peopleInCall?: (count: number) => string;
  participants?: (count: number) => string;
  share?: string;
  stopShare?: string;
  /** "You're sharing Name" shown in the media row while you share. */
  sharingStatus?: (what: string) => string;
  /** Stop button text in the sharing state. */
  stopSharing?: string;
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
  /**
   * `video` (default) is the full card. `audio` drops the camera control and
   * self view. `phone` is audio-only plus a phone badge and keypad button,
   * with no participants, share, More or expand.
   */
  mode?: CallMode;
  /** Phone mode: the dialed number and its label, e.g. "312-555-0174 · Office". */
  phoneLabel?: string;

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
  /** Hide the People button (not meaningful in a 1:1 DM). */
  hideParticipants?: boolean;
  participantsOpen?: boolean;
  onToggleParticipants?: () => void;
  /** Host-rendered participants surface, anchored above the card. */
  participantsPopover?: ReactNode;
  sharing?: boolean;
  /** What is being shared ("Entire screen", a window name, …). */
  shareLabel?: string;
  /** Live capture shown as a thumbnail in the sharing state; omit for a placeholder. */
  shareStream?: MediaStream | null;
  onToggleShare?: () => void;
  moreOpen?: boolean;
  onToggleMore?: () => void;
  /** Host-rendered menu, anchored above the card. */
  moreMenu?: ReactNode;
  /** Additional host-rendered popovers (e.g. output picker, call info). */
  extraPopovers?: ReactNode;
  /** Host-rendered notice stack (joined, recording, host changes…), shown above the card like a menu. */
  notices?: ReactNode;
  /** Shows a small recording dot in the header. */
  recording?: boolean;
  onLeave?: () => void;

  labels?: VideoCallWidgetLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<VideoCallWidgetLabels> = {
  regionPreJoin: 'Call setup',
  regionCalling: 'Outgoing call',
  regionJoining: 'Joining call',
  regionActive: 'Active call',
  expand: 'Expand call window',
  titleStart: (name) => `Start call with ${name}`,
  titleJoin: (name) => `Join call with ${name}`,
  start: 'Start call',
  join: 'Join call',
  cancel: 'Cancel',
  micLevel: 'Microphone level',
  calling: (name) => `Calling ${name}…`,
  isTalking: (name) => `${name} is talking`,
  phone: 'Phone',
  keypad: 'Keypad',
  joining: (name) => `Joining call with ${name}…`,
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
  sharingStatus: (what) => `You're sharing ${what}`,
  stopSharing: 'Stop sharing',
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
  mode = 'video',
  phoneLabel = '',
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
  hideParticipants = false,
  participantsOpen = false,
  onToggleParticipants,
  participantsPopover,
  sharing = false,
  shareLabel = 'your screen',
  shareStream,
  onToggleShare,
  moreOpen = false,
  onToggleMore,
  moreMenu,
  extraPopovers,
  notices,
  recording = false,
  onLeave,
  labels,
  className,
}: VideoCallWidgetProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const isPhone = mode === 'phone';
  const hideCamera = mode !== 'video';
  const showPeople =
    phase === 'pre-join' && joinMode === 'join' && people.length > 0;

  const remote = participants.filter((p) => !p.self);
  const self = participants.find((p) => p.self);
  // Always speaker view: the person talking (else the first remote person)
  // fills the card and you sit in a small self PiP. The chip counts the other
  // remote people who are not shown.
  const speaker = remote.find((p) => p.talking && !p.muted) ?? remote[0];
  const extra = Math.max(0, remote.length - 1);
  // Audio-only and phone calls have no video to show, so the live call drops
  // the 16:9 area and reads like the compass-proto call widget: a speaker
  // avatar with "Name is talking", the time under it, then the controls. While
  // sharing, the media row still shows what you share.
  const compact = phase === 'active' && mode !== 'video' && !sharing;
  // Audio-only pre-join has no camera to preview, so no 16:9 self preview.
  const noPreview = phase === 'pre-join' && mode !== 'video';

  const region =
    phase === 'pre-join'
      ? l.regionPreJoin
      : phase === 'calling'
        ? l.regionCalling
        : phase === 'joining'
          ? l.regionJoining
          : l.regionActive;

  const lead =
    phase === 'pre-join' ? (
      <h2 className={styles['video-call-widget__title']}>
        {joinMode === 'start'
          ? l.titleStart(channelName)
          : l.titleJoin(channelName)}
      </h2>
    ) : compact ? (
      (() => {
        const talking = !isPhone && !!speaker?.talking && !speaker.muted;
        const name = isPhone ? peerName : (speaker?.name ?? channelName);
        const src = isPhone ? peerAvatarSrc : speaker?.avatarSrc;
        const title = isPhone
          ? peerName
          : talking
            ? l.isTalking(speaker!.name)
            : channelName;
        const sub = isPhone
          ? `${elapsedLabel} · ${phoneLabel}`
          : talking
            ? `${elapsedLabel} · ${channelName}`
            : elapsedLabel;
        return (
          <span className={styles['video-call-widget__lead-compact']}>
            <UserAvatar size="32" src={src} alt="" name={name} />
            <span className={styles['video-call-widget__lead-text']}>
              <span className={styles['video-call-widget__lead-title']}>
                <span className={styles['video-call-widget__lead-title-text']}>
                  {title}
                </span>
                {isPhone && (
                  <Tag
                    label={l.phone}
                    type="default"
                    size="x-small"
                    casing="all-caps"
                  />
                )}
              </span>
              <span className={styles['video-call-widget__lead-sub']}>
                {sub}
                {recording && (
                  <span
                    className={styles['video-call-widget__rec']}
                    role="img"
                    aria-label="Recording"
                    title="Recording"
                  />
                )}
              </span>
            </span>
          </span>
        );
      })()
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
        {!noPreview && (
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
        )}
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
        {isPhone && (
          <p className={styles['video-call-widget__sub']}>{phoneLabel}</p>
        )}
      </div>
    ) : phase === 'joining' ? (
      <div className={styles['video-call-widget__peer']} aria-live="polite">
        <UserAvatar src={peerAvatarSrc} alt="" name={peerName} size="48" />
        <p className={styles['video-call-widget__status']}>
          {l.joining(peerName)}
        </p>
      </div>
    ) : compact ? null : sharing ? (
      <div className={styles['video-call-widget__sharing']}>
        <ShareThumb stream={shareStream} />
        <div className={styles['video-call-widget__sharing-body']}>
          <p
            className={styles['video-call-widget__sharing-text']}
            role="status"
          >
            <span
              className={styles['video-call-widget__sharing-dot']}
              aria-hidden="true"
            />
            <span className={styles['video-call-widget__sharing-label']}>
              {l.sharingStatus(shareLabel)}
            </span>
          </p>
          <Button
            emphasis="primary"
            destructive
            size="small"
            onClick={onToggleShare}
          >
            {l.stopSharing}
          </Button>
        </div>
      </div>
    ) : (
      <div className={styles['video-call-widget__speaker']}>
        {speaker && (
          <VideoTile
            className={styles['video-call-widget__speaker-tile']}
            name={speaker.name}
            avatarSrc={speaker.avatarSrc}
            videoSrc={speaker.clipId ? clips[speaker.clipId]?.src : undefined}
            posterSrc={
              speaker.clipId ? clips[speaker.clipId]?.poster : undefined
            }
            clipOffset={
              speaker.clipId ? clips[speaker.clipId]?.offset : undefined
            }
            clipMirrored={
              speaker.clipId ? clips[speaker.clipId]?.mirrored : undefined
            }
            cameraOn={speaker.cameraOn}
            muted={speaker.muted}
            speaking={!!speaker.talking && !speaker.muted}
            handRaised={speaker.handRaised}
            reaction={speaker.reaction}
            connection={speaker.connection}
            size="thumbnail"
            showName
          />
        )}
        {extra > 0 && (
          <span
            className={styles['video-call-widget__overflow']}
            role="img"
            aria-label={l.overflowAria(extra)}
          >
            {l.overflow(extra)}
          </span>
        )}
        {self && mode === 'video' && (
          <div className={styles['video-call-widget__pip']}>
            <VideoTile
              className={styles['video-call-widget__pip-tile']}
              name={self.name}
              avatarSrc={self.avatarSrc}
              stream={selfStream}
              mirrored
              cameraOn={self.cameraOn}
              muted={self.muted}
              speaking={!!self.talking && !self.muted}
              handRaised={self.handRaised}
              reaction={self.reaction}
              size="thumbnail"
              showLabel={false}
              selfLabel={l.self}
            />
          </div>
        )}
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
    ) : phase === 'calling' || phase === 'joining' ? (
      <Button emphasis="primary" destructive size="small" onClick={onCancel}>
        {l.cancel}
      </Button>
    ) : isPhone ? (
      <>
        <IconButton
          size="small"
          padding="compact"
          disabled
          aria-label={l.keypad}
          title={l.keypad}
          icon={<Icon size="16" glyph={<DialpadIcon />} />}
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
    ) : (
      <>
        {!hideParticipants && (
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
        )}
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
          {notices && (
            <div className={styles['video-call-widget__notices']}>
              {notices}
            </div>
          )}
        </>
      }
    >
      <div className={styles['video-call-widget__header']}>
        <PhaseCrossfade phaseKey={phase} align="fill">
          <div className={styles['video-call-widget__lead']}>{lead}</div>
        </PhaseCrossfade>
        {/* A phone call has no window to expand to. */}
        {!isPhone && (
          <IconButton
            size="small"
            padding="compact"
            className={styles['video-call-widget__expand']}
            aria-label={l.expand}
            title={l.expand}
            icon={<Icon size="16" glyph={<ArrowExpandIcon />} />}
            disabled={phase === 'joining'}
            onClick={onExpand}
          />
        )}
      </div>

      <div
        className={cx(
          styles['video-call-widget__media'],
          styles[`video-call-widget__media--${phase}`],
          compact && styles['video-call-widget__media--compact'],
          noPreview && styles['video-call-widget__media--no-preview'],
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
          hideCamera={hideCamera}
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
