import { Checkbox, Icon, Select, TextInput } from '@mattermost/compass-ui';
import { useId, useState, type ChangeEvent, type ReactNode } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import styles from './AgentAdvancedConfig.module.scss';

const DEFAULT_MAX_TOOL_TURNS = 10;
const REASONING_EFFORTS = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
] as const;

function AdvancedRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles['advanced__row']}>
      <p className={styles['advanced__label']}>{label}</p>
      <div className={styles['advanced__fields']}>{children}</div>
    </div>
  );
}

export interface AgentAdvancedConfigProps {
  /** Drives which provider-specific options are shown. */
  aiServiceId: string;
  className?: string;
}

/**
 * Agent Settings “Advanced configuration” — mirrors plugin-agents PR #887
 * (tool limits, vision, native tools, reasoning, structured output).
 */
export default function AgentAdvancedConfig({
  aiServiceId,
  className = '',
}: AgentAdvancedConfigProps) {
  const panelId = useId().replace(/\W/g, '');
  const [expanded, setExpanded] = useState(false);

  const [dynamicToolLoading, setDynamicToolLoading] = useState(true);
  const [maxToolTurns, setMaxToolTurns] = useState(String(DEFAULT_MAX_TOOL_TURNS));
  const [enableVision, setEnableVision] = useState(false);
  const [enableTools, setEnableTools] = useState(true);
  const [webSearch, setWebSearch] = useState(true);
  const [reasoningEnabled, setReasoningEnabled] = useState(true);
  const [reasoningEffort, setReasoningEffort] = useState('medium');
  const [thinkingBudget, setThinkingBudget] = useState('');
  const [structuredOutput, setStructuredOutput] = useState(false);

  const isAnthropic = aiServiceId === 'anthropic';
  const isOpenAI =
    aiServiceId === 'openai' || aiServiceId === 'azure-openai';
  const showNativeTools = isAnthropic || isOpenAI;
  const showReasoning = isAnthropic || isOpenAI;
  const showStructuredOutput = isAnthropic || isOpenAI;

  return (
    <section
      className={[styles['advanced'], className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={styles['advanced__trigger']}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className={styles['advanced__trigger-copy']}>
          <span className={styles['advanced__trigger-label']}>
            Advanced configuration
          </span>
          <span className={styles['advanced__trigger-hint']}>
            Tool limits, vision, reasoning, and other model-specific options
          </span>
        </span>
        <span
          className={[
            styles['advanced__chevron'],
            expanded ? styles['advanced__chevron--open'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden
        >
          <Icon size="16" glyph={<ChevronDownIcon />} />
        </span>
      </button>

      <div
        className={[
          styles['advanced__collapse'],
          expanded ? styles['advanced__collapse--expanded'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={!expanded}
      >
        <div className={styles['advanced__collapse-inner']} id={panelId}>
          <AdvancedRow label="Dynamic tool loading">
            <Checkbox
              size="Medium"
              checked={dynamicToolLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDynamicToolLoading(e.target.checked)
              }
            >
              Enable
            </Checkbox>
            <p className={styles['advanced__help']}>
              Expose search and load helper tools first, then load MCP tool
              schemas only when the agent needs them. Disable this to use the
              full MCP tool list for this agent.
            </p>
          </AdvancedRow>

          <AdvancedRow label="Max tool turns">
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
            <p className={styles['advanced__help']}>
              Maximum number of consecutive tool-call/execute rounds the agent
              will run before stopping. Lower this for smaller models that tend
              to loop on tool calls; raise it for agents that chain many tools
              per turn.
            </p>
          </AdvancedRow>

          <AdvancedRow label="Enable Vision">
            <Checkbox
              size="Medium"
              checked={enableVision}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEnableVision(e.target.checked)
              }
            >
              Enable
            </Checkbox>
            <p className={styles['advanced__help']}>
              Enable Vision to allow the bot to process images. Requires a
              compatible model.
            </p>
          </AdvancedRow>

          <AdvancedRow label="Enable Tools">
            <Checkbox
              size="Medium"
              checked={enableTools}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEnableTools(e.target.checked)
              }
            >
              Enable
            </Checkbox>
            <p className={styles['advanced__help']}>
              By default some tool use is enabled to allow for features such as
              integrations with JIRA. Disabling this allows use of models that
              do not support or are not very good at tool use. Some features
              will not work without tools.
            </p>
          </AdvancedRow>

          {showNativeTools ? (
            <AdvancedRow
              label={
                isAnthropic ? 'Anthropic native tools' : 'OpenAI native tools'
              }
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
              <p className={styles['advanced__help']}>
                Allow the model to use the provider’s built-in web search tool
                when answering.
              </p>
            </AdvancedRow>
          ) : null}

          {showReasoning ? (
            <AdvancedRow label={isAnthropic ? 'Extended Thinking' : 'Reasoning'}>
              <Checkbox
                size="Medium"
                checked={reasoningEnabled && !structuredOutput}
                disabled={isAnthropic && structuredOutput}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setReasoningEnabled(e.target.checked)
                }
              >
                Enable
              </Checkbox>
              {reasoningEnabled && !(isAnthropic && structuredOutput) ? (
                <div className={styles['advanced__nested']}>
                  {!isAnthropic ? (
                    <Select
                      className={styles['advanced__control']}
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
                  ) : (
                    <>
                      <TextInput
                        className={styles['advanced__control']}
                        type="number"
                        min={1024}
                        label="Thinking Budget (tokens)"
                        placeholder="1024"
                        value={thinkingBudget}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setThinkingBudget(e.target.value)
                        }
                      />
                      <p className={styles['advanced__help']}>
                        Token budget for extended thinking. Higher values allow
                        deeper reasoning but increase response time and cost.
                        Leave blank to use the default.
                      </p>
                    </>
                  )}
                </div>
              ) : null}
            </AdvancedRow>
          ) : null}

          {showStructuredOutput ? (
            <AdvancedRow label="Structured Output">
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
              <p className={styles['advanced__help']}>
                {isAnthropic
                  ? 'Enable structured JSON output for this agent. Requires a compatible Anthropic model (Claude 4.5/4.6+). Structured output and extended thinking cannot be used simultaneously.'
                  : 'Enable structured JSON output for this agent. When enabled and a JSON schema is provided in the request, the model will produce valid JSON matching the schema.'}
              </p>
              {isAnthropic && structuredOutput ? (
                <p className={styles['advanced__note']}>
                  Extended thinking is turned off while structured output is
                  enabled (Anthropic does not support both at once).
                </p>
              ) : null}
            </AdvancedRow>
          ) : null}
        </div>
      </div>
    </section>
  );
}
