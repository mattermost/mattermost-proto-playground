import { useState } from 'react';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import AdminFrame from './AdminFrame';
import GlobalAttributesScene from './GlobalAttributesScene';
import GlobalAttributesTableScene from './GlobalAttributesTableScene';
import GlobalAttributesVisibilityScene from './GlobalAttributesVisibilityScene';
import GlobalAttributesV2Scene from './GlobalAttributesV2Scene';
import UserAttributesScene from './UserAttributesScene';
import UserAttributesV2Scene from './UserAttributesV2Scene';
import PostAttributesScene from './PostAttributesScene';
import PostAttributesV2Scene from './PostAttributesV2Scene';
import ChannelAttributesScene from './ChannelAttributesScene';
import ChannelAttributesV2Scene from './ChannelAttributesV2Scene';
import TeamSettingsScene from './TeamSettingsScene';
import TeamAttributesV2Scene from './TeamAttributesV2Scene';
import ChannelSettingsScene from './ChannelSettingsScene';
import ComposerScene from './ComposerScene';
import AccessPanel from './AccessPanel';
import BindingPanel from './BindingPanel';
import AddAttributeModal from './AddAttributeModal';
import PromoteModal from './PromoteModal';
import type { Persona } from './BindingPanel';
import type { NewAttributeInput } from './AddAttributeModal';
import {
  systemConsoleGroups,
  teamSettingsGroups,
  channelSettingsGroups,
} from './sidebars';
import {
  INITIAL_ATTRIBUTES,
  INITIAL_RESOURCE_ATTRIBUTES,
  INITIAL_TEAM_ATTRIBUTES,
  defaultDisplayLocations,
  makeBinding,
} from './data';
import type { AttrDef, AttrValue, Binding, ResourceType } from './data';
import SceneSwitcher from './SceneSwitcher';
import {
  isSceneId,
  type SceneId,
} from './sceneConfig';
import styles from './AttributeSystem.module.scss';

type Drawer =
  | { kind: 'access'; defId: string }
  | { kind: 'binding'; defId: string; resource: ResourceType }
  | null;

function defaultBinding(resource: ResourceType): Binding {
  return makeBinding(resource);
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function readParam(name: string): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(name) ?? '';
}

function initialScene(): SceneId {
  const candidate = readParam('scene') || window?.location?.hash?.slice(1) || '';
  return isSceneId(candidate) ? candidate : 'globalTableVisibility';
}

function sceneResource(scene: SceneId): ResourceType | null {
  if (scene === 'user' || scene === 'userV2') return 'Users';
  if (scene === 'channel' || scene === 'channelHybrid' || scene === 'channelV2')
    return 'Channels';
  if (scene === 'post' || scene === 'postV2') return 'Posts';
  return null;
}

export default function AttributeSystem() {
  const scene0 = initialScene();
  const [scene, setScene] = useState<SceneId>(scene0);
  const [attrs, setAttrs] = useState<AttrDef[]>(() => [
    ...INITIAL_ATTRIBUTES.map((a) => ({ ...a })),
    ...INITIAL_RESOURCE_ATTRIBUTES.map((a) => ({ ...a })),
  ]);
  const [teamAttrs, setTeamAttrs] = useState<AttrDef[]>(() =>
    INITIAL_TEAM_ATTRIBUTES.map((a) => ({ ...a })),
  );
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [addFor, setAddFor] = useState<ResourceType | null>(() =>
    readParam('flow') === 'add' ? sceneResource(scene0) : null,
  );
  const [addStep, setAddStep] = useState<'choose' | 'existing' | 'create'>(
    'choose',
  );
  const [promoteId, setPromoteId] = useState<string | null>(() =>
    readParam('flow') === 'promote' ? 'clearance' : null,
  );
  const [dirty, setDirty] = useState(false);

  const globalDefs = attrs.filter((d) => d.scope === 'global');
  const allDefs = [...attrs, ...teamAttrs];
  const findDef = (id: string) => allDefs.find((d) => d.id === id) ?? null;

  const assignV2DisplaySeeds = Object.fromEntries(
    allDefs
      .filter((d) => d.appliesTo.includes('Channels'))
      .map((d) => [d.id, defaultDisplayLocations(d)]),
  );

  function patchDef(id: string, fn: (d: AttrDef) => AttrDef) {
    setAttrs((prev) => prev.map((d) => (d.id === id ? fn(d) : d)));
    setTeamAttrs((prev) => prev.map((d) => (d.id === id ? fn(d) : d)));
    setDirty(true);
  }

  const handleRename = (id: string, name: string) =>
    patchDef(id, (d) => ({ ...d, name }));

  const handlePatch = (id: string, patch: Partial<AttrDef>) =>
    patchDef(id, (d) => ({ ...d, ...patch }));

  const handleToggleResource = (
    id: string,
    resource: ResourceType,
    on: boolean,
  ) =>
    patchDef(id, (d) => {
      if (on) {
        const appliesTo = d.appliesTo.includes(resource)
          ? d.appliesTo
          : [...d.appliesTo, resource];
        const bindings = d.bindings.some((b) => b.resource === resource)
          ? d.bindings
          : [...d.bindings, defaultBinding(resource)];
        return { ...d, appliesTo, bindings };
      }
      return { ...d, appliesTo: d.appliesTo.filter((r) => r !== resource) };
    });

  const handleUpdateBinding = (
    id: string,
    resource: ResourceType,
    next: Binding,
  ) =>
    patchDef(id, (d) => {
      const has = d.bindings.some((b) => b.resource === resource);
      return {
        ...d,
        bindings: has
          ? d.bindings.map((b) => (b.resource === resource ? next : b))
          : [...d.bindings, next],
      };
    });

  const handlePatchBinding = (
    id: string,
    resource: ResourceType,
    patch: Partial<Binding>,
  ) =>
    patchDef(id, (d) => ({
      ...d,
      bindings: d.bindings.map((b) =>
        b.resource === resource ? { ...b, ...patch } : b,
      ),
    }));

  const handleDuplicate = (id: string) => {
    const src = attrs.find((d) => d.id === id);
    if (!src) return;
    const copy: AttrDef = {
      ...src,
      id: `${src.id}-copy-${Date.now()}`,
      name: `${src.name} (copy)`,
      protected: false,
      policyCount: 0,
      owner: null,
    };
    setAttrs((prev) => [...prev, copy]);
    setDirty(true);
  };

  const handleDelete = (id: string) => {
    setAttrs((prev) => prev.filter((d) => d.id !== id));
    setDirty(true);
  };

  const handleDeactivate = (id: string) => {
    patchDef(id, (d) => ({ ...d, deactivated: true }));
  };

  // Flow 1a — add an existing global attribute to the active resource type.
  const handleAddExisting = (defId: string) => {
    if (!addFor) return;
    handleToggleResource(defId, addFor, true);
    setAddFor(null);
  };

  // Flow 1b — create a brand-new resource-scoped attribute.
  const handleCreate = (input: NewAttributeInput) => {
    if (!addFor) return;
    const values: AttrValue[] = input.values.map((label, i) => ({
      id: `${slug(label) || 'value'}-${i}`,
      label,
      rank: input.type === 'Ranked' ? input.values.length - i : undefined,
    }));
    const def: AttrDef = {
      id: `${slug(input.name) || 'attribute'}-${Date.now()}`,
      name: input.name,
      type: input.type,
      scope: 'resource',
      values,
      owner: null,
      read: 'Public',
      write: { field: 'sysadmin', option: 'sysadmin', value: 'admin' },
      protected: false,
      appliesTo: [addFor],
      bindings: [
        makeBinding(addFor, { vocabulary: 'Closed', mutability: 'Locked' }),
      ],
      policyCount: 0,
    };
    setAttrs((prev) => [...prev, def]);
    setDirty(true);
    setAddFor(null);
  };

  // Flow 2 — promote a resource-scoped attribute to global.
  const handlePromote = (defId: string) => {
    patchDef(defId, (d) => ({
      ...d,
      scope: 'global',
      promotedFrom: d.promotedFrom ?? d.appliesTo[0],
    }));
    setPromoteId(null);
  };

  const resetAll = () => {
    setAttrs([
      ...INITIAL_ATTRIBUTES.map((a) => ({ ...a })),
      ...INITIAL_RESOURCE_ATTRIBUTES.map((a) => ({ ...a })),
    ]);
    setTeamAttrs(INITIAL_TEAM_ATTRIBUTES.map((a) => ({ ...a })));
    setDirty(false);
  };

  function renderOverlay(): React.ReactNode {
    if (drawer) {
      const def = findDef(drawer.defId);
      if (!def) return undefined;
      if (drawer.kind === 'access') {
        return (
          <AccessPanel
            def={def}
            readOnly={scene === 'team'}
            onChange={(next) => patchDef(def.id, () => next)}
            onClose={() => setDrawer(null)}
          />
        );
      }
      const persona: Persona = scene === 'team' ? 'teamadmin' : 'sysadmin';
      const binding =
        def.bindings.find((b) => b.resource === drawer.resource) ??
        defaultBinding(drawer.resource);
      const postB = def.bindings.find((b) => b.resource === 'Posts');
      return (
        <BindingPanel
          def={def}
          binding={binding}
          persona={persona}
          postBinding={postB}
          onPostBindingChange={(next) =>
            handleUpdateBinding(def.id, 'Posts', next)
          }
          onChange={(next) => handleUpdateBinding(def.id, drawer.resource, next)}
          onClose={() => setDrawer(null)}
        />
      );
    }
    if (addFor) {
      const stepParam = readParam('step');
      const urlStep =
        stepParam === 'existing' || stepParam === 'create'
          ? stepParam
          : null;
      return (
        <AddAttributeModal
          resource={addFor}
          defs={allDefs}
          initialStep={urlStep ?? addStep}
          onAddExisting={handleAddExisting}
          onCreate={handleCreate}
          onClose={() => {
            setAddFor(null);
            setAddStep('choose');
          }}
        />
      );
    }
    if (promoteId) {
      const def = findDef(promoteId);
      if (!def) return undefined;
      return (
        <PromoteModal
          def={def}
          onConfirm={handlePromote}
          onClose={() => setPromoteId(null)}
        />
      );
    }
    return undefined;
  }

  const overlay = renderOverlay();

  const footer = (
    <ConsoleFooter
      saveDisabled={!dirty}
      onSave={() => setDirty(false)}
      onCancel={resetAll}
    />
  );

  function handleSceneChange(id: SceneId) {
    setScene(id);
    setDrawer(null);
    setAddFor(null);
    setPromoteId(null);
  }

  const openBinding = (id: string, r: ResourceType) =>
    setDrawer({ kind: 'binding', defId: id, resource: r });
  const openAccess = (id: string) => setDrawer({ kind: 'access', defId: id });

  let sceneFrame: React.ReactNode;
  switch (scene) {
    case 'global':
      sceneFrame = (
        <AdminFrame
          consoleTitle="System Console"
          userHandle="@leonard.riley"
          groups={systemConsoleGroups('Global Attributes')}
          headerTitle="Global Attributes"
          footer={footer}
          overlay={overlay}
        >
          <GlobalAttributesScene
            defs={globalDefs}
            onRename={handleRename}
            onToggleResource={handleToggleResource}
            onConfigureBinding={openBinding}
            onConfigureAccess={openAccess}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        </AdminFrame>
      );
      break;
    case 'globalTable':
      sceneFrame = (
        <AdminFrame
          consoleTitle="System Console"
          userHandle="@leonard.riley"
          groups={systemConsoleGroups('Global Attributes')}
          headerTitle="Global Attributes"
          footer={footer}
          overlay={overlay}
        >
          <GlobalAttributesTableScene
            defs={globalDefs}
            onPatch={handlePatch}
            onToggleResource={handleToggleResource}
            onConfigureBinding={openBinding}
            onConfigureAccess={openAccess}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        </AdminFrame>
      );
      break;
    case 'globalTableVisibility':
      sceneFrame = (
        <AdminFrame
          consoleTitle="System Console"
          userHandle="@leonard.riley"
          groups={systemConsoleGroups('Global Attributes')}
          headerTitle="Global Attributes"
          footer={footer}
          overlay={overlay}
        >
          <GlobalAttributesVisibilityScene
            defs={globalDefs}
            onPatch={handlePatch}
            onToggleResource={handleToggleResource}
            onConfigureBinding={openBinding}
            onConfigureAccess={openAccess}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        </AdminFrame>
      );
      break;
    case 'globalV2':
      sceneFrame = (
        <AdminFrame
          consoleTitle="System Console"
          userHandle="@leonard.riley"
          groups={systemConsoleGroups('Global Attributes')}
          headerTitle="Global Attributes (v2)"
          footer={footer}
          overlay={overlay}
        >
          <GlobalAttributesV2Scene
            defs={globalDefs}
            onPatch={handlePatch}
            onToggleResource={handleToggleResource}
            onConfigureBinding={openBinding}
            onConfigureAccess={openAccess}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        </AdminFrame>
      );
      break;
    case 'userV2':
      sceneFrame = (
        <AdminFrame
          consoleTitle="System Console"
          userHandle="@leonard.riley"
          groups={systemConsoleGroups('User Attributes')}
          headerTitle="User Attributes (v2)"
          footer={footer}
          overlay={overlay}
        >
          <UserAttributesV2Scene
            defs={allDefs}
            allDefs={allDefs}
            onAddGlobal={() => {
              setAddStep('existing');
              setAddFor('Users');
            }}
            onCreateNew={() => {
              setAddStep('create');
              setAddFor('Users');
            }}
            onPromote={(id) => setPromoteId(id)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onDeactivate={handleDeactivate}
            onPatchValues={(id, values) => handlePatch(id, { values })}
            onPatchBinding={(id, resource, patch) =>
              handlePatchBinding(id, resource, patch)
            }
            onLinkExternalSource={() => {}}
          />
        </AdminFrame>
      );
      break;
    case 'channelV2':
      sceneFrame = (
        <AdminFrame
          consoleTitle="System Console"
          userHandle="@leonard.riley"
          groups={systemConsoleGroups('Channel Attributes')}
          headerTitle="Channel Attributes (v2)"
          footer={footer}
          overlay={overlay}
        >
          <ChannelAttributesV2Scene
            defs={allDefs}
            onPatchBinding={(id, resource, patch) =>
              handlePatchBinding(id, resource, patch)
            }
            onPatch={handlePatch}
            onPatchValues={(id, values) => handlePatch(id, { values })}
            onRename={handleRename}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onDeactivate={handleDeactivate}
            onAdd={(mode) => {
              setAddStep(mode);
              setAddFor('Channels');
            }}
          />
        </AdminFrame>
      );
      break;
    case 'postV2':
      sceneFrame = (
        <AdminFrame
          consoleTitle="System Console"
          userHandle="@leonard.riley"
          groups={systemConsoleGroups('Post Attributes')}
          headerTitle="Post Attributes (v2)"
          footer={footer}
          overlay={overlay}
        >
          <PostAttributesV2Scene
            defs={allDefs}
            onPatchBinding={handlePatchBinding}
            onPatch={handlePatch}
            onPatchValues={(id, values) => handlePatch(id, { values })}
            onRename={handleRename}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onDeactivate={handleDeactivate}
            onAdd={(mode) => {
              setAddStep(mode);
              setAddFor('Posts');
            }}
          />
        </AdminFrame>
      );
      break;
    case 'teamV2':
      sceneFrame = (
        <AdminFrame
          consoleTitle="Team Settings"
          userHandle="@maria.delossantos"
          groups={teamSettingsGroups('Team Attributes')}
          headerTitle="Team Attributes (v2)"
          enterpriseBadgeLabel="Team Admin"
          footer={footer}
          overlay={overlay}
        >
          <TeamAttributesV2Scene
            globalDefs={globalDefs}
            teamDefs={teamAttrs}
          />
        </AdminFrame>
      );
      break;
    case 'assignV2':
      sceneFrame = (
        <ChannelSettingsScene
          defs={allDefs}
          channelName="Operation Aurora"
          channelHeaderName="Operation Aurora"
          displayLocationSeeds={assignV2DisplaySeeds}
          onAddAttribute={() => setAddFor('Channels')}
        />
      );
      break;
    case 'user':
      sceneFrame = (
        <AdminFrame
          consoleTitle="System Console"
          userHandle="@leonard.riley"
          groups={systemConsoleGroups('User Attributes')}
          headerTitle="User Attributes"
          footer={footer}
          overlay={overlay}
        >
          <UserAttributesScene
            defs={allDefs}
            allDefs={allDefs}
            onAddGlobal={() => {
              setAddStep('existing');
              setAddFor('Users');
            }}
            onCreateNew={() => {
              setAddStep('create');
              setAddFor('Users');
            }}
            onPromote={(id) => setPromoteId(id)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onDeactivate={handleDeactivate}
            onPatchValues={(id, values) => handlePatch(id, { values })}
            onPatchBinding={(id, resource, patch) =>
              handlePatchBinding(id, resource, patch)
            }
            onLinkExternalSource={() => {
              // Stub: link-to-source modal not built yet (plan §6.2).
            }}
          />
        </AdminFrame>
      );
      break;
    case 'channel':
    case 'channelHybrid':
      sceneFrame = (
        <AdminFrame
          consoleTitle="System Console"
          userHandle="@leonard.riley"
          groups={systemConsoleGroups('Channel Attributes')}
          headerTitle="Channel Attributes"
          footer={footer}
          overlay={overlay}
        >
          <ChannelAttributesScene
            variant={scene === 'channelHybrid' ? 'hybrid' : 'inline'}
            defs={allDefs}
            onPatchBinding={(id, resource, patch) =>
              handlePatchBinding(id, resource, patch)
            }
            onPatch={handlePatch}
            onPatchValues={(id, values) => handlePatch(id, { values })}
            onRename={handleRename}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onDeactivate={handleDeactivate}
            onConfigureBinding={openBinding}
            onAdd={(mode) => {
              setAddStep(mode);
              setAddFor('Channels');
            }}
          />
        </AdminFrame>
      );
      break;
    case 'post':
      sceneFrame = (
        <AdminFrame
          consoleTitle="System Console"
          userHandle="@leonard.riley"
          groups={systemConsoleGroups('Post Attributes')}
          headerTitle="Post Attributes"
          footer={footer}
          overlay={overlay}
        >
          <PostAttributesScene
            defs={allDefs}
            onPatchBinding={handlePatchBinding}
            onPatch={handlePatch}
            onPatchValues={(id, values) => handlePatch(id, { values })}
            onRename={handleRename}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onDeactivate={handleDeactivate}
            onAdd={(mode) => {
              setAddStep(mode);
              setAddFor('Posts');
            }}
          />
        </AdminFrame>
      );
      break;
    case 'postCreate':
      sceneFrame = (
        <AdminFrame
          consoleTitle="# fires-watch"
          userHandle="@dan.coleman"
          groups={channelSettingsGroups('Attributes')}
          headerTitle="New message · Attribute rail"
          enterpriseBadge={false}
          overlay={overlay}
        >
          <ComposerScene defs={allDefs} variant="rail" />
        </AdminFrame>
      );
      break;
    case 'postCreateCompact':
      sceneFrame = (
        <AdminFrame
          consoleTitle="# fires-watch"
          userHandle="@dan.coleman"
          groups={channelSettingsGroups('Attributes')}
          headerTitle="New message · Attributes dropdown"
          enterpriseBadge={false}
          overlay={overlay}
        >
          <ComposerScene defs={allDefs} variant="compact" />
        </AdminFrame>
      );
      break;
    case 'team':
      sceneFrame = (
        <AdminFrame
          consoleTitle="Team Settings"
          userHandle="@maria.delossantos"
          groups={teamSettingsGroups('Team Attributes')}
          headerTitle="Team Attributes"
          enterpriseBadgeLabel="Team Admin"
          footer={footer}
          overlay={overlay}
        >
          <TeamSettingsScene
            globalDefs={globalDefs}
            teamDefs={teamAttrs}
            onConfigureBinding={openBinding}
          />
        </AdminFrame>
      );
      break;
    case 'assign':
      sceneFrame = (
        <ChannelSettingsScene
          defs={allDefs}
          channelName="Operation Aurora"
          channelHeaderName="Operation Aurora"
          onAddAttribute={() => setAddFor('Channels')}
        />
      );
      break;
    default: {
      const never: never = scene;
      sceneFrame = never;
    }
  }

  return (
    <div className={styles.page}>
      <SceneSwitcher scene={scene} onSceneChange={handleSceneChange} />
      {sceneFrame}
    </div>
  );
}
