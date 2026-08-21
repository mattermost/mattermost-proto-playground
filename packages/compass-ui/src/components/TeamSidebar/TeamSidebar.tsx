import PlusIcon from '@mattermost/compass-icons/components/plus';
import DialpadIcon from '@mattermost/compass-icons/components/dialpad';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import TeamAvatar from '@/components/TeamAvatar/TeamAvatar';
import UnreadBadge from '@/components/UnreadBadge/UnreadBadge';
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
  showDialPad?: boolean;
  dialPadActive?: boolean;
  onSelectTeam?: (id: string) => void;
  onAddTeam?: () => void;
  onDialPadClick?: () => void;
}

export default function TeamSidebar({
  className = '',
  teams,
  activeTeamId,
  showAddTeam = true,
  showDialPad = false,
  dialPadActive = false,
  onSelectTeam,
  onAddTeam,
  onDialPadClick,
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
      {showDialPad && (
        <div className={styles['team-sidebar__footer']}>
          <IconButton
            aria-label="Dial pad"
            size="Small"
            style="Inverted"
            active={dialPadActive}
            icon={<Icon size="16" glyph={<DialpadIcon />} />}
            onClick={onDialPadClick}
            className={styles['team-sidebar__dial-pad']}
          />
        </div>
      )}
    </div>
  );
}
