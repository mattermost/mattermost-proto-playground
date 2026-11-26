import PlusIcon from '@mattermost/compass-icons/components/plus';
import { AdminPanel } from '@mattermost/compass-ui/components/admin-panel';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SectionNotice } from '@mattermost/compass-ui/components/section-notice';
import { Tag } from '@mattermost/compass-ui/components/tag';
import {
  describeSteps,
  describeWho,
  peopleInAnyGroup,
  peopleInGroup,
  type PermissionGroup,
  type Step,
  type StepCategory,
} from '../weaveAutomationPermissionsData';
import styles from '../WeaveAutomationPermissions.module.scss';

interface PermissionsSceneProps {
  groups: PermissionGroup[];
  sharedSteps: Set<string>;
  catalog: StepCategory[];
  pendingNewSteps: Step[];
  onAddNewStepsToEveryone: () => void;
  onReviewNewSteps: () => void;
  onEditShared: () => void;
  onEditGroup: (id: string) => void;
  onAddGroup: () => void;
  onSeeWho: (title: string, groupId?: string) => void;
}

export default function PermissionsScene({
  groups,
  sharedSteps,
  catalog,
  pendingNewSteps,
  onAddNewStepsToEveryone,
  onReviewNewSteps,
  onEditShared,
  onEditGroup,
  onAddGroup,
  onSeeWho,
}: PermissionsSceneProps) {
  const everyone = peopleInAnyGroup(groups);
  // Pending new steps aren't decided yet, so leave them out of the summaries.
  const pendingIds = new Set(pendingNewSteps.map((s) => s.id));
  const summaryCatalog = catalog.map((c) => ({
    ...c,
    steps: c.steps.filter((s) => !pendingIds.has(s.id)),
  }));

  return (
    <div className={styles['weave-permissions__page']}>
      <Scrollbar className={styles['weave-permissions__scroll']}>
        <div className={styles['weave-permissions__body']}>
          <div className={styles['weave-permissions__pagehead']}>
            <h1 className={styles['weave-permissions__page-title']}>
              Permissions
            </h1>
            <p className={styles['weave-permissions__intro']}>
              People in these groups can create team automations and edit their
              own, in any team they belong to. Everyone gets the shared steps,
              plus any extra steps from their groups. System admins always have
              full access.
            </p>
          </div>

          {pendingNewSteps.length > 0 && (
            <SectionNotice
              type="warning"
              title={`${pendingNewSteps.length} new steps aren't available to anyone yet`}
              description={`${pendingNewSteps.map((s) => s.label).join(', ')}. Add them to the shared steps, or give them to specific groups.`}
              primaryButtonLabel="Add to everyone"
              onPrimaryAction={onAddNewStepsToEveryone}
              secondaryButtonLabel="Review"
              onSecondaryAction={onReviewNewSteps}
            />
          )}

          <AdminPanel
            title={
              <span className={styles['weave-permissions__title-row']}>
                All automation editors
                <Tag label="Preset" />
              </span>
            }
            subtitle={`Everyone in the groups below · ${everyone.length} people`}
            headerActions={
              <div className={styles['weave-permissions__panel-actions']}>
                <Button
                  emphasis="tertiary"
                  size="small"
                  onClick={() => onSeeWho('All automation editors')}
                >
                  See who
                </Button>
                <Button emphasis="tertiary" size="small" onClick={onEditShared}>
                  Edit shared steps
                </Button>
              </div>
            }
          >
            <dl className={styles['weave-permissions__summary']}>
              <dt>Shared steps</dt>
              <dd>{describeSteps([...sharedSteps], summaryCatalog, 'all')}</dd>
            </dl>
          </AdminPanel>

          <div className={styles['weave-permissions__section-heading']}>
            <h2 className={styles['weave-permissions__section-title']}>
              Groups
            </h2>
            <span className={styles['weave-permissions__muted']}>
              Who can create, and any extra steps they get
            </span>
          </div>

          {groups.map((g) => {
            const count = peopleInGroup(g).length;
            return (
              <AdminPanel
                key={g.id}
                title={g.name}
                subtitle={`${count} ${count === 1 ? 'person' : 'people'}`}
                headerActions={
                  <div className={styles['weave-permissions__panel-actions']}>
                    <Button
                      emphasis="tertiary"
                      size="small"
                      onClick={() => onSeeWho(g.name, g.id)}
                    >
                      See who
                    </Button>
                    <Button
                      emphasis="tertiary"
                      size="small"
                      onClick={() => onEditGroup(g.id)}
                    >
                      Edit
                    </Button>
                  </div>
                }
              >
                <dl className={styles['weave-permissions__summary']}>
                  <dt>Who</dt>
                  <dd>{describeWho(g)}</dd>
                  <dt>Extra steps</dt>
                  <dd>
                    {describeSteps(
                      g.extraSteps.filter((id) => !sharedSteps.has(id)),
                      summaryCatalog,
                      'extra',
                    )}
                  </dd>
                </dl>
              </AdminPanel>
            );
          })}

          <Button
            className={styles['weave-permissions__add']}
            emphasis="tertiary"
            leadingIcon={<Icon glyph={<PlusIcon />} />}
            onClick={onAddGroup}
          >
            Add group
          </Button>
        </div>
      </Scrollbar>
    </div>
  );
}
