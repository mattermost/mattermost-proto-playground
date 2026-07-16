import { SectionNotice } from '@mattermost/compass-ui';
import McpServersToolsList from './McpServersToolsList';
import { SettingsDisclosureCard } from './settings';

export interface AutomationToolScopeProps {
  /** Display name of the executor agent, e.g. "Matty". */
  agentName?: string | null;
  /** Agent's own tools — shown as context for the override. */
  agentToolSummary?: string | null;
  className?: string;
}

/**
 * Option 2b — override the executor agent’s MCP tools for this automation.
 */
export default function AutomationToolScope({
  agentName,
  agentToolSummary,
  className = '',
}: AutomationToolScopeProps) {
  return (
    <SettingsDisclosureCard
      className={className}
      title="Tools"
      hint="You can override the agent’s toolset"
      formSection
    >
      {agentToolSummary ? (
        <SectionNotice
          type="Info"
          title={`${agentName ?? 'This agent'} already has: ${agentToolSummary}.`}
          description="Enable or disable tools below to override that set for this automation only."
        />
      ) : null}

      <McpServersToolsList idPrefix="automation-tools" />
    </SettingsDisclosureCard>
  );
}
