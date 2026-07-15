import {
  Button,
  Select,
  TextArea,
  TextInput,
  UserAvatar,
} from '@mattermost/compass-ui';
import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  AI_SERVICES,
  agentAvatarProps,
  modelsForAiService,
  type Agent,
} from '../channelAutomationsData';
import AgentAdvancedConfig from './AgentAdvancedConfig';
import styles from './AgentSettingsTab.module.scss';

export interface AgentSettingsTabProps {
  agent: Agent;
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles['settings__row']}>
      <p className={styles['settings__label']}>{label}</p>
      <div className={styles['settings__fields']}>{children}</div>
    </div>
  );
}

/** Agent Settings tab — aligns with plugin-agents config + Advanced (PR #887). */
export default function AgentSettingsTab({ agent }: AgentSettingsTabProps) {
  const [displayName, setDisplayName] = useState(agent.displayName);
  const [description, setDescription] = useState(
    'A general purpose agent to chat with',
  );
  const [username, setUsername] = useState(agent.username);
  const [aiServiceId, setAiServiceId] = useState('anthropic');
  const models = modelsForAiService(aiServiceId);
  const [modelId, setModelId] = useState(models[0]?.id ?? '');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    setDisplayName(agent.displayName);
    setUsername(agent.username);
  }, [agent.displayName, agent.username, agent.id]);

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
      <SettingRow label="Display name">
        <TextInput
          className={styles['settings__control']}
          placeholder="e.g. Sales Assistant"
          value={displayName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDisplayName(e.target.value)
          }
        />
      </SettingRow>

      <SettingRow label="Description">
        <TextInput
          className={styles['settings__control']}
          placeholder="E.g. A general purpose agent to chat with"
          value={description}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDescription(e.target.value)
          }
        />
      </SettingRow>

      <SettingRow label="Agent username and avatar">
        <div className={styles['settings__persona']}>
          <div className={styles['settings__persona-row']}>
            <TextInput
              className={styles['settings__control']}
              placeholder="Agent username"
              value={username}
              disabled
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
            />
            <div className={styles['settings__avatar-actions']}>
              <UserAvatar size="40" {...agentAvatarProps(agent)} />
              <Button emphasis="Tertiary" size="Medium">
                Upload image
              </Button>
            </div>
          </div>
          <p className={styles['settings__help']}>
            Users will mention this name to interact with the agent. Must start
            with a letter and contain only lowercase letters, numbers, dots,
            hyphens, or underscores. The username cannot be changed after the
            agent is created.
          </p>
        </div>
      </SettingRow>

      <SettingRow label="AI Service">
        <div className={styles['settings__model']}>
          <Select
            className={styles['settings__control']}
            value={aiServiceId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setAiServiceId(e.target.value)
            }
          >
            {AI_SERVICES.map((service) => (
              <option key={service.id} value={service.id}>
                {service.label}
              </option>
            ))}
          </Select>
          <p className={styles['settings__help']}>
            Select an AI service to load model suggestions and configure vision,
            tools, native provider tools, reasoning, and structured output.
          </p>
        </div>
      </SettingRow>

      <SettingRow label="Model">
        <Select
          className={styles['settings__control']}
          value={modelId}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setModelId(e.target.value)
          }
        >
          {models.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </SettingRow>

      <SettingRow label="Custom instructions">
        <TextArea
          className={styles['settings__control']}
          placeholder="How would you like the agent to respond?"
          value={instructions}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setInstructions(e.target.value)
          }
          rows={8}
        />
      </SettingRow>

      <AgentAdvancedConfig aiServiceId={aiServiceId} />
    </div>
  );
}
