import { Icon, MenuItem, UserAvatar } from '@mattermost/compass-ui';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import {
  AGENTS,
  agentAvatarProps,
  agentCapabilitySummary,
} from '../channelAutomationsData';
import styles from './ChooseAgentPrompt.module.scss';

export interface ChooseAgentPromptProps {
  title?: string;
  onSelectAgent: (agentId: string) => void;
  onCancel?: () => void;
  /** Option 4 — surface tools/access so capability fit is obvious. */
  showCapabilities?: boolean;
}

export default function ChooseAgentPrompt({
  title = 'Choose an agent to run the automation',
  onSelectAgent,
  onCancel,
  showCapabilities = false,
}: ChooseAgentPromptProps) {
  return (
    <div className={styles['prompt']}>
      {onCancel ? (
        <button
          type="button"
          className={styles['prompt__back']}
          onClick={onCancel}
        >
          <Icon size="16" glyph={<ArrowLeftIcon />} />
          Back
        </button>
      ) : null}
      <h3 className={styles['prompt__title']}>{title}</h3>
      <p className={styles['prompt__text']}>
        {showCapabilities
          ? 'Pick an executor by capability. You can grant additional tools to this automation later without editing the agent.'
          : 'Pick which agent executes and posts on behalf of this automation.'}
      </p>
      <ul className={styles['prompt__list']} role="listbox" aria-label={title}>
        {AGENTS.map((agent) => (
          <li key={agent.id}>
            <MenuItem
              label={agent.displayName}
              secondaryLabel={
                showCapabilities ? agentCapabilitySummary(agent) : undefined
              }
              leadingVisual={
                <UserAvatar size="16" {...agentAvatarProps(agent)} />
              }
              onClick={() => onSelectAgent(agent.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
