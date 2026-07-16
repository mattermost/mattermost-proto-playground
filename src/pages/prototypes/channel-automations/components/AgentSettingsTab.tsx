import { TextArea, TextInput } from '@mattermost/compass-ui';
import { useEffect, useState, type ChangeEvent } from 'react';
import {
  agentAvatarProps,
  modelsForAiService,
  type Agent,
} from '../channelAutomationsData';
import AgentAdvancedConfig from './AgentAdvancedConfig';
import {
  AiServiceModelField,
  PersonaIdentityField,
  SettingsSectionRow,
} from './settings';
import styles from './AgentSettingsTab.module.scss';

export interface AgentSettingsTabProps {
  agent: Agent;
  /** When true, username can be edited (create flow). */
  usernameEditable?: boolean;
}

/** Agent Settings tab — aligns with plugin-agents config + Advanced (PR #887). */
export default function AgentSettingsTab({
  agent,
  usernameEditable = false,
}: AgentSettingsTabProps) {
  const [displayName, setDisplayName] = useState(agent.displayName);
  const [description, setDescription] = useState(agent.description);
  const [username, setUsername] = useState(agent.username);
  const [aiServiceId, setAiServiceId] = useState('anthropic');
  const models = modelsForAiService(aiServiceId);
  const [modelId, setModelId] = useState(models[0]?.id ?? '');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    setDisplayName(agent.displayName);
    setDescription(agent.description);
    setUsername(agent.username);
  }, [agent.description, agent.displayName, agent.username, agent.id]);

  useEffect(() => {
    const nextModels = modelsForAiService(aiServiceId);
    setModelId((current) =>
      nextModels.some((option) => option.id === current)
        ? current
        : (nextModels[0]?.id ?? ''),
    );
  }, [aiServiceId]);

  return (
    <div className={styles['settings']}>
      <SettingsSectionRow label="Display name" divided>
        <TextInput
          className={styles['settings__control']}
          placeholder="e.g. Sales Assistant"
          value={displayName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDisplayName(e.target.value)
          }
        />
      </SettingsSectionRow>

      <SettingsSectionRow label="Username and avatar" divided>
        <PersonaIdentityField
          avatar={agentAvatarProps(agent)}
          username={username}
          onUsernameChange={setUsername}
          usernameDisabled={!usernameEditable}
          help="Users will mention this name to interact with the agent. Must start with a letter and contain only lowercase letters, numbers, dots, hyphens, or underscores. The username cannot be changed after the agent is created."
        />
      </SettingsSectionRow>

      <SettingsSectionRow label="Description" divided>
        <TextInput
          className={styles['settings__control']}
          placeholder="E.g. A general purpose agent to chat with"
          value={description}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDescription(e.target.value)
          }
        />
      </SettingsSectionRow>

      <SettingsSectionRow label="AI Service & model" divided>
        <AiServiceModelField
          aiServiceId={aiServiceId}
          modelId={modelId}
          onAiServiceChange={setAiServiceId}
          onModelChange={setModelId}
        />
      </SettingsSectionRow>

      <SettingsSectionRow label="Custom instructions" divided>
        <TextArea
          className={styles['settings__control']}
          placeholder="How would you like the agent to respond?"
          value={instructions}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setInstructions(e.target.value)
          }
          rows={8}
        />
      </SettingsSectionRow>

      <AgentAdvancedConfig aiServiceId={aiServiceId} />
    </div>
  );
}
