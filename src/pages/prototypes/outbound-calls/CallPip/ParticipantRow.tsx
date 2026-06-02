import PhoneIcon from '@mattermost/compass-icons/components/phone';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import type { BridgedStatus } from '@/types/outboundCall';
import styles from '../OutboundCalls.module.scss';

export function CallPipParticipantRow({
  avatarSrc,
  avatarAlt,
  name,
  number,
  status,
  onRemove,
  removeDisabled,
}: {
  avatarSrc?: string;
  avatarAlt?: string;
  name: string;
  number?: string;
  status: BridgedStatus;
  onRemove?: () => void;
  removeDisabled?: boolean;
}) {
  const numberLabel = number && number !== name ? number : null;
  const secondaryParts: string[] = [];
  if (numberLabel) secondaryParts.push(numberLabel);
  if (status === 'dialing') secondaryParts.push('Ringing…');
  const secondaryLabel = secondaryParts.join(' · ') || undefined;

  const leadingVisual = avatarSrc ? (
    <UserAvatar src={avatarSrc} alt={avatarAlt ?? name} size="24" />
  ) : (
    <div className={styles['pip__participant-avatar-fallback']} aria-hidden>
      <Icon glyph={<PhoneIcon />} size="12" />
    </div>
  );

  const trailingVisual = onRemove ? (
    <IconButton
      aria-label="Remove participant"
      size="Small"
      padding="Compact"
      className={styles['pip__participant-remove']}
      disabled={removeDisabled}
      icon={<Icon glyph={<PhoneHangupIcon />} size="16" />}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    />
  ) : undefined;

  return (
    <li
      className={`${styles['pip__participant']}${
        status === 'ended' ? ` ${styles['pip__participant--ending']}` : ''
      }`}
    >
      <MenuItem
        label={name}
        secondaryLabel={secondaryLabel}
        leadingVisual={leadingVisual}
        trailingVisual={trailingVisual}
        trailingElement={Boolean(trailingVisual)}
        tabIndex={-1}
      />
    </li>
  );
}
