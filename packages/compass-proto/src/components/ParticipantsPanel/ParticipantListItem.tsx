import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import { UserAvatar } from '@mattermost/compass-ui';
import { Tag } from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import type { Participant } from '@/types/callParticipant';
import styles from './ParticipantsPanel.module.scss';

export interface ParticipantListItemProps {
  participant: Participant;
  isYou?: boolean;
}

export function ParticipantListItem({
  participant,
  isYou = false,
}: ParticipantListItemProps) {
  const {
    name,
    avatarSrc,
    host = false,
    external = false,
    muted = false,
    kind = 'user',
  } = participant;

  const isUserKind = kind === 'user';

  const fallbackClass = [
    styles['participants-panel__avatar-fallback'],
    kind === 'dial-in'
      ? styles['participants-panel__avatar-fallback--dial-in']
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const micClass = [
    styles['participants-panel__mic'],
    muted
      ? styles['participants-panel__mic--off']
      : styles['participants-panel__mic--on'],
  ].join(' ');

  return (
    <li className={styles['participants-panel__item']}>
      <div className={styles['participants-panel__item-avatar']}>
        {isUserKind && avatarSrc ? (
          <UserAvatar size="24" src={avatarSrc} alt={name} />
        ) : (
          <span className={fallbackClass} role="img" aria-label={name}>
            <Icon
              size="16"
              glyph={
                kind === 'dial-in' ? <PhoneIcon /> : <AccountOutlineIcon />
              }
            />
          </span>
        )}
      </div>

      <div className={styles['participants-panel__item-identity']}>
        <span className={styles['participants-panel__name']}>{name}</span>
        {isYou && (
          <span className={styles['participants-panel__you']}>(you)</span>
        )}
        {host && <Tag label="HOST" size="X-Small" casing="All Caps" />}
        {external && (
          <Tag label="EXTERNAL" size="X-Small" casing="All Caps" />
        )}
      </div>

      <div className={styles['participants-panel__item-actions']}>
        <span className={styles['participants-panel__more']}>
          <IconButton
            size="Small"
            padding="Compact"
            aria-label={`More actions for ${name}`}
            icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
          />
        </span>
        <span
          className={micClass}
          role="img"
          aria-label={muted ? 'Muted' : 'Unmuted'}
        >
          <Icon
            size="16"
            glyph={muted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
          />
        </span>
      </div>
    </li>
  );
}
