import type { ReactNode } from 'react';
import ChannelsSidebar from '@/components/ui/ChannelsSidebar/ChannelsSidebar';
import GlobalHeader from '@/components/ui/GlobalHeader/GlobalHeader';
import type { GlobalHeaderProduct } from '@/components/ui/GlobalHeader/GlobalHeader';
import TeamSidebar, {
  type TeamSidebarItem,
} from '@/components/ui/TeamSidebar/TeamSidebar';
import type { ChannelsSidebarModel } from '@/components/ui/ChannelsSidebar/channelsSidebarModel';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import styles from './ChannelShell.module.scss';

const DEFAULT_TEAMS: TeamSidebarItem[] = [
  {
    id: 'contributors',
    name: 'Contributors',
    src: avatarStaffTeam,
  },
  { id: 'design', name: 'Design', initials: 'De', unread: true },
  { id: 'acme', name: 'Acme', initials: 'Ac', mentions: 3 },
];

export interface ChannelShellProps {
  /**
   * When set, replaces the default main region (center column + optional `trailing`)
   * inside the inner panel — use for split views such as Threads inbox + thread.
   */
  innerContent?: ReactNode;
  /** Channel header row (e.g. `ChannelHeader`). Ignored when `innerContent` is set. */
  channelHeader?: ReactNode;
  /** Main column: messages region, composer, etc. Ignored when `innerContent` is set. */
  children?: ReactNode;
  /** Optional right column (e.g. thread or channel info). Ignored when `innerContent` is set. */
  trailing?: ReactNode;
  product?: GlobalHeaderProduct;
  userAvatarSrc?: string;
  userAvatarAlt?: string;
  teams?: TeamSidebarItem[];
  activeTeamId?: string;
  teamName?: string;
  showFilter?: boolean;
  /** When set, passed to `ChannelsSidebar` as `model`. */
  channelsSidebarModel?: ChannelsSidebarModel;
  /**
   * Full channels column. When set, `channelsSidebarModel` and default avatar props are ignored.
   */
  channelsSidebar?: ReactNode;
  /** In-channel floating UI (e.g. call widget). */
  floating?: ReactNode;
  /** Layered surface over the shell (e.g. call popout). */
  overlay?: ReactNode;
  /** Scrim + modal confined to the inner panel (center + trailing), not sidebars. */
  innerPanelOverlay?: ReactNode;
  className?: string;
}

export default function ChannelShell({
  innerContent,
  channelHeader,
  children,
  trailing,
  product = 'Channels',
  userAvatarSrc = avatarLeonard,
  userAvatarAlt = 'Leonard Riley',
  teams = DEFAULT_TEAMS,
  activeTeamId = 'contributors',
  teamName = 'Contributors',
  showFilter = true,
  channelsSidebarModel,
  channelsSidebar,
  floating,
  overlay,
  innerPanelOverlay,
  className = '',
}: ChannelShellProps) {
  const rootClass = [styles['channel-shell'], className].filter(Boolean).join(' ');
  const useInnerOnly = innerContent != null;

  const sidebarContent =
    channelsSidebar ??
    (channelsSidebarModel != null ? (
      <ChannelsSidebar
        teamName={teamName}
        showFilter={showFilter}
        model={channelsSidebarModel}
      />
    ) : (
      <ChannelsSidebar
        teamName={teamName}
        showFilter={showFilter}
        avatarAikoTan={avatarAikoTan}
        avatarArjunPatel={avatarArjunPatel}
        avatarDanielOkoro={avatarDanielle}
        avatarDariusCole={avatarDariusCole}
        avatarDavidLiang={avatarDavidLiang}
        avatarEmmaNovak={avatarEmmaNovak}
        avatarEthanBrooks={avatarEthanBrooks}
      />
    ));

  return (
    <div className={rootClass}>
      <div className={styles['channel-shell__global-header']}>
        <GlobalHeader
          product={product}
          userAvatarSrc={userAvatarSrc}
          userAvatarAlt={userAvatarAlt}
        />
      </div>

      <div className={styles['channel-shell__body']}>
        <div className={styles['channel-shell__team-sidebar']}>
          <TeamSidebar activeTeamId={activeTeamId} teams={teams} />
        </div>

        <div className={styles['channel-shell__outer-panel']}>
          <div className={styles['channel-shell__channels-sidebar']}>
            {sidebarContent}
          </div>

          {useInnerOnly ? (
            <div className={styles['channel-shell__inner-panel']}>
              {innerPanelOverlay != null && (
                <div className={styles['channel-shell__inner-overlay']}>
                  {innerPanelOverlay}
                </div>
              )}
              {innerContent}
            </div>
          ) : (
            <div className={styles['channel-shell__inner-panel']}>
              {innerPanelOverlay != null && (
                <div className={styles['channel-shell__inner-overlay']}>
                  {innerPanelOverlay}
                </div>
              )}
              <div className={styles['channel-shell__center']}>
                {channelHeader}
                {children}
              </div>
              {trailing}
            </div>
          )}
        </div>
      </div>

      {overlay}
      {floating != null && (
        <div className={styles['channel-shell__floating']}>{floating}</div>
      )}
    </div>
  );
}
