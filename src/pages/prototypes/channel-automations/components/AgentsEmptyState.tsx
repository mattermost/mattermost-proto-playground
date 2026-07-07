import { Button, Icon, Illustration } from '@mattermost/compass-ui';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import AiCopilotIntro from '@/assets/illustrations/ai-copilot-intro.svg?react';
import NewAutomationAgentPicker from './NewAutomationAgentPicker';
import styles from './AgentsEmptyState.module.scss';

export interface AgentsEmptyStateProps {
  onCreate?: () => void;
  onCreateForAgent?: (agentId: string) => void;
}

/**
 * Agents panel empty state (Figma `4258-47129`) — the featured "Create a
 * channel automation" entry point, surfaced where the conversation happens.
 */
export default function AgentsEmptyState({
  onCreate,
  onCreateForAgent,
}: AgentsEmptyStateProps) {
  const createControl = onCreateForAgent ? (
    <NewAutomationAgentPicker
      size="Small"
      emphasis="Tertiary"
      icon="lightning"
      label="Create a channel automation"
      onSelectAgent={onCreateForAgent}
    />
  ) : (
    <Button
      emphasis="Tertiary"
      size="Small"
      leadingIcon={<Icon size="16" glyph={<CreationOutlineIcon />} />}
      onClick={onCreate}
    >
      Create a channel automation
    </Button>
  );

  return (
    <div className={styles['empty']}>
      <span className={styles['empty__art']}>
        <Illustration aria-label="">
          <AiCopilotIntro />
        </Illustration>
      </span>
      <h3 className={styles['empty__title']}>Ask Agents anything</h3>
      <p className={styles['empty__text']}>
        Agents are here to help. Choose from the prompts below or write your
        own.
      </p>
      {createControl}
    </div>
  );
}
