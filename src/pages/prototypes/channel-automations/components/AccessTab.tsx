import styles from './AgentSettingsTab.module.scss';

export default function AccessTab() {
  return (
    <div className={styles['settings-tab']}>
      <h2 className={styles['settings-tab__heading']}>Access</h2>
      <p className={styles['settings-tab__intro']}>
        Control who can discover, run, and manage this agent or automation.
      </p>

      <div className={styles['settings-tab__section']}>
        <h3 className={styles['settings-tab__section-title']}>Workspace access</h3>
        <p className={styles['settings-tab__section-text']}>
          Everyone in the workspace can view and interact with this agent.
        </p>
      </div>

      <div className={styles['settings-tab__section']}>
        <h3 className={styles['settings-tab__section-title']}>Channel scope</h3>
        <p className={styles['settings-tab__section-text']}>
          Limit which channels and teams this agent can post to or read from.
        </p>
      </div>

      <p className={styles['settings-tab__note']}>
        Access controls aren&apos;t wired up in this prototype.
      </p>
    </div>
  );
}
