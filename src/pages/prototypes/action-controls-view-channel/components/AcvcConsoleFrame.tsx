import type { ReactNode } from 'react';
import {
  AdminConsoleSidebar,
} from '@mattermost/compass-ui/components/admin-console-sidebar';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { consoleNavWithActive } from '../adminData';
import styles from './AcvcConsoleFrame.module.scss';

export interface AcvcConsoleFrameProps {
  /** Sidebar item to mark current. */
  activeItem?: string;
  children: ReactNode;
}

/** System Console chrome for the policy-authoring surfaces. */
export default function AcvcConsoleFrame({
  activeItem = 'Permission Policies',
  children,
}: AcvcConsoleFrameProps) {
  return (
    <div className={styles['acvc-console-frame']}>
      <div className={styles['acvc-console-frame__sidebar']}>
        <AdminConsoleSidebar
          groups={consoleNavWithActive(activeItem)}
          consoleTitle="System Console"
          userDisplayName="Leonard Riley"
          userHandle="@leonard.riley"
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
        />
      </div>
      <div className={styles['acvc-console-frame__main']}>{children}</div>
    </div>
  );
}
