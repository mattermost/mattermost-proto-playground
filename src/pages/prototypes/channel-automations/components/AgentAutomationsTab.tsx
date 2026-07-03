import { Button, Icon } from '@mattermost/compass-ui';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import type { Automation } from '../channelAutomationsData';
import AutomationListItem from './AutomationListItem';
import styles from './AgentAutomationsTab.module.scss';

export interface AgentAutomationsTabProps {
  automations: Automation[];
  /** Open the create form. */
  onNew: () => void;
  /** Open the edit form for an automation. */
  onEdit: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onRequestDelete: (id: string) => void;
}

/**
 * The Automations tab body for the Edit Agent view (Figma `4303-35266`). Shows
 * the "Create agent automations" empty state, or the list of the agent's
 * automations with a New automation action.
 */
export default function AgentAutomationsTab({
  automations,
  onNew,
  onEdit,
  onToggle,
  onRequestDelete,
}: AgentAutomationsTabProps) {
  if (automations.length === 0) {
    return (
      <div className={styles['tab__empty']}>
        <p className={styles['tab__empty-title']}>Create agent automations</p>
        <p className={styles['tab__empty-text']}>
          Create automations that run on a schedule or in response to events.
        </p>
        <Button
          size="Small"
          emphasis="Tertiary"
          leadingIcon={<Icon size="12" glyph={<PlusIcon />} />}
          onClick={onNew}
        >
          New automation
        </Button>
      </div>
    );
  }

  return (
    <div className={styles['tab']}>
      <div className={styles['tab__bar']}>
        <div className={styles['tab__intro']}>
          <p className={styles['tab__heading']}>Automations</p>
          <p className={styles['tab__subheading']}>
            Create automations that run on a schedule or in response to events.
          </p>
        </div>
        <Button
          size="Small"
          emphasis="Tertiary"
          leadingIcon={<Icon size="12" glyph={<PlusIcon />} />}
          onClick={onNew}
        >
          New automation
        </Button>
      </div>

      <div className={styles['tab__rows']}>
        {automations.map((automation) => (
          <AutomationListItem
            key={automation.id}
            automation={automation}
            onToggle={onToggle}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </div>
    </div>
  );
}
