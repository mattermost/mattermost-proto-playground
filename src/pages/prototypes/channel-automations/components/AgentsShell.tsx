import type { ReactNode } from 'react';
import GlobalHeader from '@/components/ui/GlobalHeader/GlobalHeader';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from './AgentsShell.module.scss';

export interface AgentsShellProps {
  /** Main content area below the global header (e.g. the Edit Agent view). */
  children: ReactNode;
  /** Optional right column (e.g. AgentsPanel). */
  sidebar?: ReactNode;
  /** Layered surface over the shell (e.g. a modal). */
  overlay?: ReactNode;
}

/**
 * Standalone Agents app frame (Figma `4304-32132`): the Agents global header
 * over a full-bleed main content area — the same windowed panel as the channel
 * scenes, without the team/channel sidebars.
 */
export default function AgentsShell({ children, sidebar, overlay }: AgentsShellProps) {
  return (
    <div className={styles['agents-shell']}>
      <div className={styles['agents-shell__global-header']}>
        <GlobalHeader
          product="Agents"
          userAvatarSrc={avatarLeonard}
          userAvatarAlt="Leonard Riley"
        />
      </div>

      <div className={styles['agents-shell__body']}>
        <div className={styles['agents-shell__inner']}>
          <div className={styles['agents-shell__content']}>{children}</div>
          {sidebar}
        </div>
      </div>

      {overlay}
    </div>
  );
}
