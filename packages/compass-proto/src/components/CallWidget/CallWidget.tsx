import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MonitorOffIcon from '@mattermost/compass-icons/components/monitor-off';
import MonitorIcon from '@mattermost/compass-icons/components/monitor';
import RecordCircleOutlineIcon from '@mattermost/compass-icons/components/record-circle-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import HandRightOutlineIcon from '@mattermost/compass-icons/components/hand-right-outline';
import HandRightIcon from '@mattermost/compass-icons/components/hand-right';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import VolumeHighIcon from '@mattermost/compass-icons/components/volume-high';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import { UserAvatar } from '@mattermost/compass-ui';
import CallInfoPanel from '@/components/CallInfoPanel/CallInfoPanel';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import { MenuItem } from '@mattermost/compass-ui';
import ParticipantsPanel from '@/components/ParticipantsPanel/ParticipantsPanel';
import { usePopoverTransition } from '@mattermost/compass-ui';
import type { Participant } from '@/types/callParticipant';
import styles from './CallWidget.module.scss';

export interface CallWidgetProps {
  participants: Participant[];
  currentUserId?: string;
  talkerName: string;
  talkerAvatarSrc: string;
  channelName: string;
  muted: boolean;
  onToggleMute: () => void;
  handRaised: boolean;
  onToggleHand: () => void;
  sharing: boolean;
  onToggleShare: () => void;
  onExpand: () => void;
  onLeave: () => void;
  overlay: 'menu' | 'info' | 'participants' | null;
  onToggleMenu: () => void;
  onToggleParticipants: () => void;
  onOpenCallInfo: () => void;
  onCloseCallInfo: () => void;
  externalEnabled: boolean;
  onExternalEnabledChange: (v: boolean) => void;
  internalLink: string;
  externalLink: string;
  dialInNumber: string;
  dialInPin: string;
}

export default function CallWidget({
  participants,
  currentUserId,
  talkerName,
  talkerAvatarSrc,
  channelName,
  muted,
  onToggleMute,
  handRaised,
  onToggleHand,
  sharing,
  onToggleShare,
  onExpand,
  onLeave,
  overlay,
  onToggleMenu,
  onToggleParticipants,
  onOpenCallInfo,
  onCloseCallInfo,
  externalEnabled,
  onExternalEnabledChange,
  internalLink,
  externalLink,
  dialInNumber,
  dialInPin,
}: CallWidgetProps) {
  const participantCount = participants.length;
  const participantsActive = overlay === 'participants';
  const participantsButtonClass = [
    styles['widget__participants'],
    participantsActive ? styles['widget__participants--active'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const menuTransition = usePopoverTransition(overlay === 'menu');
  const infoTransition = usePopoverTransition(overlay === 'info');
  const participantsTransition = usePopoverTransition(
    overlay === 'participants',
  );

  return (
    <div className={styles.widget} role="region" aria-label="Active call">
      <div className={styles['widget__body']}>
        <div className={styles['widget__header']}>
          <UserAvatar size="32" src={talkerAvatarSrc} alt={talkerName} />
          <div className={styles['widget__header-text']}>
            <div className={styles['widget__title']}>
              <span className={styles['widget__title-name']}>{talkerName}</span>
              <span className={styles['widget__title-tail']}> is talking</span>
            </div>
            <div className={styles['widget__sub']}>
              <span className={styles['widget__elapsed']}>3:39</span>
              <span className={styles['widget__sub-sep']} aria-hidden>
                &middot;
              </span>
              <span className={styles['widget__channel']}>
                <Icon size="12" glyph={<GlobeIcon />} />
                {channelName}
              </span>
            </div>
          </div>
          <IconButton
            size="Small"
            padding="Compact"
            aria-label="Expand call window"
            icon={<Icon size="16" glyph={<ArrowExpandIcon />} />}
            onClick={onExpand}
          />
        </div>

        <div className={styles['widget__controls']}>
          <button
            type="button"
            className={participantsButtonClass}
            aria-label={`${participantCount} participants`}
            aria-expanded={participantsActive}
            onClick={onToggleParticipants}
          >
            <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
            <span>{participantCount}</span>
          </button>

          <div className={styles['widget__actions']}>
            <IconButton
              size="Small"
              padding="Compact"
              toggled={muted}
              destructive={muted}
              aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
              icon={
                <Icon
                  size="16"
                  glyph={muted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
                />
              }
              onClick={onToggleMute}
            />
            <IconButton
              size="Small"
              padding="Compact"
              toggled={handRaised}
              aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
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
              size="Small"
              padding="Compact"
              toggled={sharing}
              aria-label={sharing ? 'Stop sharing screen' : 'Share screen'}
              icon={
                <Icon
                  size="16"
                  glyph={sharing ? <MonitorIcon /> : <MonitorOffIcon />}
                />
              }
              onClick={onToggleShare}
            />
            <IconButton
              size="Small"
              padding="Compact"
              toggled={overlay === 'menu'}
              aria-label={
                overlay === 'menu' ? 'Close call menu' : 'Open call menu'
              }
              icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
              onClick={onToggleMenu}
            />
            <button
              type="button"
              aria-label="Leave call"
              className={styles['widget__hangup']}
              onClick={onLeave}
            >
              <Icon size="16" glyph={<PhoneHangupIcon />} />
            </button>
          </div>
        </div>
      </div>

      {menuTransition.mounted && (
        <div
          className={`${styles['widget__popover']} ${
            menuTransition.visible ? styles['widget__popover--visible'] : ''
          }`}
        >
          <div className={styles['widget__menu']} role="menu">
            <MenuItem
              label="Audio output"
              secondaryLabel="Default"
              leadingVisual={<Icon size="16" glyph={<VolumeHighIcon />} />}
              trailingElement
              trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
            />
            <MenuItem
              label="Microphone"
              secondaryLabel="Default"
              leadingVisual={<Icon size="16" glyph={<MicrophoneIcon />} />}
              trailingElement
              trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
            />
            <MenuItem
              label="Camera"
              secondaryLabel="Default"
              leadingVisual={<Icon size="16" glyph={<VideoOutlineIcon />} />}
              trailingElement
              trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
            />
            <div className={styles['widget__menu-divider']} role="separator" />
            <MenuItem
              label="Record call"
              leadingVisual={
                <Icon size="16" glyph={<RecordCircleOutlineIcon />} />
              }
            />
            <MenuItem
              label="Show chat thread"
              leadingVisual={
                <Icon size="16" glyph={<MessageTextOutlineIcon />} />
              }
            />
            <MenuItem
              label="Call info"
              leadingVisual={
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              }
              onClick={onOpenCallInfo}
            />
            <MenuItem
              label="Additional settings"
              leadingVisual={<Icon size="16" glyph={<CogOutlineIcon />} />}
            />
          </div>
        </div>
      )}

      {infoTransition.mounted && (
        <div
          className={`${styles['widget__popover']} ${
            infoTransition.visible ? styles['widget__popover--visible'] : ''
          }`}
        >
          <CallInfoPanel
            fullWidth
            onClose={onCloseCallInfo}
            internalLink={internalLink}
            externalLink={externalLink}
            dialInNumber={dialInNumber}
            dialInPin={dialInPin}
            externalEnabled={externalEnabled}
            onExternalEnabledChange={onExternalEnabledChange}
          />
        </div>
      )}

      {participantsTransition.mounted && (
        <div
          className={`${styles['widget__popover']} ${
            participantsTransition.visible
              ? styles['widget__popover--visible']
              : ''
          }`}
        >
          <ParticipantsPanel
            variant="widget"
            participants={participants}
            currentUserId={currentUserId}
          />
        </div>
      )}
    </div>
  );
}
