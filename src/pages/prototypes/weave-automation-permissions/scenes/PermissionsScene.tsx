import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { WithTooltip } from '@mattermost/compass-proto';
import { AdminPanel } from '@mattermost/compass-ui/components/admin-panel';
import { Button } from '@mattermost/compass-ui/components/button';
import { EmptyState } from '@mattermost/compass-ui/components/empty-state';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { SectionNotice } from '@mattermost/compass-ui/components/section-notice';
import { Tag } from '@mattermost/compass-ui/components/tag';
import {
  peopleInGroup,
  type PermissionGroup,
  type Step,
  type StepCategory,
} from '../weaveAutomationPermissionsData';
import MenuCell from '../components/MenuCell';
import SettingsPage from '../components/SettingsPage';
import styles from '../WeaveAutomationPermissions.module.scss';

const MAX_EXTRA_STEPS_SHOWN = 4;

interface PermissionsSceneProps {
  groups: PermissionGroup[];
  sharedSteps: Set<string>;
  catalog: StepCategory[];
  pendingNewSteps: Step[];
  newStepsNoticeDismissed: boolean;
  onDismissNewStepsNotice: () => void;
  onAddNewStepsToEveryone: () => void;
  onReviewNewSteps: () => void;
  onEditShared: () => void;
  onEditGroup: (id: string) => void;
  onAddGroup: () => void;
  onSeeWho: (title: string, groupId?: string) => void;
  onDeleteGroup: (id: string) => void;
}

export default function PermissionsScene({
  groups,
  sharedSteps,
  catalog,
  pendingNewSteps,
  newStepsNoticeDismissed,
  onDismissNewStepsNotice,
  onAddNewStepsToEveryone,
  onReviewNewSteps,
  onEditShared,
  onEditGroup,
  onAddGroup,
  onSeeWho,
  onDeleteGroup,
}: PermissionsSceneProps) {
  // Pending new steps aren't decided yet, so leave them out of the summaries.
  const pendingIds = new Set(pendingNewSteps.map((s) => s.id));
  const summaryCatalog = catalog.map((c) => ({
    ...c,
    steps: c.steps.filter((s) => !pendingIds.has(s.id)),
  }));
  const labelById = new Map(
    summaryCatalog.flatMap((c) => c.steps.map((st) => [st.id, st.label])),
  );
  // Name up to four extra steps, then count the rest.
  const extraStepsSummary = (ids: string[]) => {
    const labels = ids.map((id) => labelById.get(id) ?? id);
    if (labels.length === 0) return 'No extra steps';
    const shown = labels.slice(0, MAX_EXTRA_STEPS_SHOWN).join(', ');
    const more = labels.length - MAX_EXTRA_STEPS_SHOWN;
    return more > 0 ? `${shown} and ${more} more` : shown;
  };

  return (
    <SettingsPage
      title="Automation Permissions"
      subtitle="Choose who can create team automations and which steps they can use."
    >
      {pendingNewSteps.length > 0 && !newStepsNoticeDismissed && (
        <div data-wt-focus="new-steps-notice">
          <SectionNotice
            type="warning"
            title={`${pendingNewSteps.length} new steps aren't available to anyone yet`}
            description={`${pendingNewSteps.map((s) => s.label).join(', ')}. Add them to the shared steps, or give them to specific groups.`}
            primaryButtonLabel="Add to everyone"
            onPrimaryAction={onAddNewStepsToEveryone}
            secondaryButtonLabel="Review"
            onSecondaryAction={onReviewNewSteps}
            onDismiss={onDismissNewStepsNotice}
          />
        </div>
      )}

      <AdminPanel
        title={
          <span className={styles['weave-permissions__title-row']}>
            Steps for all editors
            <Tag label="Preset" />
          </span>
        }
        subtitle="Triggers and actions that all editors can use"
        data-wt-focus="shared-steps-panel"
        className={styles['weave-permissions__panel-link']}
        // The whole panel opens the editor. The button below stays the keyboard
        // path: its click bubbles up here, so it has no handler of its own.
        onClick={onEditShared}
        headerActions={
          <div className={styles['weave-permissions__panel-actions']}>
            <Button
              emphasis="tertiary"
              size="small"
              leadingIcon={<Icon glyph={<PencilOutlineIcon />} />}
            >
              Edit shared steps
            </Button>
          </div>
        }
      />

      <AdminPanel
        data-wt-focus="groups-panel"
        title="Automation editor groups"
        subtitle="Who can create, and any extra steps they get"
        headerActions={
          groups.length > 0 ? (
            <Button
              emphasis="primary"
              size="small"
              leadingIcon={<Icon glyph={<PlusIcon />} />}
              onClick={onAddGroup}
            >
              Add group
            </Button>
          ) : undefined
        }
      >
        {groups.length === 0 ? (
          <EmptyState
            title="No groups yet"
            description="Add a group to choose who can create automations and which extra steps they get."
            action={{
              children: 'Add group',
              emphasis: 'primary',
              leadingIcon: <Icon glyph={<PlusIcon />} />,
              onClick: onAddGroup,
            }}
          />
        ) : (
          <ul className={styles['weave-permissions__groups']}>
            {groups.map((g) => {
              const count = peopleInGroup(g).length;
              return (
                // The whole row opens the group. The pencil stays the keyboard
                // path: its click bubbles up here, so it has no handler of its own.
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                <li
                  key={g.id}
                  className={styles['weave-permissions__group']}
                  onClick={(e) => {
                    // Skip the actions menu: its items are portaled out of the row,
                    // but React still bubbles their clicks here.
                    if (!e.currentTarget.contains(e.target as Node)) return;
                    if ((e.target as HTMLElement).closest('[aria-haspopup]'))
                      return;
                    onEditGroup(g.id);
                  }}
                >
                  <div className={styles['weave-permissions__group-text']}>
                    <span className={styles['weave-permissions__group-name']}>
                      {g.name}
                    </span>
                    <span className={styles['weave-permissions__group-desc']}>
                      {`${count} ${count === 1 ? 'person' : 'people'} · ${extraStepsSummary(g.extraSteps.filter((id) => !sharedSteps.has(id)))}`}
                    </span>
                  </div>
                  <div className={styles['weave-permissions__panel-actions']}>
                    <WithTooltip label="Edit group">
                      <IconButton
                        size="small"
                        icon={<Icon glyph={<PencilOutlineIcon />} />}
                        aria-label={`Edit ${g.name}`}
                      />
                    </WithTooltip>
                    <MenuCell
                      inline
                      actions
                      align="end"
                      ariaLabel={`More actions for ${g.name}`}
                      groups={[
                        { options: [{ value: 'view', label: 'View users' }] },
                        {
                          options: [
                            {
                              value: 'delete',
                              label: 'Delete group',
                              destructive: true,
                            },
                          ],
                        },
                      ]}
                      selected={[]}
                      onSelect={(value) =>
                        value === 'view'
                          ? onSeeWho(g.name, g.id)
                          : onDeleteGroup(g.id)
                      }
                      renderTrigger={({ open, toggle }) => (
                        <IconButton
                          size="small"
                          icon={<Icon glyph={<DotsHorizontalIcon />} />}
                          aria-label={`More actions for ${g.name}`}
                          aria-haspopup="menu"
                          aria-expanded={open}
                          onClick={toggle}
                        />
                      )}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminPanel>
    </SettingsPage>
  );
}
