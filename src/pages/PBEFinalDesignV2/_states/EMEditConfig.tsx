import { useState } from 'react';
import EMModalShell, { type EMTab } from '../_components/EMModalShell';
import ConfigurationsTab from './ConfigurationsTab';
import ConfigFormModal from './ConfigFormModal';
import { singleConfig } from '../shared/fixtures';

export interface EMEditConfigProps {
  /** Called when the user dismisses everything and closes the EM modal. */
  onClose: () => void;
  /** Called when the user cancels or saves — returns to the Configurations state. */
  onDismissForm: () => void;
}

/**
 * State 5 — Edit Configuration sub-modal stacked above the
 * Configurations tab. Pre-fills from `singleConfig` fixture.
 */
export default function EMEditConfig({
  onClose,
  onDismissForm,
}: EMEditConfigProps) {
  const [tab] = useState<EMTab>('configurations');

  return (
    <EMModalShell
      activeTab={tab}
      onTabChange={() => undefined}
      onClose={onClose}
      subModal={
        <ConfigFormModal
          title="Edit Configuration"
          defaults={{
            name: singleConfig.name,
            tokenLabel: singleConfig.tokenLabel,
            pin: singleConfig.pin,
            kekLabel: singleConfig.kekLabel,
            lease: String(singleConfig.leaseDuration),
          }}
          onCancel={onDismissForm}
          onSave={onDismissForm}
        />
      }
    >
      <ConfigurationsTab
        onAddConfig={() => undefined}
        onEditConfig={() => undefined}
        onTestConfig={() => undefined}
      />
    </EMModalShell>
  );
}
