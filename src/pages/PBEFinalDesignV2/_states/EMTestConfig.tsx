import { useState } from 'react';
import EMModalShell, { type EMTab } from '../_components/EMModalShell';
import ConfigurationsTab from './ConfigurationsTab';

export interface EMTestConfigProps {
  /** Called when the EM modal is dismissed. */
  onClose: () => void;
  /** Called when the user clicks "Add Configuration". */
  onAddConfig: () => void;
  /** Called when the user clicks "Edit" on the configuration card. */
  onEditConfig: () => void;
  /** Called when the user clicks "Test" again (typically re-runs). */
  onTestConfig: () => void;
  /** Called when the user switches to the My Channels tab. */
  onNavigateChannels: () => void;
}

/**
 * State 6 — Configurations tab with an inline test-success panel
 * rendered inside the configuration card (`showTestResult`). Source
 * code is canonical for this state's visual.
 */
export default function EMTestConfig({
  onClose,
  onAddConfig,
  onEditConfig,
  onTestConfig,
  onNavigateChannels,
}: EMTestConfigProps) {
  const [tab, setTab] = useState<EMTab>('configurations');

  return (
    <EMModalShell
      activeTab={tab}
      onTabChange={(next) => {
        setTab(next);
        if (next === 'channels') onNavigateChannels();
      }}
      onClose={onClose}
    >
      <ConfigurationsTab
        showTestResult
        onAddConfig={onAddConfig}
        onEditConfig={onEditConfig}
        onTestConfig={onTestConfig}
      />
    </EMModalShell>
  );
}
