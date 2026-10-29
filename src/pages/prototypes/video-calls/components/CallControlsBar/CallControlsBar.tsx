import type { ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import HandRightIcon from '@mattermost/compass-icons/components/hand-right';
import HandRightOutlineIcon from '@mattermost/compass-icons/components/hand-right-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import MonitorShareIcon from '@mattermost/compass-icons/components/monitor-share';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import VideoOffOutlineIcon from '@mattermost/compass-icons/components/video-off-outline';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import styles from './CallControlsBar.module.scss';

export interface CallControlsBarLabels {
  /** Accessible name of the toolbar. */
  toolbar?: string;
  participants?: (count: number) => string;
  mute?: string;
  unmute?: string;
  micOptions?: string;
  cameraOn?: string;
  cameraOff?: string;
  cameraOptions?: string;
  share?: string;
  stopShare?: string;
  reactions?: string;
  raiseHand?: string;
  lowerHand?: string;
  chat?: string;
  more?: string;
  leave?: string;
}

export interface CallControlsBarProps {
  /** Left zone: participants toggle with count. */
  participantCount: number;
  participantsOpen?: boolean;
  onToggleParticipants: () => void;

  micOn: boolean;
  onToggleMic: () => void;
  /** Chevron next to the mic; the device menu itself goes in `micMenu`. */
  onOpenMicMenu?: () => void;
  micMenuOpen?: boolean;
  /** Host-rendered menu (e.g. a `PopoverMenu`), anchored above the mic. */
  micMenu?: ReactNode;

  cameraOn: boolean;
  onToggleCamera: () => void;
  onOpenCameraMenu?: () => void;
  cameraMenuOpen?: boolean;
  cameraMenu?: ReactNode;

  sharing: boolean;
  onToggleShare: () => void;

  reactionsOpen?: boolean;
  onToggleReactions: () => void;
  /** Host-rendered tray, anchored above the reactions button. */
  reactionTray?: ReactNode;

  handRaised: boolean;
  onToggleHand: () => void;

  chatOpen?: boolean;
  /** Blue unread dot on the chat button. */
  chatUnread?: boolean;
  onToggleChat: () => void;

  moreOpen?: boolean;
  onToggleMore: () => void;
  moreMenu?: ReactNode;

  /** Right zone: red Leave. */
  onLeave: () => void;

  /** Idle auto-hide (owned by the window). Hidden bars are inert. */
  hidden?: boolean;
  labels?: CallControlsBarLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<CallControlsBarLabels> = {
  toolbar: 'Call controls',
  participants: (n) => `Participants (${n})`,
  mute: 'Mute microphone',
  unmute: 'Unmute microphone',
  micOptions: 'Microphone options',
  cameraOn: 'Turn camera on',
  cameraOff: 'Turn camera off',
  cameraOptions: 'Camera options',
  share: 'Share screen',
  stopShare: 'Stop sharing screen',
  reactions: 'Reactions',
  raiseHand: 'Raise hand',
  lowerHand: 'Lower hand',
  chat: 'Chat',
  more: 'More options',
  leave: 'Leave call',
};

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * Three-zone in-call controls (Figma popout): participants left; mic / camera /
 * share / reactions / hand / chat / more centered; red Leave right. Presentational:
 * every toggle state and menu is owned by the host.
 */
export function CallControlsBar({
  participantCount,
  participantsOpen = false,
  onToggleParticipants,
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
  sharing,
  onToggleShare,
  reactionsOpen = false,
  onToggleReactions,
  reactionTray,
  handRaised,
  onToggleHand,
  chatOpen = false,
  chatUnread = false,
  onToggleChat,
  moreOpen = false,
  onToggleMore,
  moreMenu,
  onLeave,
  hidden = false,
  labels,
  className,
}: CallControlsBarProps) {
  const l = { ...DEFAULT_LABELS, ...labels };

  const micLabel = micOn ? l.mute : l.unmute;
  const cameraLabel = cameraOn ? l.cameraOff : l.cameraOn;
  const handLabel = handRaised ? l.lowerHand : l.raiseHand;
  const shareLabel = sharing ? l.stopShare : l.share;

  return (
    <div
      className={cx(
        styles['call-controls-bar'],
        hidden && styles['call-controls-bar--hidden'],
        className,
      )}
      role="toolbar"
      aria-label={l.toolbar}
      inert={hidden || undefined}
    >
      <div className={styles['call-controls-bar__left']}>
        <IconButton
          size="medium"
          style="inverted"
          toggled={participantsOpen}
          count={participantCount}
          aria-label={l.participants(participantCount)}
          title={l.participants(participantCount)}
          icon={<Icon size="20" glyph={<AccountMultipleOutlineIcon />} />}
          onClick={onToggleParticipants}
        />
      </div>

      <div className={styles['call-controls-bar__center']}>
        <div className={styles['call-controls-bar__slot']}>
          <div className={styles['call-controls-bar__split']}>
            <IconButton
              size="medium"
              style="inverted"
              className={cx(
                styles['call-controls-bar__toggle'],
                micOn
                  ? styles['call-controls-bar__toggle--on']
                  : styles['call-controls-bar__toggle--off'],
              )}
              aria-label={micLabel}
              title={micLabel}
              icon={
                <Icon
                  size="20"
                  glyph={micOn ? <MicrophoneIcon /> : <MicrophoneOffIcon />}
                />
              }
              onClick={onToggleMic}
            />
            {onOpenMicMenu && (
              <IconButton
                size="medium"
                style="inverted"
                padding="compact"
                className={styles['call-controls-bar__chevron']}
                aria-label={l.micOptions}
                title={l.micOptions}
                aria-haspopup="menu"
                aria-expanded={micMenuOpen}
                icon={<Icon size="16" glyph={<ChevronUpIcon />} />}
                onClick={onOpenMicMenu}
              />
            )}
          </div>
          {micMenu && (
            <div className={styles['call-controls-bar__popover']}>
              {micMenu}
            </div>
          )}
        </div>

        <div className={styles['call-controls-bar__slot']}>
          <div className={styles['call-controls-bar__split']}>
            <IconButton
              size="medium"
              style="inverted"
              className={cx(
                styles['call-controls-bar__toggle'],
                cameraOn
                  ? styles['call-controls-bar__toggle--on']
                  : styles['call-controls-bar__toggle--off'],
              )}
              aria-label={cameraLabel}
              title={cameraLabel}
              icon={
                <Icon
                  size="20"
                  glyph={
                    cameraOn ? <VideoOutlineIcon /> : <VideoOffOutlineIcon />
                  }
                />
              }
              onClick={onToggleCamera}
            />
            {onOpenCameraMenu && (
              <IconButton
                size="medium"
                style="inverted"
                padding="compact"
                className={styles['call-controls-bar__chevron']}
                aria-label={l.cameraOptions}
                title={l.cameraOptions}
                aria-haspopup="menu"
                aria-expanded={cameraMenuOpen}
                icon={<Icon size="16" glyph={<ChevronUpIcon />} />}
                onClick={onOpenCameraMenu}
              />
            )}
          </div>
          {cameraMenu && (
            <div className={styles['call-controls-bar__popover']}>
              {cameraMenu}
            </div>
          )}
        </div>

        <IconButton
          size="medium"
          style="inverted"
          toggled={sharing}
          aria-label={shareLabel}
          title={shareLabel}
          icon={<Icon size="20" glyph={<MonitorShareIcon />} />}
          onClick={onToggleShare}
        />

        <div className={styles['call-controls-bar__slot']}>
          <IconButton
            size="medium"
            style="inverted"
            toggled={reactionsOpen}
            aria-label={l.reactions}
            title={l.reactions}
            aria-haspopup="menu"
            aria-expanded={reactionsOpen}
            icon={<Icon size="20" glyph={<EmoticonHappyOutlineIcon />} />}
            onClick={onToggleReactions}
          />
          {reactionTray && (
            <div className={styles['call-controls-bar__popover']}>
              {reactionTray}
            </div>
          )}
        </div>

        <IconButton
          size="medium"
          style="inverted"
          toggled={handRaised}
          aria-label={handLabel}
          title={handLabel}
          icon={
            <Icon
              size="20"
              glyph={handRaised ? <HandRightIcon /> : <HandRightOutlineIcon />}
            />
          }
          onClick={onToggleHand}
        />

        <IconButton
          size="medium"
          style="inverted"
          toggled={chatOpen}
          unreadBadge={chatUnread && !chatOpen}
          aria-label={l.chat}
          title={l.chat}
          icon={<Icon size="20" glyph={<MessageTextOutlineIcon />} />}
          onClick={onToggleChat}
        />

        <div className={styles['call-controls-bar__slot']}>
          <IconButton
            size="medium"
            style="inverted"
            toggled={moreOpen}
            aria-label={l.more}
            title={l.more}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            icon={<Icon size="20" glyph={<DotsHorizontalIcon />} />}
            onClick={onToggleMore}
          />
          {moreMenu && (
            <div className={styles['call-controls-bar__popover']}>
              {moreMenu}
            </div>
          )}
        </div>
      </div>

      <div className={styles['call-controls-bar__right']}>
        <IconButton
          size="medium"
          destructive
          aria-label={l.leave}
          title={l.leave}
          icon={<Icon size="20" glyph={<PhoneHangupIcon />} />}
          onClick={onLeave}
        />
      </div>
    </div>
  );
}
