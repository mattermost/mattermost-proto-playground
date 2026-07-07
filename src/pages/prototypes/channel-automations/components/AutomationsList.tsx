import { Button, EmptyState, Icon } from '@mattermost/compass-ui';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AiCopilotIntro from '@/assets/illustrations/ai-copilot-intro.svg?react';
import type { Automation } from '../channelAutomationsData';
import AutomationListItem from './AutomationListItem';
import NewAutomationAgentPicker from './NewAutomationAgentPicker';
import styles from './AutomationsList.module.scss';

export interface AutomationsListProps {
  automations: Automation[];
  onCreate: () => void;
  onCreateForAgent?: (agentId: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onRequestDelete: (id: string) => void;
}

/**
 * Shared management list body — used by both the RHS panel and the modal
 * variant. Shows an empty state with a create CTA, or the list of automations
 * with per-row toggle / overflow actions.
 */
export default function AutomationsList({
  automations,
  onCreate,
  onCreateForAgent,
  onToggle,
  onEdit,
  onRequestDelete,
}: AutomationsListProps) {
  const createControl = onCreateForAgent ? (
    <NewAutomationAgentPicker
      size="Small"
      emphasis="Tertiary"
      icon="none"
      onSelectAgent={onCreateForAgent}
    />
  ) : (
    <Button
      size="Small"
      emphasis="Tertiary"
      leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
      onClick={onCreate}
    >
      New automation
    </Button>
  );

  if (automations.length === 0) {
    return (
      <>
        <EmptyState
          illustration={{ children: <AiCopilotIntro />, 'aria-label': '' }}
          title="No automations yet"
          description="Let an Agent set up recurring posts, recaps, or auto-replies for this channel."
          action={
            onCreateForAgent
              ? undefined
              : {
                  children: 'New automation',
                  leadingIcon: <Icon size="16" glyph={<CreationOutlineIcon />} />,
                  onClick: onCreate,
                }
          }
        />
        {onCreateForAgent ? (
          <div className={styles['list__empty-action']}>{createControl}</div>
        ) : null}
      </>
    );
  }

  return (
    <div className={styles['list']}>
      <div className={styles['list__bar']}>
        <span className={styles['list__count']}>
          {automations.length}{' '}
          {automations.length === 1 ? 'automation' : 'automations'}
        </span>
        {createControl}
      </div>

      <div className={styles['list__rows']}>
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
