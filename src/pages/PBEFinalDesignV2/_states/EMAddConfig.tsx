import { useState } from 'react';
import EMModalShell, { type EMTab } from '../_components/EMModalShell';
import ConfigurationsTab from './ConfigurationsTab';
import ConfigFormModal from './ConfigFormModal';

export interface EMAddConfigProps {
  /** Called when the user dismisses everything and closes the EM modal. */
  onClose: () => void;
  /** Called when the user cancels or saves — returns to the Configurations state. */
  onDismissForm: () => void;
}

/**
 * State 4 — Add Configuration sub-modal stacked above the
 * Configurations tab.
 *
 * The sub-modal is passed through `EMModalShell`'s `subModal` slot,
 * which renders it inside `StackedModalLayer` above the base EM modal.
 * The Configurations tab beneath is rendered with no-op action
 * handlers so it can't trigger duplicate state transitions while the
 * sub-modal is open.
 */
export default function EMAddConfig({
  onClose,
  onDismissForm,
}: EMAddConfigProps) {
  const [tab] = useState<EMTab>('configurations');

  return (
    <EMModalShell
      activeTab={tab}
      onTabChange={() => undefined}
      onClose={onClose}
      subModal={
        <ConfigFormModal
          title="Add Configuration"
          isAdd
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
