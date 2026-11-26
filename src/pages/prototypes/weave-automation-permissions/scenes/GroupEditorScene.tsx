import { useMemo, useState } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import { AdminPanel } from '@mattermost/compass-ui/components/admin-panel';
import { Button } from '@mattermost/compass-ui/components/button';
import { Combobox } from '@mattermost/compass-ui/components/combobox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Radio } from '@mattermost/compass-ui/components/radio';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import AttributeRuleEditor from '../components/AttributeRuleEditor';
import SettingsPage from '../components/SettingsPage';
import StepPicker from '../components/StepPicker';
import {
  PEOPLE,
  USER_GROUPS,
  peopleInGroup,
  type PermissionGroup,
  type Person,
  type StepCategory,
  type WhoMode,
} from '../weaveAutomationPermissionsData';
import styles from '../WeaveAutomationPermissions.module.scss';

interface GroupEditorSceneProps {
  group: PermissionGroup;
  isNew: boolean;
  catalog: StepCategory[];
  sharedSteps: Set<string>;
  onSave: (group: PermissionGroup) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onEditShared: () => void;
  onSeeWho: (title: string, people: Person[]) => void;
}

const MEMBER_OPTIONS = [
  ...USER_GROUPS.map((g) => ({
    value: g.id,
    label: g.name,
    secondaryLabel: `User group · ${g.memberIds.length} people`,
    leadingVisual: <Icon glyph={<AccountMultipleOutlineIcon />} />,
  })),
  ...PEOPLE.map((p) =>
    p.avatar
      ? {
          value: p.id,
          label: p.name,
          secondaryLabel: `@${p.username}`,
          leadingAvatar: { src: p.avatar, alt: '' },
        }
      : { value: p.id, label: p.name, secondaryLabel: `@${p.username}` },
  ),
];

export default function GroupEditorScene({
  group,
  isNew,
  catalog,
  sharedSteps,
  onSave,
  onCancel,
  onDelete,
  onEditShared,
  onSeeWho,
}: GroupEditorSceneProps) {
  const [draft, setDraft] = useState<PermissionGroup>(group);
  const matches = peopleInGroup(draft);
  const dirty = JSON.stringify(draft) !== JSON.stringify(group);

  // Only offer steps that aren't already shared with everyone.
  const extraCatalog = useMemo(
    () =>
      catalog
        .map((c) => ({
          ...c,
          steps: c.steps.filter((s) => !sharedSteps.has(s.id)),
        }))
        .filter((c) => c.steps.length > 0),
    [catalog, sharedSteps],
  );

  function setMode(mode: WhoMode) {
    setDraft((d) => ({ ...d, mode }));
  }

  const title = draft.name.trim() || (isNew ? 'New group' : 'Untitled group');

  return (
    <SettingsPage
      title={title}
      onBack={onCancel}
      backLabel="Back to Permissions"
      headerActions={
        isNew ? undefined : (
          <Button
            emphasis="tertiary"
            size="small"
            destructive
            onClick={() => onDelete(group.id)}
          >
            Delete group
          </Button>
        )
      }
      saveBar={{
        visible: dirty || isNew,
        saveDisabled: draft.name.trim() === '',
        onSave: () => onSave({ ...draft, name: draft.name.trim() }),
        onDiscard: () => (isNew ? onCancel() : setDraft(group)),
      }}
    >
      <AdminPanel>
        <TextInput
          label="Name"
          required
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        />
      </AdminPanel>

      <AdminPanel
        title="Who's in this group"
        subtitle="They can create team automations and edit their own, in any team they belong to. Guests and deactivated accounts are never included."
      >
        <div className={styles['weave-permissions__stack']}>
          <div
            className={styles['weave-permissions__radio-row']}
            role="radiogroup"
            aria-label="How to choose people"
          >
            <Radio
              name="who-mode"
              checked={draft.mode === 'members'}
              onChange={() => setMode('members')}
            >
              Specific users or groups
            </Radio>
            <Radio
              name="who-mode"
              checked={draft.mode === 'attributes'}
              onChange={() => setMode('attributes')}
            >
              Attribute-based policy
            </Radio>
          </div>

          {draft.mode === 'members' ? (
            <>
              <Combobox
                multiple
                label="Users or groups"
                placeholder="Search users and groups"
                options={MEMBER_OPTIONS}
                value={draft.members}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    members: (v as string[]) ?? [],
                  }))
                }
              />
              <div className={styles['weave-permissions__count-row']}>
                <span aria-live="polite">
                  {matches.length} {matches.length === 1 ? 'person' : 'people'}
                </span>
                <Button
                  emphasis="link"
                  size="small"
                  onClick={() => onSeeWho(title, matches)}
                  disabled={matches.length === 0}
                >
                  See who
                </Button>
              </div>
            </>
          ) : (
            <AttributeRuleEditor
              conditions={draft.conditions}
              match={draft.match}
              onChange={(conditions) => setDraft((d) => ({ ...d, conditions }))}
              onMatchChange={(match) => setDraft((d) => ({ ...d, match }))}
              onTest={() => onSeeWho(title, matches)}
            />
          )}
        </div>
      </AdminPanel>

      <AdminPanel
        title="Extra steps"
        subtitle={
          <>
            On top of the shared steps everyone gets from All automation
            editors.{' '}
            <Button emphasis="link" size="small" onClick={onEditShared}>
              Edit shared steps
            </Button>
          </>
        }
      >
        {extraCatalog.length > 0 ? (
          <StepPicker
            label="Extra steps by category"
            catalog={extraCatalog}
            selected={new Set(draft.extraSteps)}
            onChange={(next) =>
              setDraft((d) => ({ ...d, extraSteps: [...next] }))
            }
          />
        ) : (
          <p className={styles['weave-permissions__intro']}>
            Every step is already shared with everyone.
          </p>
        )}
      </AdminPanel>
    </SettingsPage>
  );
}
