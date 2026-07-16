import AgentAdvancedConfig from './AgentAdvancedConfig';
import { SettingsDisclosureCard } from './settings';
import styles from './AdvancedAgentConfig.module.scss';

export interface AdvancedAgentConfigProps {
  /** Selected System Console AI service — drives provider-specific advanced options. */
  aiServiceId: string;
  className?: string;
  enableTools?: boolean;
  onEnableToolsChange?: (enabled: boolean) => void;
}

/**
 * Option 3b — provider / model knobs collapsed behind Advanced.
 * Tools and Access live as peer form tabs.
 */
export default function AdvancedAgentConfig({
  aiServiceId,
  className = '',
  enableTools,
  onEnableToolsChange,
}: AdvancedAgentConfigProps) {
  return (
    <SettingsDisclosureCard
      className={className}
      title="Advanced"
      hint="Vision, reasoning, and other model options"
      formSection
      bodyClassName={styles['advanced__body']}
    >
      <AgentAdvancedConfig
        aiServiceId={aiServiceId}
        embedded
        enableTools={enableTools}
        onEnableToolsChange={onEnableToolsChange}
      />
    </SettingsDisclosureCard>
  );
}
