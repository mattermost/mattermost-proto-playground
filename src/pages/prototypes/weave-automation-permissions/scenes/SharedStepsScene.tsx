import { useState } from 'react';
import { AdminConsoleFooter } from '@mattermost/compass-ui/components/admin-console-footer';
import { AdminConsoleHeader } from '@mattermost/compass-ui/components/admin-console-header';
import { AdminPanel } from '@mattermost/compass-ui/components/admin-panel';
import { Button } from '@mattermost/compass-ui/components/button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tag } from '@mattermost/compass-ui/components/tag';
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
    <div className={styles['weave-permissions__page']}>
      <AdminConsoleHeader
        showBack
        ariaLabelBack="Back to Permissions"
        onBackClick={onCancel}
        title={
          <span className={styles['weave-permissions__title-row']}>
            All automation editors
            <Tag label="Preset" size="small" />
          </span>
        }
      />
      <Scrollbar className={styles['weave-permissions__scroll']}>
        <div className={styles['weave-permissions__body']}>
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
        </div>
      </Scrollbar>
      <AdminConsoleFooter
        saveDisabled={!dirty && pendingNewSteps.length === 0}
        onSave={() => onSave(draft)}
        onCancel={onCancel}
      />
    </div>
  );
}
