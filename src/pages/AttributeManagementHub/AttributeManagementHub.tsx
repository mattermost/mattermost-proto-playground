import { useMemo, useState } from 'react';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import CatalogFilters from './_components/CatalogFilters/CatalogFilters';
import CatalogTable from './_components/CatalogTable/CatalogTable';
import DetailView from './_components/DetailView/DetailView';
import SyncPill from './_components/SyncPill/SyncPill';
import CreateWizard, {
  type WizardDraft,
} from './_components/CreateWizard/CreateWizard';
import ReuseValuesPicker from './_components/ReuseValuesPicker/ReuseValuesPicker';
import BulkStubSheet from './_components/BulkStubSheet/BulkStubSheet';
import GuardrailDialog, {
  type GuardrailContext,
  type GuardrailKind,
} from './_components/GuardrailDialog/GuardrailDialog';
import { HUB_ACTIVE_ITEM, HUB_SIDEBAR_CATEGORIES } from './hubSidebar';
import {
  HUB_ATTRIBUTES,
  appliedChannelCount,
  defaultAccessModel,
  defaultResourceConfig,
  isPolicyLocked,
  isSourceOwned,
  newAttributeId,
  policyLabel,
  valueCount,
  type AccessModel,
  type AttrValue,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from './hubData';
import styles from './AttributeManagementHub.module.scss';

type GuardrailState = { kind: GuardrailKind; context: GuardrailContext } | null;

function attributeSubtitle(attribute: HubAttribute): string {
  const parts = [
    attribute.type,
    `Applies to ${attribute.appliesTo.map((c) => c.resource).join(', ')}`,
  ];
  if (attribute.usedByPolicies > 0) {
    parts.push(policyLabel(attribute.usedByPolicies));
  }
  return parts.join(' · ');
}

function readParams(): URLSearchParams {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

export default function AttributeManagementHub() {
  const params = readParams();

  const [attributes, setAttributes] = useState<HubAttribute[]>(HUB_ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string | null>(
    params.get('attr'),
  );
  const [selectedResources, setSelectedResources] = useState<ResourceKind[]>(
    [],
  );
  const [source, setSource] = useState('All sources');
  const [query, setQuery] = useState('');
  const [wizardOpen, setWizardOpen] = useState(params.get('flow') === 'new');
  const [reuseForId, setReuseForId] = useState<string | null>(
    params.get('flow') === 'reuse' ? params.get('attr') : null,
  );
  const [bulkForId, setBulkForId] = useState<string | null>(
    params.get('sheet') === 'bulk' ? params.get('attr') : null,
  );
  const [guardrail, setGuardrail] = useState<GuardrailState>(
    initialGuardrail(params, HUB_ATTRIBUTES),
  );

  const selected = selectedId
    ? attributes.find((a) => a.id === selectedId) ?? null
    : null;
  const bulkAttr = bulkForId
    ? attributes.find((a) => a.id === bulkForId) ?? null
    : null;
  const reuseAttr = reuseForId
    ? attributes.find((a) => a.id === reuseForId) ?? null
    : null;

  const filtered = useMemo(() => {
    return attributes.filter((a) => {
      if (selectedResources.length > 0) {
        const has = a.appliesTo.some((c) =>
          selectedResources.includes(c.resource),
        );
        if (!has) return false;
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
        if (
          !a.name.toLowerCase().includes(q) &&
          !a.type.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [attributes, selectedResources, source, query]);

  const patch = (id: string, fn: (a: HubAttribute) => HubAttribute) =>
    setAttributes((prev) => prev.map((a) => (a.id === id ? fn(a) : a)));

  const toggleResource = (r: ResourceKind) =>
    setSelectedResources((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  // ── Guardrail openers ───────────────────────────────────────────────────
  const openDeactivate = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    const bindings = a.appliesTo
      .filter((c) => c.resource === 'Channels')
      .reduce((n) => n + 24, 0);
    setGuardrail({
      kind: 'deactivate-blocked',
      context: {
        attributeName: a.name,
        bindingCount: bindings || 6,
        policies: a.policyNames,
      },
    });
  };

  const openDelete = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    if (a.usedByPolicies > 0 || isSourceOwned(a)) {
      setGuardrail({
        kind: 'delete-blocked',
        context: {
          attributeName: a.name,
          policies: a.policyNames,
        },
      });
      return;
    }
    setAttributes((prev) => prev.filter((x) => x.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const openValuesLocked = () => {
    if (!selected) return;
    if (isSourceOwned(selected) && selected.source.pastBudget) {
      setGuardrail({
        kind: 'source-stale',
        context: {
          attributeName: selected.name,
          sourceSystem: selected.source.system,
        },
      });
      return;
    }
    setGuardrail({
      kind: 'values-locked',
      context: { attributeName: selected.name, policies: selected.policyNames },
    });
  };

  const openUnlinkGate = () => {
    if (!selected || !selected.valuesLink) return;
    const linked = attributes.find(
      (a) => a.id === selected.valuesLink!.attributeId,
    );
    const policies = Array.from(
      new Set([...selected.policyNames, ...(linked?.policyNames ?? [])]),
    );
    setGuardrail({
      kind: 'unlink-gated',
      context: {
        attributeName: selected.name,
        linkedName: selected.valuesLink.attributeName,
        policies,
      },
    });
  };

  const openRemoveResource = (resource: ResourceKind) => {
    if (!selected) return;
    setGuardrail({
      kind: 'remove-binding',
      context: {
        attributeName: selected.name,
        resource,
        bindingCount:
          resource === 'Channels' ? appliedChannelCount(selected.id) : undefined,
        policyCount: selected.usedByPolicies,
        policies: selected.policyNames,
      },
    });
  };

  const confirmGuardrail = () => {
    if (guardrail?.kind === 'unlink-gated' && selected) {
      patch(selected.id, (a) => ({ ...a, valuesLink: undefined }));
    }
    if (guardrail?.kind === 'remove-binding' && selected) {
      const resource = guardrail.context.resource as ResourceKind | undefined;
      if (resource) {
        patch(selected.id, (a) => ({
          ...a,
          appliesTo: a.appliesTo.filter((c) => c.resource !== resource),
        }));
      }
    }
    setGuardrail(null);
  };

  // ── Value editing ───────────────────────────────────────────────────────
  const addValue = (label: string, asTier?: boolean) => {
    if (!selected) return;
    if (isPolicyLocked(selected)) {
      openValuesLocked();
      return;
    }
    const isTree = selected.type === 'Ranked-hierarchical';
    const isRanked = selected.type === 'Ranked' || isTree;
    // In a tree, `asTier` decides tier vs display-only marking; a flat ranked
    // attribute always adds the next tier.
    const makeTier = isTree ? !!asTier : isRanked;
    const nextTier = makeTier
      ? selected.values.filter((v) => v.tier != null).length + 1
      : undefined;
    const value: AttrValue = {
      id: `v-${Date.now()}`,
      label,
      tier: nextTier,
    };
    patch(selected.id, (a) => ({ ...a, values: [...a.values, value] }));
  };

  // Add a nested (display-only) marking under a parent value at any depth.
  const addChild = (parentId: string, label: string) => {
    if (!selected) return;
    if (isPolicyLocked(selected)) {
      openValuesLocked();
      return;
    }
    const child: AttrValue = { id: `v-${Date.now()}`, label };
    const insert = (vs: AttrValue[]): AttrValue[] =>
      vs.map((v) =>
        v.id === parentId
          ? { ...v, children: [...(v.children ?? []), child] }
          : { ...v, children: v.children ? insert(v.children) : undefined },
      );
    patch(selected.id, (a) => ({ ...a, values: insert(a.values) }));
  };

  const toggleValueDisabled = (valueId: string) => {
    if (!selected) return;
    if (isPolicyLocked(selected)) {
      openValuesLocked();
      return;
    }
    const flip = (vs: AttrValue[]): AttrValue[] =>
      vs.map((v) => ({
        ...v,
        disabled: v.id === valueId ? !v.disabled : v.disabled,
        children: v.children ? flip(v.children) : undefined,
      }));
    patch(selected.id, (a) => ({ ...a, values: flip(a.values) }));
  };

  const deleteValue = (valueId: string) => {
    if (!selected) return;
    if (isPolicyLocked(selected)) {
      openValuesLocked();
      return;
    }
    // Delete blocked when the value is in use — surfaced via the row tooltip.
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
    const target = find(selected.values);
    if (target && (target.inUseCount ?? 0) > 0) {
      return; // blocked — disable instead
    }
    const prune = (vs: AttrValue[]): AttrValue[] =>
      vs
        .filter((v) => v.id !== valueId)
        .map((v) => ({ ...v, children: v.children ? prune(v.children) : undefined }));
    patch(selected.id, (a) => ({ ...a, values: prune(a.values) }));
  };

  const reorderValue = (valueId: string, dir: -1 | 1) => {
    if (!selected) return;
    if (isPolicyLocked(selected)) {
      openValuesLocked();
      return;
    }
    // Swap the value with its neighbour among whatever sibling list it lives in.
    const swapInList = (vs: AttrValue[]): { list: AttrValue[]; moved: boolean } => {
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
        const res = swapInList(v.children);
        if (res.moved) {
          moved = true;
          return { ...v, children: res.list };
        }
        return v;
      });
      return { list, moved };
    };
    patch(selected.id, (a) => {
      const { list } = swapInList(a.values);
      // Re-number top-level tier rows so ranks stay contiguous.
      let tier = 1;
      const renum = list.map((v) =>
        v.tier != null ? { ...v, tier: tier++ } : v,
      );
      return { ...a, values: renum };
    });
  };

  const handleReuse = (sourceId: string) => {
    const target = selected ?? reuseAttr;
    if (!target) return;
    const src = attributes.find((a) => a.id === sourceId);
    if (!src) return;
    patch(target.id, (a) => ({
      ...a,
      valuesLink: { attributeId: src.id, attributeName: src.name },
      values: src.values.map((v) => ({ ...v })),
      type: src.type,
    }));
    setReuseForId(null);
    setSelectedId(target.id);
  };

  const handleBindingChange = (
    resource: ResourceKind,
    next: Partial<ResourceConfig>,
  ) => {
    if (!selected) return;
    patch(selected.id, (a) => ({
      ...a,
      appliesTo: a.appliesTo.map((c) =>
        c.resource === resource ? { ...c, ...next } : c,
      ),
    }));
  };

  const handleAddResource = (resource: ResourceKind) => {
    if (!selected) return;
    patch(selected.id, (a) => ({
      ...a,
      appliesTo: [...a.appliesTo, defaultResourceConfig(resource)],
    }));
  };

  const handleAccessChange = (next: AccessModel) => {
    if (!selected) return;
    patch(selected.id, (a) => ({ ...a, access: next }));
  };

  const handleReadIntoFilteringChange = (value: boolean) => {
    if (!selected) return;
    patch(selected.id, (a) => ({ ...a, readIntoFiltering: value }));
  };

  const handleDefinitionChange = (
    next: Partial<Pick<HubAttribute, 'name' | 'type' | 'description'>>,
  ) => {
    if (!selected) return;
    patch(selected.id, (a) => ({ ...a, ...next }));
  };

  const handleCreate = (draft: WizardDraft) => {
    const reuse = draft.reuseFromId
      ? attributes.find((a) => a.id === draft.reuseFromId)
      : null;
    const values: AttrValue[] = reuse
      ? reuse.values.map((v) => ({ ...v }))
      : draft.values.map((label, i) => ({
          id: `v-${Date.now()}-${i}`,
          label,
          tier:
            draft.type === 'Ranked' || draft.type === 'Ranked-hierarchical'
              ? i + 1
              : undefined,
        }));
    const created: HubAttribute = {
      id: newAttributeId(),
      name: draft.name,
      type: draft.type,
      description: draft.description || 'New attribute.',
      values,
      source: { kind: 'manual' },
      appliesTo: draft.appliesTo.map(defaultResourceConfig),
      usedByPolicies: 0,
      policyNames: [],
      access: defaultAccessModel('Security Administrators'),
      readIntoFiltering: false,
      valuesLink: reuse
        ? { attributeId: reuse.id, attributeName: reuse.name }
        : undefined,
    };
    setAttributes((prev) => [...prev, created]);
    setWizardOpen(false);
    setSelectedId(created.id);
  };

  return (
    <div className={styles['console']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={HUB_SIDEBAR_CATEGORIES}
        activeItemId={HUB_ACTIVE_ITEM}
      />
      <div className={styles['console__center']}>
        <ConsolePageHeader
          title={selected ? selected.name : 'Manage Attributes'}
          subtitle={
            selected
              ? attributeSubtitle(selected)
              : 'Create attributes once and configure where they apply across users, channels, and posts.'
          }
          backButton={!!selected}
          onBack={() => setSelectedId(null)}
          trailing={
            selected &&
            isSourceOwned(selected) &&
            selected.source.state ? (
              <SyncPill
                state={selected.source.state}
                system={selected.source.system}
                size="Medium"
              />
            ) : undefined
          }
        />
        <div className={styles['console__scroll']}>
          <Scrollbars>
            <div className={styles['console__content']}>
              {selected ? (
                <DetailView
                  attribute={selected}
                  onDefinitionChange={handleDefinitionChange}
                  onAddValue={addValue}
                  onAddChild={addChild}
                  onToggleValueDisabled={toggleValueDisabled}
                  onDeleteValue={deleteValue}
                  onReorderValue={reorderValue}
                  onValuesLockedAttempt={openValuesLocked}
                  onReuse={() => setReuseForId(selected.id)}
                  onUnlink={openUnlinkGate}
                  onImportMatrix={() => undefined}
                  onBindingChange={handleBindingChange}
                  onAddResource={handleAddResource}
                  onRemoveResource={openRemoveResource}
                  onAccessChange={handleAccessChange}
                  onReadIntoFilteringChange={handleReadIntoFilteringChange}
                />
              ) : (
                <>
                  <CatalogFilters
                    selectedResources={selectedResources}
                    onToggleResource={toggleResource}
                    onClearResources={() => setSelectedResources([])}
                    source={source}
                    onSourceChange={setSource}
                    query={query}
                    onQueryChange={setQuery}
                    onNewAttribute={() => setWizardOpen(true)}
                  />
                  <CatalogTable
                    attributes={filtered}
                    onOpenDetail={setSelectedId}
                    onBulk={setBulkForId}
                    onDeactivate={openDeactivate}
                    onDelete={openDelete}
                    onNewAttribute={() => setWizardOpen(true)}
                    filteredEmpty={
                      attributes.length > 0 && filtered.length === 0
                    }
                  />
                </>
              )}
            </div>
          </Scrollbars>
        </div>
      </div>

      {wizardOpen && (
        <CreateWizard
          attributes={attributes}
          onClose={() => setWizardOpen(false)}
          onCreate={handleCreate}
          onDuplicate={(name) => {
            const existing = attributes.find(
              (a) => a.name.trim().toLowerCase() === name.trim().toLowerCase(),
            );
            setGuardrail({
              kind: 'duplicate-name',
              context: {
                attributeName: name,
                existingName: existing?.name ?? name,
              },
            });
          }}
        />
      )}

      {reuseAttr && (
        <ReuseValuesPicker
          current={reuseAttr}
          attributes={attributes}
          onClose={() => setReuseForId(null)}
          onPick={handleReuse}
        />
      )}

      {bulkAttr && (
        <BulkStubSheet
          attributeName={bulkAttr.name}
          onClose={() => setBulkForId(null)}
        />
      )}

      <GuardrailDialog
        kind={guardrail?.kind ?? null}
        context={guardrail?.context ?? { attributeName: '' }}
        onClose={() => setGuardrail(null)}
        onConfirm={confirmGuardrail}
        onLinkExisting={() => {
          setGuardrail(null);
          setWizardOpen(false);
        }}
      />
    </div>
  );
}

function initialGuardrail(
  params: URLSearchParams,
  attrs: HubAttribute[],
): GuardrailState {
  const guard = params.get('guard') as GuardrailKind | null;
  if (!guard) return null;
  const a = attrs.find((x) => x.id === params.get('attr'));
  const name = a?.name ?? '';
  switch (guard) {
    case 'duplicate-name':
      return {
        kind: guard,
        context: { attributeName: 'Classification', existingName: 'Classification' },
      };
    case 'values-locked':
      return {
        kind: guard,
        context: { attributeName: name, policies: a?.policyNames ?? [] },
      };
    case 'deactivate-blocked':
      return {
        kind: guard,
        context: {
          attributeName: name,
          bindingCount: a ? valueCount(a) + 12 : 6,
          policies: a?.policyNames ?? [],
        },
      };
    case 'delete-blocked':
      return {
        kind: guard,
        context: { attributeName: name, policies: a?.policyNames ?? [] },
      };
    case 'delete-confirm':
      return {
        kind: guard,
        context: {
          attributeId: a?.id,
          attributeName: name || 'Classification',
          bindingCount: a ? appliedChannelCount(a.id) : 128,
          policyCount: a?.usedByPolicies ?? 3,
          policies: a?.policyNames ?? [],
        },
      };
    case 'unlink-gated': {
      const linked = a?.valuesLink
        ? attrs.find((x) => x.id === a.valuesLink!.attributeId)
        : undefined;
      return {
        kind: guard,
        context: {
          attributeName: name,
          linkedName: a?.valuesLink?.attributeName,
          policies: Array.from(
            new Set([
              ...(a?.policyNames ?? []),
              ...(linked?.policyNames ?? []),
            ]),
          ),
        },
      };
    }
    case 'source-stale':
      return {
        kind: guard,
        context: { attributeName: name, sourceSystem: a?.source.system },
      };
    default:
      return null;
  }
}
