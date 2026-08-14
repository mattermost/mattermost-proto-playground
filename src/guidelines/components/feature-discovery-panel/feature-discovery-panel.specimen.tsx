import { FeatureDiscoveryPanel } from '@mattermost/compass-ui';
import GroupsIllustration from '@/assets/illustrations/groups.svg?react';
import styles from '@/styles/library-demo/components.module.scss';

export default function FeatureDiscoveryPanelLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With illustration
          </span>
          <FeatureDiscoveryPanel
            skuLabel="PROFESSIONAL"
            title="Synchronize your Active Directory/LDAP groups"
            description="Use AD/LDAP groups to organize and apply actions to multiple users at once. Manage team and channel memberships, permissions, and more."
            primaryAction={{ children: 'Contact sales' }}
            secondaryAction={{ emphasis: 'Tertiary', children: 'Learn more' }}
            illustration={{
              children: <GroupsIllustration />,
              width: '276px',
              height: '170px',
              'aria-label': 'Groups illustration',
            }}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Text only
          </span>
          <FeatureDiscoveryPanel
            skuLabel="PROFESSIONAL"
            title="Unlock advanced reporting"
            description="Get deeper insights into your workspace with advanced analytics and custom dashboards available on the Professional plan."
            primaryAction={{ children: 'Upgrade now' }}
            secondaryAction={{ emphasis: 'Tertiary', children: 'Learn more' }}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            No SKU tag
          </span>
          <FeatureDiscoveryPanel
            skuLabel={null}
            title="Enable compliance exports"
            description="Configure automated message exports for regulatory compliance."
            primaryAction={{ children: 'Enable' }}
          />
        </div>
      </div>
    </>
  );
}
