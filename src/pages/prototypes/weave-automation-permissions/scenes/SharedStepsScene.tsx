import { useState } from 'react';
import { AdminPanel } from '@mattermost/compass-ui/components/admin-panel';
import { Tag } from '@mattermost/compass-ui/components/tag';
import SettingsPage from '../components/SettingsPage';
import StepPicker from '../components/StepPicker';
import {
  type Step,
  type StepCategory,
} from '../weaveAutomationPermissionsData';

interface SharedStepsSceneProps {
  catalog: StepCategory[];
  sharedSteps: Set<string>;
  pendingNewSteps: Step[];
  onSave: (next: Set<string>) => void;
  onCancel: () => void;
  initialExpanded?: string[];
}

/** Editor for the "Steps for all editors" preset: who is fixed, only the steps change. */
export default function SharedStepsScene({
  catalog,
  sharedSteps,
  pendingNewSteps,
  onSave,
  onCancel,
  initialExpanded,
}: SharedStepsSceneProps) {
  const [draft, setDraft] = useState(() => new Set(sharedSteps));
  const dirty =
    draft.size !== sharedSteps.size ||
    [...draft].some((id) => !sharedSteps.has(id));

  return (
    <SettingsPage
      title={
        <>
          Steps for all editors
          <Tag label="Preset" size="small" />
        </>
      }
      subtitle="Triggers and actions that all editors can use"
      onBack={onCancel}
      backLabel="Back to Permissions"
      saveBar={{
        visible: dirty || pendingNewSteps.length > 0,
        message:
          !dirty && pendingNewSteps.length > 0
            ? 'Save to mark the new steps as reviewed'
            : undefined,
        onSave: () => onSave(draft),
        onDiscard: () => setDraft(new Set(sharedSteps)),
      }}
    >
      <AdminPanel
        title="Shared steps"
        subtitle="Everyone who can create automations can use these. New steps from Weave upgrades show up here first."
      >
        <StepPicker
          focusId="shared-step-picker"
          initialExpanded={initialExpanded}
          label="Shared steps by category"
          catalog={catalog}
          selected={draft}
          onChange={setDraft}
          highlight={pendingNewSteps.map((s) => s.id)}
        />
      </AdminPanel>
    </SettingsPage>
  );
}
