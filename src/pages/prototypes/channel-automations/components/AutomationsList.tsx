import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AiCopilotIntro from '@/assets/illustrations/ai-copilot-intro.svg?react';
import Button from '@/components/ui/Button/Button';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Icon from '@/components/ui/Icon/Icon';
import type { Automation } from '../channelAutomationsData';
import AutomationListItem from './AutomationListItem';
import styles from './AutomationsList.module.scss';

export interface AutomationsListProps {
  automations: Automation[];
  onCreate: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Shared management list body — used by both the RHS panel and the modal
 * variant. Shows an empty state with a create CTA, or the list of automations
 * with per-row toggle / overflow actions.
 */
export default function AutomationsList({
  automations,
  onCreate,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: AutomationsListProps) {
  if (automations.length === 0) {
    return (
      <EmptyState
        illustration={{ children: <AiCopilotIntro />, 'aria-label': '' }}
        title="No automations yet"
        description="Let an Agent set up recurring posts, recaps, or auto-replies for this channel."
        action={{
          children: 'Create an automation',
          leadingIcon: <Icon size="16" glyph={<CreationOutlineIcon />} />,
          onClick: onCreate,
        }}
      />
    );
  }

  return (
    <div className={styles['list']}>
      <div className={styles['list__bar']}>
        <span className={styles['list__count']}>
          {automations.length}{' '}
          {automations.length === 1 ? 'automation' : 'automations'}
        </span>
        <Button
          size="Small"
          emphasis="Tertiary"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={onCreate}
        >
          Create automation
        </Button>
      </div>

      <div className={styles['list__rows']}>
        {automations.map((automation) => (
          <AutomationListItem
            key={automation.id}
            automation={automation}
            onToggle={onToggle}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
