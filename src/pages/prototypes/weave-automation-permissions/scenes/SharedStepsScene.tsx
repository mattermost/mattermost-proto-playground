import { useState } from 'react';
import { AdminPanel } from '@mattermost/compass-ui/components/admin-panel';
import { Button } from '@mattermost/compass-ui/components/button';
import { Tag } from '@mattermost/compass-ui/components/tag';
import SettingsPage from '../components/SettingsPage';
import StepPicker from '../components/StepPicker';
import {
  peopleInAnyGroup,
  type PermissionGroup,
  type Step,
  type StepCategory,
} from '../weaveAutomationPermissionsData';
import styles from '../WeaveAutomationPermissions.module.scss';

interface SharedStepsSceneProps {
  groups: PermissionGroup[];
  catalog: StepCategory[];
  sharedSteps: Set<string>;
  pendingNewSteps: Step[];
  onSave: (next: Set<string>) => void;
  onCancel: () => void;
  onSeeWho: () => void;
}

/** Editor for the "All automation editors" preset: who is fixed, only the steps change. */
export default function SharedStepsScene({
  groups,
  catalog,
  sharedSteps,
  pendingNewSteps,
  onSave,
  onCancel,
  onSeeWho,
}: SharedStepsSceneProps) {
  const [draft, setDraft] = useState(() => new Set(sharedSteps));
  const everyone = peopleInAnyGroup(groups);
  const dirty =
    draft.size !== sharedSteps.size ||
    [...draft].some((id) => !sharedSteps.has(id));

  return (
    <SettingsPage
      title={
        <>
          All automation editors
          <Tag label="Preset" size="small" />
        </>
      }
      subtitle="Steps everyone who can create automations can use."
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
        title="Who's included"
        subtitle="Everyone in any group on the Permissions page. Change who by editing the groups."
        headerActions={
          <Button emphasis="tertiary" size="small" onClick={onSeeWho}>
            See who
          </Button>
        }
      >
        <p className={styles['weave-permissions__intro']}>
          {everyone.length} people across all teams
        </p>
      </AdminPanel>

      <AdminPanel
        title="Shared steps"
        subtitle="Everyone who can create automations can use these. New steps from Weave upgrades show up here first."
      >
        <StepPicker
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
