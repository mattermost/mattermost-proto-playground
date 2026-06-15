import type { AgentTabKey } from './EditAgentView';
import styles from './PlaceholderTab.module.scss';

const TAB_LABELS: Record<Exclude<AgentTabKey, 'automations'>, string> = {
  configuration: 'Configuration',
  access: 'Access',
  mcps: 'MCPs',
};

export interface PlaceholderTabProps {
  tab: Exclude<AgentTabKey, 'automations'>;
}

/**
 * Out-of-scope tabs for this prototype. The Automations tab is the focus;
 * the others show a brief note so the tab strip stays navigable.
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
