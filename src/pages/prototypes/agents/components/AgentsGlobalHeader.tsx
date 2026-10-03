import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import AtIcon from '@mattermost/compass-icons/components/at';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import HelpCircleOutlineIcon from '@mattermost/compass-icons/components/help-circle-outline';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import ProductsIcon from '@mattermost/compass-icons/components/products';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { VIEWER } from '../agentsData';
import styles from './AgentsGlobalHeader.module.scss';

function NavIconButton({ ariaLabel, glyph }: { ariaLabel: string; glyph: React.ReactNode }) {
  return (
    <IconButton
      aria-label={ariaLabel}
      size="small"
      padding="compact"
      style="inverted"
      icon={<Icon size="16" glyph={glyph} />}
    />
  );
}

type AgentsGlobalHeaderProps = {
  className?: string;
  teamName?: string;
  teamLogoSrc?: string;
};

export default function AgentsGlobalHeader({ className, teamName, teamLogoSrc }: AgentsGlobalHeaderProps) {
  const displayName = teamName ?? 'Acme Co';
  return (
    <header className={[styles['agents-header'], className].filter(Boolean).join(' ')}>
      <div className={styles['agents-header__left']}>
        <div className={styles['agents-header__left-inner']}>
          <NavIconButton ariaLabel="Product switcher" glyph={<ProductsIcon />} />
          <div className={styles['agents-header__team']}>
            <div className={styles['agents-header__team-avatar']}>
              {teamLogoSrc ? (
                <img
                  src={teamLogoSrc}
                  className={styles['agents-header__team-logo']}
                  alt={displayName}
                />
              ) : (
                <span className={styles['agents-header__team-initials']}>Ac</span>
              )}
              <span className={styles['agents-header__team-badge']} aria-hidden />
            </div>
            <button
              type="button"
              className={styles['agents-header__team-dropdown']}
              aria-label="Switch team"
            >
              <span className={styles['agents-header__team-name']}>{displayName}</span>
              <Icon glyph={<ChevronDownIcon />} size="12" />
            </button>
          </div>
        </div>
      </div>

      <div className={styles['agents-header__center']}>
        <div className={styles['agents-header__navigator']}>
          <NavIconButton ariaLabel="Back" glyph={<ArrowLeftIcon />} />
          <NavIconButton ariaLabel="Forward" glyph={<ArrowRightIcon />} />
        </div>
        <div className={styles['agents-header__search']}>
          <span className={styles['agents-header__search-icon']} aria-hidden>
            <Icon size="12" glyph={<MagnifyIcon />} />
          </span>
          <input
            type="search"
            className={styles['agents-header__search-input']}
            placeholder="Search"
            aria-label="Search"
          />
        </div>
        <NavIconButton ariaLabel="Help" glyph={<HelpCircleOutlineIcon />} />
      </div>

      <div className={styles['agents-header__right']}>
        <NavIconButton ariaLabel="Recent mentions" glyph={<AtIcon />} />
        <NavIconButton ariaLabel="Saved messages" glyph={<BookmarkOutlineIcon />} />
        <NavIconButton ariaLabel="Settings" glyph={<CogOutlineIcon />} />
        <button
          type="button"
          className={styles['agents-header__account']}
          aria-label="Account menu"
        >
          <UserAvatar
            src={VIEWER.avatarSrc}
            alt={VIEWER.avatarAlt}
            size="24"
            status
          />
        </button>
      </div>
    </header>
  );
}
