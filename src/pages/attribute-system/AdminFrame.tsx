import type { ReactNode } from 'react';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import AdminConsoleSidebar from '@/components/ui/AdminConsoleSidebar/AdminConsoleSidebar';
import AdminConsoleHeader from '@/components/ui/AdminConsoleHeader/AdminConsoleHeader';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import type { AdminConsoleSidebarGroupModel } from '@/components/ui/AdminConsoleSidebar/adminConsoleSidebarModel';
import styles from './AttributeSystem.module.scss';

interface AdminFrameProps {
  consoleTitle: string;
  userHandle: string;
  groups: AdminConsoleSidebarGroupModel[];
  headerTitle: string;
  enterpriseBadge?: boolean;
  enterpriseBadgeLabel?: string;
  footer?: ReactNode;
  /** Drawer / overlay rendered above the frame body. */
  overlay?: ReactNode;
  children: ReactNode;
}

/**
 * Generic System Console / settings shell built from the admin-console layout
 * base. The sidebar group model drives the left nav so each persona scene can
 * present its own information architecture.
 */
export default function AdminFrame({
  consoleTitle,
  userHandle,
  groups,
  headerTitle,
  enterpriseBadge = true,
  enterpriseBadgeLabel = 'Enterprise',
  footer,
  overlay,
  children,
}: AdminFrameProps) {
  return (
    <div className={styles.frame}>
      <div className={styles.frame__sidebar}>
        <AdminConsoleSidebar
          consoleTitle={consoleTitle}
          userHandle={userHandle}
          userDisplayName="Leonard Riley"
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          groups={groups}
        />
      </div>

      <div className={styles.frame__main}>
        <AdminConsoleHeader
          title={headerTitle}
          enterpriseBadge={enterpriseBadge}
          enterpriseBadgeLabel={enterpriseBadgeLabel}
          trailing={
            <LabelTag label="Concept · [AI DRAFT]" type="Info Dim" size="X-Small" />
          }
        />

        <div className={styles.frame__scroll}>
          <Scrollbars>
            <div className={styles.frame__panels}>{children}</div>
          </Scrollbars>
        </div>

        {footer}
      </div>

      {overlay}
    </div>
  );
}
