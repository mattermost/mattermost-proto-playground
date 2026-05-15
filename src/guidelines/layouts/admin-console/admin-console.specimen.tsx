import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import AdminPanelFooter from '@/components/ui/AdminPanelFooter/AdminPanelFooter';
import AdminConsoleHeader from '@/components/ui/AdminConsoleHeader/AdminConsoleHeader';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import AdminConsoleSidebar from '@/components/ui/AdminConsoleSidebar/AdminConsoleSidebar';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import styles from './admin-console.specimen.module.scss';

export default function AdminConsoleLayout() {
  return (
    <div className={styles['admin-console-layout']}>
      <div className={styles['admin-console-layout__sidebar-mount']}>
        <AdminConsoleSidebar
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
        />
      </div>

      <div className={styles['admin-console-layout__main']}>
        <AdminConsoleHeader
          title="Teams"
          enterpriseBadge
          enterpriseBadgeLabel="Enterprise"
        />

        <div className={styles['admin-console-layout__scroll']}>
          <Scrollbars>
            <div className={styles['admin-console-layout__panels']}>
              <AdminPanel
                title="Enable team creation"
                subtitle="Allow users with permission to create new teams from the product interface."
                iconLeft
                showEnterpriseLabel
                showSwitch
                switchLabel="On"
                defaultSwitchChecked
                expandable
                defaultExpandedState="Expanded"
              >
                <p className={styles['admin-console-layout__copy']}>
                  When turned off, only system administrators can create teams.
                  Existing teams are not affected.
                </p>
              </AdminPanel>

              <AdminPanel
                title="Team directory"
                subtitle="Control how teams are listed for discovery and join requests."
                iconLeft
                showBeta
                expandable
                defaultExpandedState="Collapsed"
              >
                <p className={styles['admin-console-layout__copy']}>
                  Open the section to configure visibility, invitations, and guest
                  access defaults for the team directory.
                </p>
              </AdminPanel>

              <AdminPanel
                title="Default teams for new users"
                subtitle="Teams that members are added to automatically during onboarding."
                iconLeft
              >
                <p className={styles['admin-console-layout__copy']}>
                  Choose one or more teams to keep new accounts oriented without a
                  blank sidebar.
                </p>
              </AdminPanel>
            </div>
          </Scrollbars>
        </div>

        <AdminPanelFooter saveDisabled={false} />
      </div>
    </div>
  );
}
