import { Icon, MenuItem, UserAvatar } from '@mattermost/compass-ui';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import { AGENTS, agentAvatarProps } from '../channelAutomationsData';
import styles from './ChooseAgentPrompt.module.scss';

export interface ChooseAgentPromptProps {
  title?: string;
  onSelectAgent: (agentId: string) => void;
  onCancel?: () => void;
}

export default function ChooseAgentPrompt({
  title = 'Choose an agent to run the automation',
  onSelectAgent,
  onCancel,
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
        Pick which agent executes and posts on behalf of this automation.
      </p>
      <ul className={styles['prompt__list']} role="listbox" aria-label={title}>
        {AGENTS.map((agent) => (
          <li key={agent.id}>
            <MenuItem
              label={agent.displayName}
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
