import styles from './AgentSettingsTab.module.scss';

const PLACEHOLDER_MCPS = ['GitHub', 'Jira', 'Linear'];

export interface McpsTabProps {
  activeMcps?: number;
  toolCount?: number;
}

export default function McpsTab({
  activeMcps = 0,
  toolCount = 0,
}: McpsTabProps) {
  const visibleMcps = PLACEHOLDER_MCPS.slice(0, Math.max(activeMcps, 1));

  return (
    <div className={styles['settings-tab']}>
      <h2 className={styles['settings-tab__heading']}>MCPs</h2>
      <p className={styles['settings-tab__intro']}>
        Connected MCP servers and tools this agent or automation can use.
      </p>

      <div className={styles['settings-tab__stats']}>
        <span className={styles['settings-tab__stat']}>
          <span className={styles['settings-tab__stat-dot']} aria-hidden />
          {activeMcps} MCPs active
        </span>
        <span className={styles['settings-tab__stat']}>{toolCount} tools</span>
      </div>

      <ul className={styles['settings-tab__list']}>
        {visibleMcps.map((name) => (
          <li key={name} className={styles['settings-tab__list-item']}>
            {name}
          </li>
        ))}
      </ul>

      <p className={styles['settings-tab__note']}>
        MCP management isn&apos;t wired up in this prototype.
      </p>
    </div>
  );
}
