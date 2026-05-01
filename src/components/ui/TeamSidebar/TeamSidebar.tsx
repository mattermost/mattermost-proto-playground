import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import TeamAvatar from '@/components/ui/TeamAvatar/TeamAvatar';
import UnreadBadge from '@/components/ui/UnreadBadge/UnreadBadge';
import styles from './TeamSidebar.module.scss';

export interface TeamSidebarItem {
  id: string;
  name: string;
  src?: string;
  initials?: string;
  unread?: boolean;
  mentions?: number;
}

export interface TeamSidebarProps {
  className?: string;
  teams: TeamSidebarItem[];
  activeTeamId?: string;
  showAddTeam?: boolean;
  onSelectTeam?: (id: string) => void;
  onAddTeam?: () => void;
}

export default function TeamSidebar({
  className = '',
  teams,
  activeTeamId,
  showAddTeam = true,
  onSelectTeam,
  onAddTeam,
}: TeamSidebarProps) {
  const rootClass = [styles['team-sidebar'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['team-sidebar__teams']}>
        {teams.map((team) => {
          const active = team.id === activeTeamId;
          const hasMentions = team.mentions != null && team.mentions > 0;
          const showUnreadDot = team.unread && !active && !hasMentions;
          return (
            <button
              key={team.id}
              type="button"
              className={styles['team-sidebar__team']}
              aria-label={team.name}
              aria-current={active ? 'true' : undefined}
              onClick={() => onSelectTeam?.(team.id)}
            >
              <TeamAvatar
                src={team.src}
                alt={team.name}
                initials={team.initials}
                state={active ? 'Active' : 'Default'}
                badge={hasMentions ? team.mentions : undefined}
              />
              {showUnreadDot && (
                <UnreadBadge
                  className={styles['team-sidebar__unread']}
                  aria-label={`${team.name} has unread messages`}
                />
              )}
            </button>
          );
        })}
        {showAddTeam && (
          <IconButton
            aria-label="Add team"
            size="Medium"
            style="Inverted"
            icon={<Icon size="20" glyph={<PlusIcon />} />}
            onClick={onAddTeam}
            className={styles['team-sidebar__add']}
          />
        )}
      </div>
    </div>
  );
}
