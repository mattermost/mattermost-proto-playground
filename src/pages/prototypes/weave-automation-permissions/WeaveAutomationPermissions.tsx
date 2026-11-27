import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { useRegisterWalkthrough, useWalkthrough } from '@/walkthrough';
import type { WalkthroughSceneState } from '@/walkthrough';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import PageStack from './components/PageStack';
import PeopleModal from './components/PeopleModal';
import PrototypeSettings from './components/PrototypeSettings';
import WeaveShell from './components/WeaveShell';
import GroupEditorScene from './scenes/GroupEditorScene';
import PermissionsScene from './scenes/PermissionsScene';
import SharedStepsScene from './scenes/SharedStepsScene';
import {
  INITIAL_GROUPS,
  INITIAL_SHARED_STEPS,
  NEW_STEPS,
  STEP_CATEGORIES,
  catalogWithNewSteps,
  peopleInAnyGroup,
  peopleInGroup,
  type PermissionGroup,
  type Person,
} from './weaveAutomationPermissionsData';
import { SCENES, type SceneId } from './weaveAutomationPermissionsScenes';
import styles from './WeaveAutomationPermissions.module.scss';
import { weaveAutomationPermissionsWalkthrough } from './weaveAutomationPermissionsWalkthrough';

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
  const { active: walkthroughActive } = useWalkthrough();
  // Prototype setting (off by default): whether a Weave upgrade has added steps
  // nobody has been given yet. The walkthrough turns it on for its steps.
  const [newStepsAvailable, setNewStepsAvailable] = useState(false);
  const catalog = useMemo(
    () => (newStepsAvailable ? catalogWithNewSteps() : STEP_CATEGORIES),
    [newStepsAvailable],
  );

  const [groups, setGroups] = useState<PermissionGroup[]>(INITIAL_GROUPS);
  const [sharedSteps, setSharedSteps] = useState(
    () => new Set(INITIAL_SHARED_STEPS),
  );
  const [newStepsSeen, setNewStepsSeen] = useState(false);
  // Dismissing only hides the banner; the steps stay unassigned and flagged new.
  const [newStepsNoticeDismissed, setNewStepsNoticeDismissed] = useState(false);
  const [view, setView] = useState<View>({ kind: 'permissions' });
  // Version bump remounts an editor so its draft resets when reopened.
  const [editorKey, setEditorKey] = useState(0);

  const [peopleModal, setPeopleModal] = useState<{
    title: string;
    people: Person[];
  } | null>(null);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PermissionGroup | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Step categories a walkthrough step asks the picker to open.
  const [walkthroughExpand, setWalkthroughExpand] = useState<string[]>([]);

  const pendingNewSteps =
    newStepsAvailable && !newStepsSeen ? NEW_STEPS.map((n) => n.step) : [];
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
    if (walkthroughActive) {
      setCenterSlot(null);
      return () => setCenterSlot(null);
    }
    setCenterSlot(
      <div className={styles['weave-permissions__chrome']}>
        <SceneSwitcher
          scenes={SCENES}
          activeId={activeScene}
          onChange={(id) => goToScene(id as SceneId)}
          ariaLabel="Prototype screens"
        />
        <PrototypeSettings
          newStepsAvailable={newStepsAvailable}
          onNewStepsAvailableChange={(on) => {
            setNewStepsAvailable(on);
            // Turning it on again starts fresh: banner shown, steps flagged new.
            if (on) {
              setNewStepsSeen(false);
              setNewStepsNoticeDismissed(false);
            }
          }}
        />
      </div>,
    );
    return () => setCenterSlot(null);
    // goToScene reads current groups; re-register when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeScene,
    groups,
    newStepsAvailable,
    setCenterSlot,
    walkthroughActive,
  ]);

  // Walkthrough steps drive the scene and a few state snapshots. The handler is
  // read through a ref so its identity stays stable for registration.
  const walkthroughScene = useRef<
    (scene: string, state?: WalkthroughSceneState) => void
  >(() => {});
  walkthroughScene.current = (scene, state) => {
    const expand = Array.isArray(state?.expand)
      ? (state.expand as string[])
      : [];
    setWalkthroughExpand(expand);
    if (state?.resetNewSteps === true) {
      setNewStepsAvailable(true);
      setNewStepsSeen(false);
      setNewStepsNoticeDismissed(false);
    }
    goToScene(scene as SceneId);
  };
  const onWalkthroughScene = useCallback(
    (scene: string, state?: WalkthroughSceneState) =>
      walkthroughScene.current(scene, state),
    [],
  );
  useRegisterWalkthrough(weaveAutomationPermissionsWalkthrough, {
    onScene: onWalkthroughScene,
  });

  function requestDelete(id: string) {
    const g = groups.find((x) => x.id === id);
    if (!g) return;
    setDeleteTarget(g);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (deleteTarget) {
      setGroups((gs) => gs.filter((g) => g.id !== deleteTarget.id));
      setView({ kind: 'permissions' });
    }
    setDeleteOpen(false);
  }

  function showPeople(title: string, people: Person[]) {
    setPeopleModal({ title, people });
    setPeopleOpen(true);
  }

  let child: ReactNode = null;
  if (view.kind === 'shared') {
    child = (
      <SharedStepsScene
        key={editorKey}
        catalog={catalog}
        sharedSteps={sharedSteps}
        pendingNewSteps={pendingNewSteps}
        initialExpanded={walkthroughExpand}
        onSave={(next) => {
          setSharedSteps(next);
          // Saving records every offered step as seen, granted or not (spec: new steps banner).
          setNewStepsSeen(true);
          setView({ kind: 'permissions' });
        }}
        onCancel={() => setView({ kind: 'permissions' })}
      />
    );
  } else if (view.kind === 'group') {
    child = (
      <GroupEditorScene
        key={editorKey}
        group={view.group}
        isNew={view.isNew}
        initialExpanded={walkthroughExpand}
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
        onDelete={requestDelete}
        onEditShared={() => goToScene('shared')}
        onSeeWho={showPeople}
      />
    );
  }

  const base = (
    <PermissionsScene
      groups={groups}
      sharedSteps={sharedSteps}
      catalog={catalog}
      pendingNewSteps={pendingNewSteps}
      newStepsNoticeDismissed={newStepsNoticeDismissed}
      onDismissNewStepsNotice={() => setNewStepsNoticeDismissed(true)}
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
      onSeeWho={(title, groupId) => {
        const g = groups.find((x) => x.id === groupId);
        showPeople(title, g ? peopleInGroup(g) : peopleInAnyGroup(groups));
      }}
      onDeleteGroup={requestDelete}
      onAddGroup={() =>
        openGroup(
          {
            id: `new-${++newGroupCount}`,
            name: 'Untitled group',
            mode: 'members',
            conditions: [],
            match: 'all',
            members: [],
            extraSteps: [],
          },
          true,
        )
      }
    />
  );

  return (
    <>
      <WeaveShell
        overlays={
          <>
            {deleteTarget && (
              <ConfirmDeleteModal
                open={deleteOpen}
                groupName={deleteTarget.name}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={confirmDelete}
                onExited={() => setDeleteTarget(null)}
              />
            )}
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
        }
      >
        <PageStack base={base} child={child} />
      </WeaveShell>
    </>
  );
}
