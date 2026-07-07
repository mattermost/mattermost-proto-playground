import type { AgentTabKey } from './EditAgentView';
import styles from './PlaceholderTab.module.scss';

const TAB_LABELS: Record<Exclude<AgentTabKey, 'automations' | 'chat'>, string> = {
  configuration: 'Settings',
  access: 'Access',
  mcps: 'Tools',
};

export interface PlaceholderTabProps {
  tab: Exclude<AgentTabKey, 'automations' | 'chat'>;
}

/**
 * Out-of-scope tabs for this prototype. Access and Tools have dedicated views;
 * configuration on the agent edit screen uses this placeholder.
 */
export default function PlaceholderTab({ tab }: PlaceholderTabProps) {
  return (
    <div className={styles['placeholder']}>
      <p className={styles['placeholder__text']}>
        {TAB_LABELS[tab]} settings aren’t part of this prototype.
      </p>
    </div>
  );
}
