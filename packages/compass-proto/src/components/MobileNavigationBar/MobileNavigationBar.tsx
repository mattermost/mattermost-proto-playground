import type {ReactNode} from 'react';
import ArrowBackIosIcon from '@mattermost/compass-icons/components/arrow-back-ios';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import { MentionBadge } from '@mattermost/compass-ui';
import styles from './MobileNavigationBar.module.scss';

export type MobileNavigationBarVariant = 'Channel' | 'DM' | 'GM' | 'Bot';

export interface MobileNavigationBarProps {
  /** Conversation type. Default: Channel. */
  variant?: MobileNavigationBarVariant;
  /** Channel, DM, GM, or bot display name. */
  name: string;
  /** Channel / GM member count — drives “N members” subtitle when no custom status. */
  memberCount?: number;
  /** When set, shows a mention badge next to the back button. */
  mentionCount?: number;
  /** DM only — when both set, replaces “View info” with emoji + text (no chevron). */
  customStatusEmoji?: string;
  customStatusText?: string;
  onBackClick?: () => void;
  onTitleClick?: () => void;
  onSearchClick?: () => void;
  onMoreClick?: () => void;
  className?: string;
}

function formatMembersLabel(count: number): string {
  return `${count} member${count === 1 ? '' : 's'}`;
}

/**
 * Mobile iOS navigation bar for conversation screens (Channel, DM, GM, Bot).
 * Owns the status-bar spacer and sidebar-colored chrome under system status UI.
 *
 * @see Figma Patterns — Mobile — Top Nav Bar — Channel
 */
export default function MobileNavigationBar({
  variant = 'Channel',
  name,
  memberCount,
  mentionCount,
  customStatusEmoji,
  customStatusText,
  onBackClick,
  onTitleClick,
  onSearchClick,
  onMoreClick,
  className = '',
}: MobileNavigationBarProps) {
  const showCustomStatus =
    variant === 'DM' && Boolean(customStatusEmoji) && Boolean(customStatusText);

  let subtitle: ReactNode = null;
  let showChevron = false;

  if (showCustomStatus) {
    subtitle = (
      <>
        <span className={styles['mobile-navigation-bar__status-emoji']} aria-hidden>
          {customStatusEmoji}
        </span>
        <span className={styles['mobile-navigation-bar__subtitle-text']}>
          {customStatusText}
        </span>
      </>
    );
  } else if (
    (variant === 'Channel' || variant === 'GM') &&
    memberCount != null
  ) {
    subtitle = (
      <span className={styles['mobile-navigation-bar__subtitle-text']}>
        {formatMembersLabel(memberCount)}
      </span>
    );
    showChevron = true;
  } else {
    subtitle = (
      <span className={styles['mobile-navigation-bar__subtitle-text']}>
        View info
      </span>
    );
    showChevron = true;
  }

  const rootClass = [
    styles['mobile-navigation-bar'],
    showCustomStatus ? styles['mobile-navigation-bar--custom-status'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const titleBlock = (
    <>
      <span className={styles['mobile-navigation-bar__title']}>{name}</span>
      <span className={styles['mobile-navigation-bar__subtitle']}>
        {subtitle}
        {showChevron && (
          <Icon
            size='12'
            className={styles['mobile-navigation-bar__chevron']}
            glyph={<ChevronRightIcon />}
          />
        )}
      </span>
    </>
  );

  return (
    <header className={rootClass}>
      <div className={styles['mobile-navigation-bar__bar']}>
        <div className={styles['mobile-navigation-bar__left']}>
          <IconButton
            aria-label='Back'
            size='Medium'
            style='Inverted'
            onClick={onBackClick}
            icon={<Icon size='20' glyph={<ArrowBackIosIcon />} />}
          />
          {mentionCount != null && mentionCount > 0 && (
            <MentionBadge count={mentionCount} location='Sidebar' size='Large' />
          )}
        </div>

        {onTitleClick ? (
          <button
            type='button'
            className={styles['mobile-navigation-bar__titles']}
            onClick={onTitleClick}
          >
            {titleBlock}
          </button>
        ) : (
          <div className={styles['mobile-navigation-bar__titles']}>{titleBlock}</div>
        )}

        <div className={styles['mobile-navigation-bar__right']}>
          <IconButton
            aria-label='Search'
            size='Medium'
            style='Inverted'
            onClick={onSearchClick}
            icon={<Icon size='20' glyph={<MagnifyIcon />} />}
          />
          <IconButton
            aria-label='More options'
            size='Medium'
            style='Inverted'
            onClick={onMoreClick}
            icon={<Icon size='20' glyph={<DotsHorizontalIcon />} />}
          />
        </div>
      </div>
    </header>
  );
}
