import { useState } from 'react';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import ArrowCollapseIcon from '@mattermost/compass-icons/components/arrow-collapse';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MonitorOffIcon from '@mattermost/compass-icons/components/monitor-off';
import RecordCircleOutlineIcon from '@mattermost/compass-icons/components/record-circle-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import CallParticipantAvatar from '@/components/CallParticipantAvatar/CallParticipantAvatar';
import CallInfoPanel from '@/components/CallInfoPanel/CallInfoPanel';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import RecordingPill from '@/components/RecordingPill/RecordingPill';
import ParticipantsPanel from '@/components/ParticipantsPanel/ParticipantsPanel';
import { usePopoverTransition } from '@mattermost/compass-ui';
import type { Participant } from '@/types/callParticipant';
import styles from './CallPopout.module.scss';

export interface CallPopoutProps {
  participants: Participant[];
  /** ID of the signed-in participant (used for the "(you)" label in the participants panel). */
  currentUserId?: string;
  muted: boolean;
  onToggleMute: () => void;
  onCollapse?: () => void;
  onLeave: () => void;
  infoOpen: boolean;
  onInfoToggle: () => void;
  externalEnabled: boolean;
  onExternalEnabledChange: (v: boolean) => void;
  internalLink: string;
  externalLink: string;
  dialInNumber: string;
  dialInPin: string;
  /** 'windowed' renders inside a fake browser chrome. 'fullscreen' fills the frame. */
  variant?: 'windowed' | 'fullscreen';
  /** When true, the Call Info panel renders in 'guest' mode (no internal link, no toggle, only external details). */
  guestView?: boolean;
  /** Window title and dialog aria-label (e.g. "Call - UX Design"). */
  callTitle?: string;
}

export default function CallPopout({
  participants,
  currentUserId,
  muted,
  onToggleMute,
  onCollapse,
  onLeave,
  infoOpen,
  onInfoToggle,
  externalEnabled,
  onExternalEnabledChange,
  internalLink,
  externalLink,
  dialInNumber,
  dialInPin,
  variant = 'windowed',
  guestView = false,
  callTitle = 'Call - UX Design',
}: CallPopoutProps) {
  const fullscreen = variant === 'fullscreen';
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const infoTransition = usePopoverTransition(infoOpen);
  const rootClass = `${styles.popout} ${
    fullscreen ? styles['popout--fullscreen'] : ''
  }`;

  return (
    <div
      className={rootClass}
      role="dialog"
      aria-modal="false"
      aria-label={callTitle}
    >
      {!fullscreen && (
        <div className={styles['popout__app-header']}>
          <span className={styles['popout__window-controls']}>
            <button
              type="button"
              aria-label="Close call window"
              className={`${styles['popout__window-dot']} ${styles['popout__window-dot--close']}`}
              onClick={onCollapse}
            />
            <span
              aria-hidden
              className={`${styles['popout__window-dot']} ${styles['popout__window-dot--min']}`}
            />
            <span
              aria-hidden
              className={`${styles['popout__window-dot']} ${styles['popout__window-dot--max']}`}
            />
          </span>
          <span className={styles['popout__app-title']}>{callTitle}</span>
        </div>
      )}

      <div className={styles['popout__container']}>
        <div className={styles['popout__header']}>
          <div className={styles['popout__header-left']}>
            <RecordingPill state="Recording" />
            <span className={styles['popout__elapsed']}>
              3:39 &middot; {participants.length} participants
            </span>
          </div>
          <div className={styles['popout__header-right']}>
            <IconButton
              size="Small"
              style="Inverted"
              toggled={infoOpen}
              aria-label={infoOpen ? 'Close call info' : 'Open call info'}
              icon={<Icon size="16" glyph={<InformationOutlineIcon />} />}
              onClick={onInfoToggle}
            />
            {!fullscreen && (
              <IconButton
                size="Small"
                style="Inverted"
                aria-label="Collapse call"
                icon={<Icon size="16" glyph={<ArrowCollapseIcon />} />}
                onClick={onCollapse}
              />
            )}
          </div>

          {infoTransition.mounted && (
            <div
              className={`${styles['popout__info-popover']} ${
                infoTransition.visible
                  ? styles['popout__info-popover--visible']
                  : ''
              }`}
            >
              <CallInfoPanel
                variant={guestView ? 'guest' : 'host'}
                internalLink={internalLink}
                externalLink={externalLink}
                dialInNumber={dialInNumber}
                dialInPin={dialInPin}
                externalEnabled={externalEnabled}
                onExternalEnabledChange={onExternalEnabledChange}
              />
            </div>
          )}
        </div>

        <div className={styles['popout__stage']}>
          <div className={styles['popout__room']}>
            <div className={styles['popout__grid']}>
              {participants.map((p) => (
                <CallParticipantAvatar
                  key={p.id}
                  src={p.avatarSrc}
                  alt={p.name}
                  name={p.name}
                  size="Medium"
                  kind={p.kind}
                  host={p.host}
                  external={p.external}
                  talking={p.talking}
                />
              ))}
            </div>
          </div>
          {participantsOpen && (
            <ParticipantsPanel
              participants={participants}
              currentUserId={currentUserId}
              onClose={() => setParticipantsOpen(false)}
            />
          )}
        </div>

        <div className={styles['popout__controls']}>
          <div className={styles['popout__controls-left']}>
            <IconButton
              size="Medium"
              style="Inverted"
              toggled={participantsOpen}
              count={participants.length}
              aria-label={`Participants (${participants.length})`}
              icon={<Icon size="20" glyph={<AccountMultipleOutlineIcon />} />}
              onClick={() => setParticipantsOpen((v) => !v)}
            />
          </div>

          <div className={styles['popout__controls-middle']}>
            <IconButton
              size="Medium"
              style="Inverted"
              aria-label={muted ? 'Unmute' : 'Mute'}
              icon={
                <Icon
                  size="20"
                  glyph={muted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
                />
              }
              onClick={onToggleMute}
            />
            <IconButton
              size="Medium"
              style="Inverted"
              aria-label="Share screen"
              icon={<Icon size="20" glyph={<MonitorOffIcon />} />}
            />
            {!fullscreen && (
              <IconButton
                size="Medium"
                style="Inverted"
                aria-label="Record"
                icon={<Icon size="20" glyph={<RecordCircleOutlineIcon />} />}
              />
            )}
            <IconButton
              size="Medium"
              style="Inverted"
              aria-label="Reactions"
              icon={<Icon size="20" glyph={<EmoticonHappyOutlineIcon />} />}
            />
            <IconButton
              size="Medium"
              style="Inverted"
              aria-label="Chat"
              icon={<Icon size="20" glyph={<MessageTextOutlineIcon />} />}
            />
            <IconButton
              size="Medium"
              style="Inverted"
              aria-label="More"
              icon={<Icon size="20" glyph={<DotsHorizontalIcon />} />}
            />
          </div>

          <div className={styles['popout__controls-right']}>
            <IconButton
              size="Medium"
              destructive
              aria-label="Leave call"
              icon={<Icon size="20" glyph={<PhoneHangupIcon />} />}
              onClick={onLeave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
