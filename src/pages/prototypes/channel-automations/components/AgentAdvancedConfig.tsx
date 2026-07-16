import { Checkbox, Select, TextInput } from '@mattermost/compass-ui';
import { useState, type ChangeEvent } from 'react';
import {
  SettingsDisclosureCard,
  SettingsHelpText,
  SettingsSectionRow,
} from './settings';
import styles from './AgentAdvancedConfig.module.scss';

const DEFAULT_MAX_TOOL_TURNS = 10;
const REASONING_EFFORTS = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
] as const;

export interface AgentAdvancedConfigProps {
  /** Drives which provider-specific options are shown. */
  aiServiceId: string;
  className?: string;
  /**
   * When true, render fields only (no outer Advanced disclosure) —
   * for nesting inside Option 3b’s progressive Advanced panel.
   */
  embedded?: boolean;
  /** Controlled Enable Tools value (Option 3b lifts this to hide the Tools tab). */
  enableTools?: boolean;
  onEnableToolsChange?: (enabled: boolean) => void;
}

/**
 * Agent Settings “Advanced configuration” — mirrors plugin-agents PR #887
 * (tool limits, vision, native tools, reasoning, structured output).
 */
export default function AgentAdvancedConfig({
  aiServiceId,
  className = '',
  embedded = false,
  enableTools: enableToolsProp,
  onEnableToolsChange,
}: AgentAdvancedConfigProps) {
  const [dynamicToolLoading, setDynamicToolLoading] = useState(true);
  const [maxToolTurns, setMaxToolTurns] = useState(String(DEFAULT_MAX_TOOL_TURNS));
  const [enableVision, setEnableVision] = useState(false);
  const [internalEnableTools, setInternalEnableTools] = useState(true);
  const [webSearch, setWebSearch] = useState(true);
  const [reasoningEnabled, setReasoningEnabled] = useState(true);
  const [reasoningEffort, setReasoningEffort] = useState('medium');
  const [thinkingBudget, setThinkingBudget] = useState('');
  const [structuredOutput, setStructuredOutput] = useState(false);

  const enableTools = enableToolsProp ?? internalEnableTools;
  const setEnableTools = (next: boolean) => {
    if (enableToolsProp === undefined) setInternalEnableTools(next);
    onEnableToolsChange?.(next);
  };

  const isAnthropic = aiServiceId === 'anthropic';
  const isOpenAI =
    aiServiceId === 'openai' || aiServiceId === 'azure-openai';
  const showNativeTools = isAnthropic || isOpenAI;
  const showReasoning = isAnthropic || isOpenAI;
  const showStructuredOutput = isAnthropic || isOpenAI;

  const fields = (
    <div className={styles['advanced__fields-stack']}>
      <SettingsSectionRow label="Enable Vision" divided>
        <Checkbox
          size="Medium"
          checked={enableVision}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEnableVision(e.target.checked)
          }
        >
          Enable
        </Checkbox>
        <SettingsHelpText>
          Enable Vision to allow the bot to process images. Requires a
          compatible model.
        </SettingsHelpText>
      </SettingsSectionRow>

      <SettingsSectionRow label="Enable Tools" divided>
        <Checkbox
          size="Medium"
          checked={enableTools}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEnableTools(e.target.checked)
          }
        >
          Enable
        </Checkbox>
        <SettingsHelpText>
          By default some tool use is enabled to allow for features such as
          integrations with JIRA. Disabling this allows use of models that do
          not support or are not very good at tool use. Some features will not
          work without tools.
        </SettingsHelpText>
      </SettingsSectionRow>

      {enableTools ? (
        <>
          <SettingsSectionRow label="Dynamic tool loading" divided>
            <Checkbox
              size="Medium"
              checked={dynamicToolLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDynamicToolLoading(e.target.checked)
              }
            >
              Enable
            </Checkbox>
            <SettingsHelpText>
              Expose search and load helper tools first, then load MCP tool
              schemas only when the agent needs them. Disable this to use the
              full MCP tool list for this agent.
            </SettingsHelpText>
          </SettingsSectionRow>

          <SettingsSectionRow label="Max tool turns" divided>
            <TextInput
              className={styles['advanced__control']}
              type="number"
              min={1}
              max={100}
              placeholder={String(DEFAULT_MAX_TOOL_TURNS)}
              value={maxToolTurns}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMaxToolTurns(e.target.value)
              }
            />
            <SettingsHelpText>
              Maximum number of consecutive tool-call/execute rounds the agent
              will run before stopping. Lower this for smaller models that tend
              to loop on tool calls; raise it for agents that chain many tools
              per turn.
            </SettingsHelpText>
          </SettingsSectionRow>
        </>
      ) : null}

      {enableTools && showNativeTools ? (
        <SettingsSectionRow
          label={
            isAnthropic ? 'Anthropic native tools' : 'OpenAI native tools'
          }
          divided
        >
          <Checkbox
            size="Medium"
            checked={webSearch}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWebSearch(e.target.checked)
            }
          >
            Web search
          </Checkbox>
          <SettingsHelpText>
            Allow the model to use the provider’s built-in web search tool when
            answering.
          </SettingsHelpText>
        </SettingsSectionRow>
      ) : null}

      {showReasoning ? (
        <SettingsSectionRow
          label={isAnthropic ? 'Extended Thinking' : 'Reasoning'}
          divided
        >
          {!isAnthropic ? (
            <div className={styles['advanced__inline-controls']}>
              <span className={styles['advanced__inline-check']}>
                <Checkbox
                  size="Medium"
                  checked={reasoningEnabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setReasoningEnabled(e.target.checked)
                  }
                >
                  Enable
                </Checkbox>
              </span>
              {reasoningEnabled ? (
                <Select
                  className={styles['advanced__effort-select']}
                  label="Effort"
                  value={reasoningEffort}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setReasoningEffort(e.target.value)
                  }
                >
                  {REASONING_EFFORTS.map((effort) => (
                    <option key={effort.id} value={effort.id}>
                      {effort.label}
                    </option>
                  ))}
                </Select>
              ) : null}
            </div>
          ) : (
            <>
              <div className={styles['advanced__inline-controls']}>
                <span className={styles['advanced__inline-check']}>
                  <Checkbox
                    size="Medium"
                    checked={reasoningEnabled && !structuredOutput}
                    disabled={structuredOutput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setReasoningEnabled(e.target.checked)
                    }
                  >
                    Enable
                  </Checkbox>
                </span>
                {reasoningEnabled && !structuredOutput ? (
                  <TextInput
                    className={styles['advanced__thinking-budget']}
                    type="number"
                    min={1024}
                    label="Thinking Budget (tokens)"
                    placeholder="1024"
                    value={thinkingBudget}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setThinkingBudget(e.target.value)
                    }
                  />
                ) : null}
              </div>
              <SettingsHelpText>
                Token budget for extended thinking. Higher values allow deeper
                reasoning but increase response time and cost. Leave blank to
                use the default.
              </SettingsHelpText>
            </>
          )}
        </SettingsSectionRow>
      ) : null}

      {showStructuredOutput ? (
        <SettingsSectionRow label="Structured Output" divided>
          <Checkbox
            size="Medium"
            checked={structuredOutput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const next = e.target.checked;
              setStructuredOutput(next);
              if (isAnthropic && next) {
                setReasoningEnabled(false);
              }
            }}
          >
            Enable
          </Checkbox>
          <SettingsHelpText>
            {isAnthropic
              ? 'Enable structured JSON output for this agent. Requires a compatible Anthropic model (Claude 4.5/4.6+). Structured output and extended thinking cannot be used simultaneously.'
              : 'Enable structured JSON output for this agent. When enabled and a JSON schema is provided in the request, the model will produce valid JSON matching the schema.'}
          </SettingsHelpText>
          {isAnthropic && structuredOutput ? (
            <p className={styles['advanced__note']}>
              Extended thinking is turned off while structured output is enabled
              (Anthropic does not support both at once).
            </p>
          ) : null}
        </SettingsSectionRow>
      ) : null}
    </div>
  );

  if (embedded) {
    return <div className={className || undefined}>{fields}</div>;
  }

  return (
    <SettingsDisclosureCard
      className={className}
      title="Advanced configuration"
      hint="Tool limits, vision, reasoning, and other model-specific options"
    >
      {fields}
    </SettingsDisclosureCard>
  );
}
