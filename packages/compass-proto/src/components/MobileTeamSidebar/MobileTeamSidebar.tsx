import PlusIcon from '@mattermost/compass-icons/components/plus';
import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';
import { Icon } from '@mattermost/compass-ui';
import { IconButton, ICON_BUTTON_ICON_SIZES, } from '@mattermost/compass-ui';
import { TeamAvatar } from '@mattermost/compass-ui';
import { UnreadBadge } from '@mattermost/compass-ui';
import styles from './MobileTeamSidebar.module.scss';

export interface MobileTeamSidebarItem {
  id: string;
  name: string;
  src?: string;
  initials?: string;
  unread?: boolean;
  mentions?: number;
}

export interface MobileTeamSidebarProps {
  className?: string;
  teams: MobileTeamSidebarItem[];
  activeTeamId?: string;
  showAddTeam?: boolean;
  /** Servers / multi-server control at the top of the strip. Default: true. */
  showServersButton?: boolean;
  serversActive?: boolean;
  onSelectTeam?: (id: string) => void;
  onAddTeam?: () => void;
  onServersClick?: () => void;
}

/**
 * Mobile team strip — sibling of desktop Team Sidebar (72px-wide).
 * Servers sits above the rounded teams container (Figma).
 */
export default function MobileTeamSidebar({
  className = '',
  teams,
  activeTeamId,
  showAddTeam = true,
  showServersButton = true,
  serversActive = false,
  onSelectTeam,
  onAddTeam,
  onServersClick,
}: MobileTeamSidebarProps) {
  const rootClass = [styles['mobile-team-sidebar'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      {showServersButton && (
        <div className={styles['mobile-team-sidebar__servers']}>
          <IconButton
            aria-label='Servers'
            size='Medium'
            style='Inverted'
            active={serversActive}
            icon={
              <Icon
                size={ICON_BUTTON_ICON_SIZES.Medium}
                glyph={<ServerVariantIcon />}
              />
            }
            onClick={onServersClick}
            className={styles['mobile-team-sidebar__servers-button']}
          />
        </div>
      )}
      <div className={styles['mobile-team-sidebar__teams-container']}>
        <div className={styles['mobile-team-sidebar__teams']}>
          {teams.map((team) => {
            const active = team.id === activeTeamId;
            const hasMentions = team.mentions != null && team.mentions > 0;
            const showUnreadDot = team.unread && !active && !hasMentions;
            return (
              <button
                key={team.id}
                type='button'
                className={styles['mobile-team-sidebar__team']}
                aria-label={team.name}
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelectTeam?.(team.id)}
              >
                <TeamAvatar
                  src={team.src}
                  alt={team.name}
                  initials={team.initials}
                  size='40'
                  state={active ? 'Active' : 'Default'}
                  badge={hasMentions ? team.mentions : undefined}
                />
                {showUnreadDot && (
                  <UnreadBadge
                    className={styles['mobile-team-sidebar__unread']}
                    aria-label={`${team.name} has unread messages`}
                  />
                )}
              </button>
            );
          })}
          {showAddTeam && (
            <IconButton
              aria-label='Add team'
              size='Medium'
              style='Inverted'
              icon={<Icon size='20' glyph={<PlusIcon />} />}
              onClick={onAddTeam}
              className={styles['mobile-team-sidebar__add']}
            />
          )}
        </div>
      </div>
    </div>
  );
}
