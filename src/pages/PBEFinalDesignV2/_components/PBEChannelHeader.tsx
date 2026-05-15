import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Button from '@/components/ui/Button/Button';
import { encryptionManager } from '../shared/fixtures';
import styles from './PBEChannelHeader.module.scss';

export interface PBEChannelHeaderProps {
  /** Channel display name. */
  channelName?: string;
  /** Shows the Encryption Details pill. */
  showEncryptionDetails?: boolean;
  /** Highlights the Encryption Details pill in its pressed state. */
  encryptionDetailsActive?: boolean;
  /** Click handler for the Encryption Details pill. */
  onEncryptionDetailsClick?: () => void;
  /** Click handler for the channel-info icon button. */
  onInfoClick?: () => void;
  /** Toggled state of the info icon button. */
  infoToggled?: boolean;
}

/**
 * PBE channel header (gap G2). The dest `ChannelHeader` is single-line,
 * but PBE needs shield icon + two-line title/subtitle + member/pinned/file
 * stat pills + encryption-details pill. Composed from dest IconButton,
 * Button, and Icon.
 */
export default function PBEChannelHeader({
  channelName = 'operations-alpha',
  showEncryptionDetails = false,
  encryptionDetailsActive = false,
  onEncryptionDetailsClick,
  onInfoClick,
  infoToggled = false,
}: PBEChannelHeaderProps) {
  return (
    <div className={styles['pbe-channel-header']}>
      <div className={styles['pbe-channel-header__left']}>
        <IconButton
          size="X-Small"
          aria-label="Add to favorites"
          icon={<Icon size="20" glyph={<StarOutlineIcon />} />}
        />
        <button
          type="button"
          className={styles['pbe-channel-header__name-area']}
          aria-label={`${channelName} channel options`}
        >
          <span className={styles['pbe-channel-header__shield']} aria-hidden>
            <ShieldOutlineIcon size={16} />
          </span>
          <span className={styles['pbe-channel-header__title-stack']}>
            <span className={styles['pbe-channel-header__title']}>
              {channelName}
            </span>
            <span className={styles['pbe-channel-header__subtitle']}>
              Program-Protected — Managed by {encryptionManager.name}
            </span>
          </span>
          <Icon size="16" glyph={<ChevronDownIcon />} />
        </button>

        <div className={styles['pbe-channel-header__stat-icons']}>
          <button
            type="button"
            className={styles['pbe-channel-header__stat-btn']}
            aria-label="5 members"
          >
            <Icon size="12" glyph={<AccountOutlineIcon />} />
            <span className={styles['pbe-channel-header__stat-value']}>5</span>
          </button>
          <button
            type="button"
            className={styles['pbe-channel-header__stat-btn']}
            aria-label="Pinned messages"
          >
            <Icon size="12" glyph={<PinOutlineIcon />} />
            <span className={styles['pbe-channel-header__stat-value']}>0</span>
          </button>
          <button
            type="button"
            className={styles['pbe-channel-header__stat-btn']}
            aria-label="Files"
          >
            <Icon size="12" glyph={<FileTextOutlineIcon />} />
          </button>
        </div>

        {showEncryptionDetails && (
          <button
            type="button"
            className={[
              styles['pbe-channel-header__encryption-btn'],
              encryptionDetailsActive
                ? styles['pbe-channel-header__encryption-btn--active']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={onEncryptionDetailsClick}
            aria-pressed={encryptionDetailsActive}
          >
            <LockOutlineIcon size={14} aria-hidden />
            <span className={styles['pbe-channel-header__encryption-label']}>
              Encryption Details
            </span>
          </button>
        )}
      </div>

      <div className={styles['pbe-channel-header__right']}>
        <Button
          emphasis="Quaternary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PhoneIcon />} />}
        >
          Start a Call
        </Button>
        <IconButton
          size="Small"
          aria-label="Channel info"
          icon={<Icon size="16" glyph={<InformationOutlineIcon />} />}
          onClick={onInfoClick}
          toggled={infoToggled}
        />
      </div>
    </div>
  );
}
