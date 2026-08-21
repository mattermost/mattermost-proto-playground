import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Button } from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import { Scrollbar } from '@mattermost/compass-ui';
import type { Participant } from '@/types/callParticipant';
import { ParticipantListItem } from './ParticipantListItem';
import styles from './ParticipantsPanel.module.scss';

export interface ParticipantsPanelProps {
  participants: Participant[];
  currentUserId?: string;
  onClose?: () => void;
  /** 'widget' renders a compact variant for the docked call widget popover. */
  variant?: 'default' | 'widget';
}

export default function ParticipantsPanel({
  participants,
  currentUserId,
  onClose,
  variant = 'default',
}: ParticipantsPanelProps) {
  const internal = participants.filter((p) => !p.external);
  const external = participants.filter((p) => p.external);
  const isWidget = variant === 'widget';

  const rootClass = [
    styles['participants-panel'],
    isWidget ? styles['participants-panel--widget'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={rootClass} aria-label="Participants">
      <div className={styles['participants-panel__header']}>
        <h2 className={styles['participants-panel__title']}>Participants</h2>
        <div className={styles['participants-panel__header-actions']}>
          <Button
            emphasis="Quaternary"
            size="X-Small"
            leadingIcon={<Icon size="12" glyph={<MicrophoneOffIcon />} />}
          >
            Mute all
          </Button>
          {!isWidget && onClose && (
            <IconButton
              size="Small"
              aria-label="Close participants"
              icon={<Icon size="16" glyph={<CloseIcon />} />}
              onClick={onClose}
            />
          )}
        </div>
      </div>

      <div className={styles['participants-panel__scroll']}>
        <Scrollbar>
          <ul className={styles['participants-panel__list']}>
            {internal.map((p) => (
              <ParticipantListItem
                key={p.id}
                participant={p}
                isYou={p.id === currentUserId}
              />
            ))}
          </ul>

          {external.length > 0 && (
            <>
              <div
                className={styles['participants-panel__divider']}
                role="separator"
              />
              <div className={styles['participants-panel__group-title']}>
                External Participants
              </div>
              <ul className={styles['participants-panel__list']}>
                {external.map((p) => (
                  <ParticipantListItem
                    key={p.id}
                    participant={p}
                    isYou={p.id === currentUserId}
                  />
                ))}
              </ul>
            </>
          )}
        </Scrollbar>
      </div>
    </aside>
  );
}
