// [AI DRAFT] System Console chrome for the authoring and Simulate scenes.
// Same composition as the Access Channel port's console frame, with this
// prototype's admin so no cast member is shared across prototypes.
import type { ReactNode } from 'react';
import { AdminConsoleSidebar } from '@mattermost/compass-ui/components/admin-console-sidebar';
import { consoleNavWithActive } from '../../action-controls-view-channel/adminData';
import { ADMIN } from '../dmgmData';
import styles from './DmgmConsoleFrame.module.scss';

export interface DmgmConsoleFrameProps {
  activeItem?: string;
  children: ReactNode;
  /** Modal layer rendered over the console, inside the frame. */
  overlay?: ReactNode;
}

export default function DmgmConsoleFrame({
  activeItem = 'Permission Policies',
  children,
  overlay,
}: DmgmConsoleFrameProps) {
  return (
    <div className={styles['dmgm-console-frame']}>
      <div className={styles['dmgm-console-frame__sidebar']}>
        <AdminConsoleSidebar
          groups={consoleNavWithActive(activeItem)}
          consoleTitle="System Console"
          userDisplayName={ADMIN.name}
          userHandle={`@${ADMIN.username}`}
          avatarSrc={ADMIN.avatarSrc}
          avatarAlt={ADMIN.name}
        />
      </div>
      <div className={styles['dmgm-console-frame__main']} data-dmgm-scroll>
        {children}
      </div>
      {overlay ? (
        <div className={styles['dmgm-console-frame__overlay']}>{overlay}</div>
      ) : null}
    </div>
  );
}
