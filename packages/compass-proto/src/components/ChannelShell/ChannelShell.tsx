import type { ReactNode } from 'react';
import { ChannelsSidebar } from '@mattermost/compass-ui';
import { GlobalHeader } from '@mattermost/compass-ui';
import type { GlobalHeaderProduct } from '@mattermost/compass-ui';
import { TeamSidebar, type TeamSidebarItem, } from '@mattermost/compass-ui';
import type { ChannelsSidebarModel } from '@mattermost/compass-ui';
import styles from './ChannelShell.module.scss';

const DEFAULT_TEAMS: TeamSidebarItem[] = [
  { id: 'contributors', name: 'Contributors', initials: 'Co' },
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
  className?: string;
}

export default function ChannelShell({
  innerContent,
  channelHeader,
  children,
  trailing,
  product = 'Channels',
  userAvatarSrc,
  userAvatarAlt = 'User',
  teams = DEFAULT_TEAMS,
  activeTeamId = 'contributors',
  teamName = 'Contributors',
  showFilter = true,
  channelsSidebarModel,
  channelsSidebar,
  floating,
  overlay,
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
        model={{ topGroupItems: [], groups: [] }}
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
            <div className={styles['channel-shell__inner-panel']}>{innerContent}</div>
          ) : (
            <div className={styles['channel-shell__inner-panel']}>
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
