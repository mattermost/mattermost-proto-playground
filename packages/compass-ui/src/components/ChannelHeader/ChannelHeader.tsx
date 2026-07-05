import type { ReactNode } from 'react';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import StarIcon from '@mattermost/compass-icons/components/star';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import BellOffOutlineIcon from '@mattermost/compass-icons/components/bell-off-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import Tag from '@/components/Tag/Tag';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import styles from './ChannelHeader.module.scss';

export type ChannelHeaderType =
  | 'Channel'
  | 'Bot'
  | 'DM'
  | 'GM'
  | 'Threads'
  | 'Drafts';

export interface ChannelHeaderProps {
  /** Channel type variant. Default: Channel. */
  type?: ChannelHeaderType;
  /** Channel or conversation name. */
  name?: string;
  /** Subtitle shown to the right of the stat icons (Bot) or next to the title (Threads, Drafts). */
  description?: string;
  /** Member count shown for Channel and GM types. */
  memberCount?: number;
  /** Number of pinned messages shown as a stat. */
  pinnedCount?: number;
  /** Whether the channel is favorited (filled star). */
  favorited?: boolean;
  /** Whether the channel is muted (bell-off icon shown). */
  muted?: boolean;
  /** Avatar image URL for DM and Bot types. */
  avatarSrc?: string;
  /** Show online status badge on the DM avatar. */
  avatarStatus?: boolean;
  /** Called when the favorite star is clicked. */
  onFavoriteClick?: () => void;
  /** Called when the channel name is clicked. */
  onNameClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Called when the Start a Call button is clicked. */
  onCallClick?: () => void;
  /** Replaces the default Start a Call button when provided. */
  callButton?: ReactNode;
  /** Called when the channel info button is clicked. */
  onInfoClick?: () => void;
  /** Whether the info button is in a toggled (active) state. */
  infoToggled?: boolean;
  className?: string;
}

export default function ChannelHeader({
  type = 'Channel',
  name = '',
  description,
  memberCount,
  pinnedCount,
  favorited = false,
  muted = false,
  avatarSrc,
  avatarStatus = false,
  onFavoriteClick,
  onNameClick,
  onCallClick,
  callButton,
  onInfoClick,
  infoToggled = false,
  className = '',
}: ChannelHeaderProps) {
  const isSimple = type === 'Threads' || type === 'Drafts';
  const showCallButton = type === 'Channel' || type === 'DM' || type === 'GM';
  const showMembers =
    (type === 'Channel' || type === 'GM') && memberCount != null;
  const showFiles = type === 'Channel' || type === 'DM' || type === 'GM';
  const showChevron = type === 'Channel' || type === 'DM' || type === 'GM';
  const hasDmAvatar = (type === 'DM' || type === 'Bot') && Boolean(avatarSrc);

  const rootClass = [
    styles['channel-header'],
    isSimple ? styles['channel-header--simple'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isSimple) {
    return (
      <div className={rootClass}>
        <span className={styles['channel-header__title']}>{name}</span>
        {description && (
          <span className={styles['channel-header__description']}>
            {description}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <div className={styles['channel-header__left']}>
        <div className={styles['channel-header__top-row']}>
          <IconButton
            size="X-Small"
            aria-label={
              favorited ? 'Remove from favorites' : 'Add to favorites'
            }
            onClick={onFavoriteClick}
            icon={
              favorited ? (
                <span
                  style={{ color: 'var(--button-bg)', display: 'inline-flex' }}
                >
                  <StarIcon size={18} />
                </span>
              ) : (
                <StarOutlineIcon size={18} />
              )
            }
          />

          {hasDmAvatar && (
            <div className={styles['channel-header__identity']}>
              <UserAvatar
                src={avatarSrc!}
                alt={name}
                size="24"
                status={type === 'DM' ? avatarStatus : false}
              />
              {type === 'Bot' ? (
                <div className={styles['channel-header__bot-name-group']}>
                  <button
                    className={styles['channel-header__name-area']}
                    type="button"
                    onClick={onNameClick}
                  >
                    <span className={styles['channel-header__name']}>
                      {name}
                    </span>
                  </button>
                  <span className={styles['channel-header__bot-tag']}>
                    <Tag label="BOT" casing="All Caps" />
                  </span>
                </div>
              ) : (
                <button
                  className={styles['channel-header__name-area']}
                  type="button"
                  onClick={onNameClick}
                >
                  <span className={styles['channel-header__name']}>{name}</span>
                  <Icon size="16" glyph={<ChevronDownIcon />} />
                </button>
              )}
            </div>
          )}

          {!hasDmAvatar && (
            <button
              className={styles['channel-header__name-area']}
              type="button"
              onClick={onNameClick}
            >
              <span className={styles['channel-header__name']}>{name}</span>
              {showChevron && <Icon size="16" glyph={<ChevronDownIcon />} />}
            </button>
          )}

          <div className={styles['channel-header__stat-icons']}>
            {muted && (
              <IconButton
                size="X-Small"
                aria-label="Notifications muted"
                icon={<Icon size="12" glyph={<BellOffOutlineIcon />} />}
              />
            )}
            {showMembers && (
              <IconButton
                size="X-Small"
                aria-label={`${memberCount} members`}
                count={memberCount}
                icon={<Icon size="12" glyph={<AccountOutlineIcon />} />}
              />
            )}
            {pinnedCount != null && (
              <IconButton
                size="X-Small"
                aria-label={`${pinnedCount} pinned messages`}
                count={pinnedCount}
                icon={<Icon size="12" glyph={<PinOutlineIcon />} />}
              />
            )}
            {showFiles && (
              <IconButton
                size="X-Small"
                aria-label="Files"
                icon={<Icon size="12" glyph={<FileTextOutlineIcon />} />}
              />
            )}
          </div>
        </div>

        <div className={styles['channel-header__description']}>
          {description ?? null}
        </div>
      </div>

      <div className={styles['channel-header__right']}>
        {showCallButton && (callButton ?? (
          <Button
            className={styles['channel-header__call-btn']}
            emphasis="Quaternary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<PhoneIcon />} />}
            onClick={onCallClick}
          >
            Start a Call
          </Button>
        ))}
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
