import { CallParticipantAvatar } from '@mattermost/compass-proto';
import type { VideoStageParticipant } from '../VideoStage';
import styles from './AudioRoom.module.scss';

export interface AudioRoomLabels {
  /** Accessible name of the room region. */
  room?: string;
}

export interface AudioRoomProps {
  participants: readonly VideoStageParticipant[];
  labels?: AudioRoomLabels;
  className?: string;
}

/**
 * The old-style call room used when video is not available: everyone as an
 * avatar with their name, mute state, host label, talking ring, raised hand
 * and reaction, wrapped and centred. No video tiles, no layouts and no self
 * view, like the compass-proto `CallPopout` (the external call participants
 * prototype). Presentational.
 */
export default function AudioRoom({
  participants,
  labels,
  className,
}: AudioRoomProps) {
  // Past six people the 96px avatars would wrap to a third row.
  const size = participants.length > 6 ? 'small' : 'medium';
  return (
    <div
      className={[styles['audio-room'], className].filter(Boolean).join(' ')}
      role="group"
      aria-label={labels?.room ?? 'Participants in the call'}
    >
      <div className={styles['audio-room__grid']}>
        {participants.map((p) => (
          <CallParticipantAvatar
            key={p.id}
            src={p.avatarSrc}
            alt={p.name}
            name={p.self ? `${p.name} (You)` : p.name}
            size={size}
            muteState={p.muted ? 'muted' : 'unmuted'}
            host={p.host}
            talking={!!p.talking && !p.muted}
            raisedHand={p.handRaised}
            reaction={p.reaction}
            hostControls={false}
          />
        ))}
      </div>
    </div>
  );
}
