import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import type { ReactNode } from 'react';
import type { AgentAdvancedConfig } from '../agentsData';
import styles from './AgentSettingsModal.module.scss';

type AgentSettingsAdvancedPanelProps = {
  config: AgentAdvancedConfig;
  onChange: (config: AgentAdvancedConfig) => void;
};

function SettingRow({
  label,
  help,
  children,
}: {
  label: string;
  help: string;
  children: ReactNode;
}) {
  return (
    <div className={styles['agent-settings-modal__setting']}>
      <p className={styles['agent-settings-modal__setting-label']}>{label}</p>
      <div className={styles['agent-settings-modal__setting-control']}>
        {children}
        <p className={styles['agent-settings-modal__help']}>{help}</p>
      </div>
    </div>
  );
}

export default function AgentSettingsAdvancedPanel({
  config,
  onChange,
}: AgentSettingsAdvancedPanelProps) {
  const patch = (partial: Partial<AgentAdvancedConfig>) =>
    onChange({ ...config, ...partial });

  return (
    <div className={styles['agent-settings-modal__access']}>
      <div className={styles['agent-settings-modal__access-block']}>
        <div className={styles['agent-settings-modal__section-header']}>
          <h3 className={styles['agent-settings-modal__section-title']}>
            Advanced configuration
          </h3>
          <p className={styles['agent-settings-modal__help']}>
            Model and tool behavior for this agent. Changes apply when you
            save.
          </p>
        </div>

        <div className={styles['agent-settings-modal__settings']}>
          <SettingRow
            label="Dynamic tool loading"
            help="When enabled, the agent will automatically load tools as needed."
          >
            <Checkbox
              checked={config.dynamicToolLoading}
              onChange={(e) =>
                patch({ dynamicToolLoading: e.target.checked })
              }
            >
              Enable
            </Checkbox>
          </SettingRow>

          <SettingRow
            label="Max tool turns"
            help="Maximum number of consecutive tool calls the agent can make."
          >
            <TextInput
              className={styles['agent-settings-modal__setting-number']}
              type="number"
              min={1}
              inputMode="numeric"
              value={config.maxToolTurns}
              onChange={(e) => patch({ maxToolTurns: e.target.value })}
              aria-label="Max tool turns"
            />
          </SettingRow>

          <SettingRow
            label="Enable Vision"
            help="Enable vision capabilities for the agent."
          >
            <Checkbox
              checked={config.enableVision}
              onChange={(e) => patch({ enableVision: e.target.checked })}
            >
              Enable
            </Checkbox>
          </SettingRow>

          <SettingRow
            label="Enable Tools"
            help="Enable tool calling for the agent."
          >
            <Checkbox
              checked={config.enableTools}
              onChange={(e) => patch({ enableTools: e.target.checked })}
            >
              Enable
            </Checkbox>
          </SettingRow>

          <SettingRow
            label="Native Claude Tools"
            help="Native tools provided by Claude (Anthropic models only)."
          >
            <div className={styles['agent-settings-modal__setting-stack']}>
              <Checkbox
                checked={config.nativeWebSearch}
                disabled={!config.enableTools}
                onChange={(e) =>
                  patch({ nativeWebSearch: e.target.checked })
                }
              >
                Web Search
              </Checkbox>
              <Checkbox
                checked={config.nativeWebFetch}
                disabled={!config.enableTools}
                onChange={(e) =>
                  patch({ nativeWebFetch: e.target.checked })
                }
              >
                Web Fetch
              </Checkbox>
              <Checkbox
                checked={config.nativeCodeExecution}
                disabled={!config.enableTools}
                onChange={(e) =>
                  patch({ nativeCodeExecution: e.target.checked })
                }
              >
                Code Execution
              </Checkbox>
            </div>
          </SettingRow>

          <SettingRow
            label="Extended Thinking"
            help="Enable extended thinking for more thorough reasoning."
          >
            <Checkbox
              checked={config.extendedThinking}
              onChange={(e) =>
                patch({ extendedThinking: e.target.checked })
              }
            >
              Enable
            </Checkbox>
          </SettingRow>

          {config.extendedThinking ? (
            <SettingRow
              label="Thinking Budget"
              help="Maximum tokens for thinking. Range: 1024–32000."
            >
              <TextInput
                className={styles['agent-settings-modal__setting-number']}
                type="number"
                min={1024}
                max={32000}
                inputMode="numeric"
                value={config.thinkingBudget}
                onChange={(e) =>
                  patch({ thinkingBudget: e.target.value })
                }
                aria-label="Thinking budget"
              />
            </SettingRow>
          ) : null}

          <SettingRow
            label="Structured Output"
            help="Enable structured JSON output from the agent."
          >
            <Checkbox
              checked={config.structuredOutput}
              onChange={(e) =>
                patch({ structuredOutput: e.target.checked })
              }
            >
              Enable
            </Checkbox>
          </SettingRow>
        </div>
      </div>
    </div>
  );
}
