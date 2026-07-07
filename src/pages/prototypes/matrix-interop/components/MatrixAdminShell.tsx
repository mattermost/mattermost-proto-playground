import type { ReactNode } from 'react';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  AdminConsoleHeader,
  AdminConsoleSidebar,
  AdminPanelFooter,
  defaultAdminConsoleSidebarGroups,
  Scrollbar,
} from '@mattermost/compass-ui';
import styles from './MatrixAdminShell.module.scss';

const matrixBridgeSidebarGroups = defaultAdminConsoleSidebarGroups.map(
  (group) => {
    if (group.key !== 'plugins') {
      return {
        ...group,
        items: group.items.map((item) => ({ ...item, active: false })),
      };
    }

    return {
      ...group,
      items: [
        { name: 'Plugin Management' },
        { name: 'Matrix Bridge', active: true },
        { name: 'Jira' },
        { name: 'Zoom' },
      ],
    };
  },
);

type MatrixAdminShellProps = {
  title: string;
  children: ReactNode;
  showBack?: boolean;
  onBackClick?: () => void;
  ariaLabelBack?: string;
  saveDisabled?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
};

export default function MatrixAdminShell({
  title,
  children,
  showBack = false,
  onBackClick,
  ariaLabelBack = 'Go back',
  saveDisabled = true,
  onSave,
  onCancel,
}: MatrixAdminShellProps) {
  return (
    <div className={styles['matrix-admin-shell']}>
      <div className={styles['matrix-admin-shell__sidebar-mount']}>
        <AdminConsoleSidebar
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          groups={matrixBridgeSidebarGroups}
        />
      </div>

      <div className={styles['matrix-admin-shell__main']}>
        <AdminConsoleHeader
          title={title}
          enterpriseBadge={false}
          showBack={showBack}
          onBackClick={onBackClick}
          ariaLabelBack={ariaLabelBack}
        />

        <div className={styles['matrix-admin-shell__scroll']}>
          <Scrollbar>
            <div className={styles['matrix-admin-shell__panels']}>
              {children}
            </div>
          </Scrollbar>
        </div>

        <AdminPanelFooter
          saveDisabled={saveDisabled}
          onSave={onSave}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}

