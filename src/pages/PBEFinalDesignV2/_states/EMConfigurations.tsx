import { useState } from 'react';
import EMModalShell, { type EMTab } from '../_components/EMModalShell';
import ConfigurationsTab from './ConfigurationsTab';

export interface EMConfigurationsProps {
  /** Called when the EM modal is dismissed. */
  onClose: () => void;
  /** Called when the user clicks "Add Configuration". */
  onAddConfig: () => void;
  /** Called when the user clicks "Edit" on the configuration card. */
  onEditConfig: () => void;
  /** Called when the user clicks "Test" on the configuration card. */
  onTestConfig: () => void;
  /** Called when the user switches to the My Channels tab. */
  onNavigateChannels: () => void;
}

/**
 * State 2 — EM modal open on the Configurations tab. Renders chrome
 * via `EMModalShell`. Local-only state for the active tab so a tab
 * switch routes through the parent state machine.
 */
export default function EMConfigurations({
  onClose,
  onAddConfig,
  onEditConfig,
  onTestConfig,
  onNavigateChannels,
}: EMConfigurationsProps) {
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
        onAddConfig={onAddConfig}
        onEditConfig={onEditConfig}
        onTestConfig={onTestConfig}
      />
    </EMModalShell>
  );
}
