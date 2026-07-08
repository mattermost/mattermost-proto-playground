import { useEffect, useMemo, useRef, useState } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import SyncPill from '@/pages/AttributeManagementHub/_components/SyncPill/SyncPill';
import GuardrailDialog, {
  type GuardrailContext,
  type GuardrailKind,
} from '@/pages/AttributeManagementHub/_components/GuardrailDialog/GuardrailDialog';
import {
  eligibility,
  isPolicyLocked,
  isSourceOwned,
  policyLabel,
  type AccessGrant,
  type AttrValue,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import SimplifiedDetailView from '@/pages/AttributeHubSimplified/_components/SimplifiedDetailView';
import CatalogListing from '@/pages/AttributeHubSimplified/_components/CatalogListing';
import DuplicateAttributeModal from '@/pages/AttributeHubSimplified/_components/DuplicateAttributeModal';
import {
  TEAM_APPLIES_TO_EMPTY,
  TEAM_ATTRIBUTES,
  TEAM_ATTRIBUTES_INTRO,
  TEAM_CATALOG_EMPTY,
  TEAM_CATALOG_SECTIONS,
  TEAM_CATALOG_TITLE,
  TEAM_RESOURCE_LABELS,
  TEAM_SCOPE_RESOURCES,
  blankTeamAttribute,
  defaultTeamResourceConfig,
  isTeamAttributeReadOnly,
  isSystemTeamAttribute,
} from './teamData';
import styles from './TeamAttributesWorkspace.module.scss';

type GuardrailState = { kind: GuardrailKind; context: GuardrailContext } | null;
type Editors = { roles: AccessGrant[]; users: AccessGrant[] };

const SYSTEM_SUBJECTS = ['UAS sync (system)', 'LDAP sync (system)', 'SCIM sync (system)'];

function editorsFor(a: HubAttribute): Editors {
  const roleMap = new Map<string, AccessGrant>();
  const userMap = new Map<string, AccessGrant>();
  for (const cap of [a.access.editDefinition, a.access.manageValues]) {
    for (const g of cap.roles) {
      if (SYSTEM_SUBJECTS.includes(g.subject)) continue;
      const prev = roleMap.get(g.subject);
      roleMap.set(g.subject, { subject: g.subject, owner: prev?.owner || g.owner });
    }
    for (const g of cap.users) {
      if (SYSTEM_SUBJECTS.includes(g.subject)) continue;
      const prev = userMap.get(g.subject);
      userMap.set(g.subject, { subject: g.subject, owner: prev?.owner || g.owner });
    }
  }
  return { roles: [...roleMap.values()], users: [...userMap.values()] };
}

function subtitle(a: HubAttribute): string {
  const parts = [
    a.type,
    `Applies to ${a.appliesTo.map((c) => c.resource).join(', ') || 'nothing yet'}`,
  ];
  if (a.usedByPolicies > 0) parts.push(policyLabel(a.usedByPolicies));
  const elig = eligibility(a);
  parts.push(elig.eligible ? 'Usable in policies' : 'Not usable in policies');
  return parts.join(' · ');
}

function readParams(): URLSearchParams {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

export interface TeamAttributesWorkspaceProps {
  onDirtyChange?: (dirty: boolean) => void;
}

export default function TeamAttributesWorkspace({
  onDirtyChange,
}: TeamAttributesWorkspaceProps) {
  const params = readParams();
  const initialAttrParam =
    params.get('flow') === 'new' ? null : params.get('attr');

  const [attributes, setAttributes] = useState<HubAttribute[]>(TEAM_ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string | null>(initialAttrParam);
  const [draft, setDraft] = useState<HubAttribute | null>(
    params.get('flow') === 'new' ? blankTeamAttribute() : null,
  );
  const [editorsById, setEditorsById] = useState<Record<string, Editors>>({});
  const [dirty, setDirty] = useState(false);

  const [selectedResources, setSelectedResources] = useState<ResourceKind[]>([]);
  const [source, setSource] = useState('All sources');
  const [query, setQuery] = useState('');
  const [guardrail, setGuardrail] = useState<GuardrailState>(null);
  const [duplicateForId, setDuplicateForId] = useState<string | null>(null);
  const [deleteForId, setDeleteForId] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const creating = draft !== null;

  useEffect(() => {
    if (creating) nameRef.current?.focus();
  }, [creating]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const markDirty = () => setDirty(true);

  const persisted = selectedId
    ? attributes.find((a) => a.id === selectedId) ?? null
    : null;
  const active = draft ?? persisted;

  const editors: Editors = active
    ? editorsById[active.id] ?? editorsFor(active)
    : { roles: [], users: [] };

  const filtered = useMemo(() => {
    return attributes.filter((a) => {
      if (selectedResources.length > 0) {
        if (!a.appliesTo.some((c) => selectedResources.includes(c.resource))) return false;
      }
      if (source !== 'All sources') {
        if (source === 'Managed here') {
          if (a.source.kind !== 'manual') return false;
        } else if (a.source.system !== source) {
          return false;
        }
      }
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!a.name.toLowerCase().includes(q) && !a.type.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [attributes, selectedResources, source, query]);

  const toggleResource = (r: ResourceKind) =>
    setSelectedResources((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  const mutate = (fn: (a: HubAttribute) => HubAttribute) => {
    markDirty();
    if (draft) {
      setDraft((d) => (d ? fn(d) : d));
    } else if (selectedId) {
      setAttributes((prev) => prev.map((a) => (a.id === selectedId ? fn(a) : a)));
    }
  };

  const setEditors = (next: Editors) => {
    if (!active) return;
    markDirty();
    setEditorsById((m) => ({ ...m, [active.id]: next }));
  };

  const openValuesLocked = () => {
    if (!active) return;
    setGuardrail({
      kind: 'values-locked',
      context: { attributeName: active.name, policies: active.policyNames },
    });
  };

  const addValue = (label: string, asTier?: boolean) => {
    if (!active) return;
    if (isPolicyLocked(active)) return openValuesLocked();
    const isTree = active.type === 'Ranked-hierarchical';
    const isRanked = active.type === 'Ranked' || isTree;
    const makeTier = isTree ? !!asTier : isRanked;
    const nextTier = makeTier
      ? active.values.filter((v) => v.tier != null).length + 1
      : undefined;
    const value: AttrValue = { id: `v-${Date.now()}`, label, tier: nextTier };
    mutate((a) => ({ ...a, values: [...a.values, value] }));
  };

  const addChild = (parentId: string, label: string) => {
    if (!active) return;
    if (isPolicyLocked(active)) return openValuesLocked();
    const child: AttrValue = { id: `v-${Date.now()}`, label };
    const insert = (vs: AttrValue[]): AttrValue[] =>
      vs.map((v) =>
        v.id === parentId
          ? { ...v, children: [...(v.children ?? []), child] }
          : { ...v, children: v.children ? insert(v.children) : undefined },
      );
    mutate((a) => ({ ...a, values: insert(a.values) }));
  };

  const toggleValueDisabled = (valueId: string) => {
    if (!active) return;
    if (isPolicyLocked(active)) return openValuesLocked();
    const flip = (vs: AttrValue[]): AttrValue[] =>
      vs.map((v) => ({
        ...v,
        disabled: v.id === valueId ? !v.disabled : v.disabled,
        children: v.children ? flip(v.children) : undefined,
      }));
    mutate((a) => ({ ...a, values: flip(a.values) }));
  };

  const deleteValue = (valueId: string) => {
    if (!active) return;
    if (isPolicyLocked(active)) return openValuesLocked();
    const find = (vs: AttrValue[]): AttrValue | undefined => {
      for (const v of vs) {
        if (v.id === valueId) return v;
        if (v.children) {
          const c = find(v.children);
          if (c) return c;
        }
      }
      return undefined;
    };
    const target = find(active.values);
    if (target && (target.inUseCount ?? 0) > 0) return;
    const prune = (vs: AttrValue[]): AttrValue[] =>
      vs
        .filter((v) => v.id !== valueId)
        .map((v) => ({ ...v, children: v.children ? prune(v.children) : undefined }));
    mutate((a) => ({ ...a, values: prune(a.values) }));
  };

  const reorderValue = (valueId: string, dir: -1 | 1) => {
    if (!active) return;
    if (isPolicyLocked(active)) return openValuesLocked();
    const swap = (vs: AttrValue[]): { list: AttrValue[]; moved: boolean } => {
      const idx = vs.findIndex((v) => v.id === valueId);
      if (idx >= 0) {
        const next = idx + dir;
        if (next < 0 || next >= vs.length) return { list: vs, moved: true };
        const list = [...vs];
        [list[idx], list[next]] = [list[next], list[idx]];
        return { list, moved: true };
      }
      let moved = false;
      const list = vs.map((v) => {
        if (moved || !v.children) return v;
        const res = swap(v.children);
        if (res.moved) {
          moved = true;
          return { ...v, children: res.list };
        }
        return v;
      });
      return { list, moved };
    };
    mutate((a) => {
      const { list } = swap(a.values);
      let tier = 1;
      const renum = list.map((v) => (v.tier != null ? { ...v, tier: tier++ } : v));
      return { ...a, values: renum };
    });
  };

  const openUnlink = () => {
    if (!active || !active.valuesLink) return;
    setGuardrail({
      kind: 'unlink-gated',
      context: {
        attributeName: active.name,
        linkedName: active.valuesLink.attributeName,
        policies: active.policyNames,
      },
    });
  };

  const bindingChange = (resource: ResourceKind, next: Partial<ResourceConfig>) => {
    mutate((a) => ({
      ...a,
      appliesTo: a.appliesTo.map((c) =>
        c.resource === resource ? { ...c, ...next } : c,
      ),
    }));
  };

  const readIntoFilteringChange = (value: boolean) => {
    mutate((a) => ({ ...a, readIntoFiltering: value }));
  };

  const addResource = (resource: ResourceKind) => {
    if (!TEAM_SCOPE_RESOURCES.includes(resource)) return;
    mutate((a) =>
      a.appliesTo.some((c) => c.resource === resource)
        ? a
        : { ...a, appliesTo: [...a.appliesTo, defaultTeamResourceConfig(resource)] },
    );
  };

  const removeResource = (resource: ResourceKind) => {
    if (draft) {
      mutate((a) => ({
        ...a,
        appliesTo: a.appliesTo.filter((c) => c.resource !== resource),
      }));
      return;
    }
    setGuardrail({
      kind: 'remove-binding',
      context: {
        attributeName: active?.name ?? '',
        resource,
        policies: active && isPolicyLocked(active) ? active.policyNames : [],
      },
    });
  };

  const confirmGuardrail = () => {
    if (guardrail?.kind === 'unlink-gated') {
      mutate((a) => ({ ...a, valuesLink: undefined }));
    }
    if (guardrail?.kind === 'remove-binding') {
      const resource = guardrail.context.resource as ResourceKind | undefined;
      if (resource) {
        mutate((a) => ({
          ...a,
          appliesTo: a.appliesTo.filter((c) => c.resource !== resource),
        }));
      }
    }
    if (guardrail?.kind === 'delete-confirm' && deleteForId) {
      markDirty();
      setAttributes((prev) => prev.filter((x) => x.id !== deleteForId));
      if (selectedId === deleteForId) setSelectedId(null);
      setDeleteForId(null);
    }
    setGuardrail(null);
  };

  const closeGuardrail = () => {
    if (guardrail?.kind === 'delete-confirm') {
      setDeleteForId(null);
    }
    setGuardrail(null);
  };

  const openDetail = (id: string) => {
    setDraft(null);
    setSelectedId(id);
  };

  const startCreate = () => {
    setSelectedId(null);
    setDraft(blankTeamAttribute());
    markDirty();
  };

  const backToList = () => {
    setDraft(null);
    setSelectedId(null);
  };

  const commitCreate = () => {
    if (!draft) return;
    const created: HubAttribute = { ...draft, name: draft.name.trim() };
    setAttributes((prev) => [...prev, created]);
    setDraft(null);
    setSelectedId(created.id);
  };

  const requestDelete = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    if (a.usedByPolicies > 0 || isSourceOwned(a)) {
      setGuardrail({
        kind: 'delete-blocked',
        context: { attributeName: a.name, policies: a.policyNames },
      });
      return;
    }
    setDeleteForId(id);
    setGuardrail({
      kind: 'delete-confirm',
      context: { attributeName: a.name },
    });
  };

  const reorderAttributes = (activeId: string, overId: string) => {
    markDirty();
    setAttributes((prev) => {
      const from = prev.findIndex((item) => item.id === activeId);
      const to = prev.findIndex((item) => item.id === overId);
      if (from < 0 || to < 0 || from === to) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const openDeactivate = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    setGuardrail({
      kind: 'deactivate-blocked',
      context: { attributeName: a.name, bindingCount: 6, policies: a.policyNames },
    });
  };

  const openDuplicate = (id: string) => setDuplicateForId(id);

  const commitDuplicate = (name: string) => {
    if (!duplicateForId) return;
    const source = attributes.find((a) => a.id === duplicateForId);
    if (!source) return;
    markDirty();
    const copy: HubAttribute = {
      ...structuredClone(source),
      id: `attr-${Date.now()}`,
      name,
      usedByPolicies: 0,
      policyNames: [],
    };
    setAttributes((prev) => [...prev, copy]);
    setDuplicateForId(null);
  };

  const duplicateSource = duplicateForId
    ? attributes.find((a) => a.id === duplicateForId) ?? null
    : null;

  const createEnabled = !!draft && draft.name.trim().length > 0 && !!draft.type;

  return (
    <div
      className={[
        styles['workspace'],
        active ? styles['workspace--detail'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {active ? (
        <>
          <div className={styles['workspace__detail-header']}>
            <div className={styles['workspace__detail-leading']}>
              <IconButton
                aria-label="Back to attribute list"
                icon={<Icon glyph={<ArrowLeftIcon />} size="20" />}
                onClick={backToList}
              />
              <div className={styles['workspace__detail-titles']}>
                <h3 className={styles['workspace__detail-title']}>
                  {creating ? 'New attribute' : active.name || 'Untitled attribute'}
                </h3>
                <p className={styles['workspace__detail-sub']}>
                  {creating
                    ? draft && (draft.values.length > 0 || draft.appliesTo.length > 0)
                      ? subtitle(draft)
                      : 'Add values and choose where this attribute applies.'
                    : subtitle(active)}
                </p>
              </div>
            </div>
            <div className={styles['workspace__detail-trailing']}>
              {creating ? (
                <div className={styles['workspace__create-actions']}>
                  <Button emphasis="Tertiary" size="Small" onClick={backToList}>
                    Cancel
                  </Button>
                  <Button
                    emphasis="Primary"
                    size="Small"
                    disabled={!createEnabled}
                    onClick={commitCreate}
                  >
                    Create attribute
                  </Button>
                </div>
              ) : (
                isSourceOwned(active) &&
                active.source.state && (
                  <SyncPill
                    state={active.source.state}
                    system={active.source.system}
                    size="Small"
                  />
                )
              )}
            </div>
          </div>

          <SimplifiedDetailView
            attribute={active}
            creating={creating}
            onDefinitionChange={(next) => mutate((a) => ({ ...a, ...next }))}
            onAddValue={addValue}
            onAddChild={addChild}
            onToggleValueDisabled={toggleValueDisabled}
            onDeleteValue={deleteValue}
            onReorderValue={reorderValue}
            onValuesLockedAttempt={openValuesLocked}
            onReuse={() => {}}
            onUnlink={openUnlink}
            onBindingChange={bindingChange}
            onReadIntoFilteringChange={readIntoFilteringChange}
            onAddResource={addResource}
            onRemoveResource={removeResource}
            editors={editors}
            onEditorsChange={setEditors}
            onConnectSource={() => {}}
            onManageSource={() => {}}
            nameRef={(el) => {
              nameRef.current = el;
            }}
            allowedResources={TEAM_SCOPE_RESOURCES}
            resourceLabels={TEAM_RESOURCE_LABELS}
            appliesToEmptyDescription={TEAM_APPLIES_TO_EMPTY}
            readOnly={!creating && isTeamAttributeReadOnly(active)}
            hideSourceUi
          />
        </>
      ) : (
        <>
          <div className={styles['workspace__list-header']}>
            <h3 className={styles['workspace__list-title']}>{TEAM_CATALOG_TITLE}</h3>
            <p className={styles['workspace__list-sub']}>{TEAM_ATTRIBUTES_INTRO}</p>
          </div>
          <CatalogListing
            attributes={attributes}
            filtered={filtered}
            selectedResources={selectedResources}
            onToggleResource={toggleResource}
            onClearResources={() => setSelectedResources([])}
            source={source}
            onSourceChange={setSource}
            query={query}
            onQueryChange={setQuery}
            onNewAttribute={startCreate}
            onOpenDetail={openDetail}
            onReorderAttributes={reorderAttributes}
            onDeactivate={openDeactivate}
            onDelete={requestDelete}
            allowedResources={TEAM_SCOPE_RESOURCES}
            emptyDescription={TEAM_CATALOG_EMPTY}
            showSourceFilter={false}
            showSourceColumn={false}
            showUsageColumn={false}
            policyLockedNoNavigate
            isScopeLocked={isSystemTeamAttribute}
            catalogSections={TEAM_CATALOG_SECTIONS}
            resourceSettingsMenu={{
              isAttributeReadOnly: isTeamAttributeReadOnly,
              onEdit: openDetail,
              onDuplicate: openDuplicate,
              onDelete: requestDelete,
            }}
          />
        </>
      )}

      <GuardrailDialog
        kind={guardrail?.kind ?? null}
        context={guardrail?.context ?? { attributeName: '' }}
        onClose={closeGuardrail}
        onConfirm={confirmGuardrail}
      />

      {duplicateSource && (
        <DuplicateAttributeModal
          sourceName={duplicateSource.name}
          onClose={() => setDuplicateForId(null)}
          onDuplicate={commitDuplicate}
        />
      )}
    </div>
  );
}
