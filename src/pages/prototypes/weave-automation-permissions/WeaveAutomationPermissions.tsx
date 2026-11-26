import { useEffect, useMemo, useState } from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import PeopleModal from './components/PeopleModal';
import WeaveShell from './components/WeaveShell';
import GroupEditorScene from './scenes/GroupEditorScene';
import PermissionsScene from './scenes/PermissionsScene';
import SharedStepsScene from './scenes/SharedStepsScene';
import {
  INITIAL_GROUPS,
  INITIAL_SHARED_STEPS,
  NEW_STEPS,
  catalogWithNewSteps,
  peopleInAnyGroup,
  peopleInGroup,
  type PermissionGroup,
  type Person,
} from './weaveAutomationPermissionsData';
import { SCENES, type SceneId } from './weaveAutomationPermissionsScenes';

type View =
  | { kind: 'permissions' }
  | { kind: 'shared' }
  | { kind: 'group'; group: PermissionGroup; isNew: boolean };

function sceneForView(view: View): SceneId {
  if (view.kind === 'group') {
    return view.group.mode === 'members' ? 'group-members' : 'group-attributes';
  }
  return view.kind;
}

let newGroupCount = 0;

export default function WeaveAutomationPermissions() {
  const { setCenterSlot } = usePrototypeChrome();
  const catalog = useMemo(() => catalogWithNewSteps(), []);

  const [groups, setGroups] = useState<PermissionGroup[]>(INITIAL_GROUPS);
  const [sharedSteps, setSharedSteps] = useState(
    () => new Set(INITIAL_SHARED_STEPS),
  );
  const [newStepsSeen, setNewStepsSeen] = useState(false);
  const [view, setView] = useState<View>({ kind: 'permissions' });
  // Version bump remounts an editor so its draft resets when reopened.
  const [editorKey, setEditorKey] = useState(0);

  const [peopleModal, setPeopleModal] = useState<{
    title: string;
    people: Person[];
  } | null>(null);
  const [peopleOpen, setPeopleOpen] = useState(false);

  const pendingNewSteps = newStepsSeen ? [] : NEW_STEPS.map((n) => n.step);
  const activeScene = sceneForView(view);

  function openGroup(group: PermissionGroup, isNew = false) {
    setEditorKey((k) => k + 1);
    setView({ kind: 'group', group, isNew });
  }

  function goToScene(id: SceneId) {
    if (id === 'permissions') setView({ kind: 'permissions' });
    else if (id === 'shared') {
      setEditorKey((k) => k + 1);
      setView({ kind: 'shared' });
    } else {
      const mode = id === 'group-members' ? 'members' : 'attributes';
      const preferred = mode === 'members' ? 'platform-team' : 'engineering-ai';
      const fallback =
        groups.find((g) => g.id === preferred) ??
        groups.find((g) => g.mode === mode) ??
        groups[0];
      openGroup({ ...fallback, mode });
    }
  }

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={activeScene}
        onChange={(id) => goToScene(id as SceneId)}
        ariaLabel="Prototype screens"
      />,
    );
    return () => setCenterSlot(null);
    // goToScene reads current groups; re-register when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScene, groups, setCenterSlot]);

  function showPeople(title: string, people: Person[]) {
    setPeopleModal({ title, people });
    setPeopleOpen(true);
  }

  let content;
  if (view.kind === 'shared') {
    content = (
      <SharedStepsScene
        key={editorKey}
        groups={groups}
        catalog={catalog}
        sharedSteps={sharedSteps}
        pendingNewSteps={pendingNewSteps}
        onSave={(next) => {
          setSharedSteps(next);
          // Saving records every offered step as seen, granted or not (spec: new steps banner).
          setNewStepsSeen(true);
          setView({ kind: 'permissions' });
        }}
        onCancel={() => setView({ kind: 'permissions' })}
        onSeeWho={() =>
          showPeople('All automation editors', peopleInAnyGroup(groups))
        }
      />
    );
  } else if (view.kind === 'group') {
    content = (
      <GroupEditorScene
        key={editorKey}
        group={view.group}
        isNew={view.isNew}
        catalog={catalog}
        sharedSteps={sharedSteps}
        onSave={(saved) => {
          setGroups((gs) =>
            gs.some((g) => g.id === saved.id)
              ? gs.map((g) => (g.id === saved.id ? saved : g))
              : [...gs, saved],
          );
          setView({ kind: 'permissions' });
        }}
        onCancel={() => setView({ kind: 'permissions' })}
        onDelete={(id) => {
          setGroups((gs) => gs.filter((g) => g.id !== id));
          setView({ kind: 'permissions' });
        }}
        onEditShared={() => goToScene('shared')}
        onSeeWho={showPeople}
      />
    );
  } else {
    content = (
      <PermissionsScene
        groups={groups}
        sharedSteps={sharedSteps}
        catalog={catalog}
        pendingNewSteps={pendingNewSteps}
        onAddNewStepsToEveryone={() => {
          setSharedSteps(
            (prev) => new Set([...prev, ...NEW_STEPS.map((n) => n.step.id)]),
          );
          setNewStepsSeen(true);
        }}
        onReviewNewSteps={() => goToScene('shared')}
        onEditShared={() => goToScene('shared')}
        onEditGroup={(id) => {
          const g = groups.find((x) => x.id === id);
          if (g) openGroup(g);
        }}
        onAddGroup={() =>
          openGroup(
            {
              id: `new-${++newGroupCount}`,
              name: '',
              mode: 'members',
              conditions: [],
              match: 'all',
              members: [],
              extraSteps: [],
            },
            true,
          )
        }
        onSeeWho={(title, groupId) => {
          const g = groups.find((x) => x.id === groupId);
          showPeople(title, g ? peopleInGroup(g) : peopleInAnyGroup(groups));
        }}
      />
    );
  }

  return (
    <>
      <WeaveShell>{content}</WeaveShell>
      {peopleModal && (
        <PeopleModal
          open={peopleOpen}
          title={peopleModal.title}
          people={peopleModal.people}
          onClose={() => setPeopleOpen(false)}
          onExited={() => setPeopleModal(null)}
        />
      )}
    </>
  );
}
