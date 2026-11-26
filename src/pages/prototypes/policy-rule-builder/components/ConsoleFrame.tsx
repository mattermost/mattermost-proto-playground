// [AI DRAFT] System Console chrome for the authoring and Simulate scenes.
// Same composition as the Access Channel port's console frame, with this
// prototype's admin so no cast member is shared across prototypes.
import type { ReactNode } from 'react';
import { AdminConsoleSidebar } from '@mattermost/compass-ui/components/admin-console-sidebar';
import { consoleNavWithActive } from '../../action-controls-view-channel/adminData';
import { ADMIN } from '../model/fixtures';
import styles from './ConsoleFrame.module.scss';

export interface ConsoleFrameProps {
  activeItem?: string;
  children: ReactNode;
  /** Modal layer rendered over the console, inside the frame. */
  overlay?: ReactNode;
}

export default function ConsoleFrame({
  activeItem = 'Permission Policies',
  children,
  overlay,
}: ConsoleFrameProps) {
  return (
    <div className={styles['prb-console-frame']}>
      <div className={styles['prb-console-frame__sidebar']}>
        <AdminConsoleSidebar
          groups={consoleNavWithActive(activeItem)}
          consoleTitle="System Console"
          userDisplayName={ADMIN.name}
          userHandle={`@${ADMIN.username}`}
          avatarSrc={ADMIN.avatarSrc}
          avatarAlt={ADMIN.name}
        />
      </div>
      <div className={styles['prb-console-frame__main']}>
        {children}
      </div>
      {overlay ? (
        <div className={styles['prb-console-frame__overlay']}>{overlay}</div>
      ) : null}
    </div>
  );
}
