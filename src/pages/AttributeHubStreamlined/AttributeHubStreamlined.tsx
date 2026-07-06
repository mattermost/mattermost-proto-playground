import { useMemo, useState } from 'react';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import CatalogFilters from '../AttributeManagementHub/_components/CatalogFilters/CatalogFilters';
import CatalogTable from '../AttributeManagementHub/_components/CatalogTable/CatalogTable';
import SyncPill from '../AttributeManagementHub/_components/SyncPill/SyncPill';
import GuardrailDialog, {
  type GuardrailContext,
  type GuardrailKind,
} from '../AttributeManagementHub/_components/GuardrailDialog/GuardrailDialog';
import ReuseValuesPicker from '../AttributeManagementHub/_components/ReuseValuesPicker/ReuseValuesPicker';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '../AttributeManagementHub/hubSidebar';
import {
  HUB_ATTRIBUTES,
  defaultAccessModel,
  defaultResourceConfig,
  isPolicyLocked,
  isSourceOwned,
  newAttributeId,
  policyLabel,
  type AttrValue,
  type HubAttribute,
  type ResourceKind,
} from '../AttributeManagementHub/hubData';
import StreamlinedDetail from './StreamlinedDetail';
import InlineCreate, { type InlineCreateDraft } from './InlineCreate';
import styles from './streamlined.module.scss';

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

/**
 * Approach A scene — "Aggressive cut: one owner, one page, no advanced tier".
 *
 * Reuses the shared catalog (CatalogFilters + CatalogTable) and guardrails
 * READ-ONLY; the drill-in is a rebuilt single flat page (StreamlinedDetail) and
 * the create flow is a lightweight inline add-a-row (InlineCreate). All shared
 * model + seed comes from AttributeManagementHub/hubData, unmodified.
 */
export default function AttributeHubStreamlined() {
  const [attributes, setAttributes] = useState<HubAttribute[]>(HUB_ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedResources, setSelectedResources] = useState<ResourceKind[]>([]);
  const [source, setSource] = useState('All sources');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [reuseForId, setReuseForId] = useState<string | null>(null);
  const [guardrail, setGuardrail] = useState<GuardrailState>(null);

  const selected = selectedId
    ? (attributes.find((a) => a.id === selectedId) ?? null)
    : null;
  const reuseAttr = reuseForId
    ? (attributes.find((a) => a.id === reuseForId) ?? null)
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

  const toggleResourceFilter = (r: ResourceKind) =>
    setSelectedResources((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  // ── Catalog row actions (guardrails reused) ─────────────────────────────
  const openDeactivate = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    setGuardrail({
      kind: 'deactivate-blocked',
      context: {
        attributeName: a.name,
        bindingCount: 6,
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
        context: { attributeName: a.name, policies: a.policyNames },
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

  const confirmGuardrail = () => {
    if (guardrail?.kind === 'unlink-gated' && selected) {
      patch(selected.id, (a) => ({ ...a, valuesLink: undefined }));
    }
    setGuardrail(null);
  };

  // ── Value editing (flat + tree) ─────────────────────────────────────────
  const addValue = (label: string, asTier?: boolean) => {
    if (!selected) return;
    if (isPolicyLocked(selected)) {
      openValuesLocked();
      return;
    }
    const isTree = selected.type === 'Ranked-hierarchical';
    const isRanked = selected.type === 'Ranked' || isTree;
    const makeTier = isTree ? !!asTier : isRanked;
    const nextTier = makeTier
      ? selected.values.filter((v) => v.tier != null).length + 1
      : undefined;
    const value: AttrValue = { id: `v-${Date.now()}`, label, tier: nextTier };
    patch(selected.id, (a) => ({ ...a, values: [...a.values, value] }));
  };

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

  const deleteValue = (valueId: string) => {
    if (!selected) return;
    if (isPolicyLocked(selected)) {
      openValuesLocked();
      return;
    }
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
    if (target && (target.inUseCount ?? 0) > 0) return;
    const prune = (vs: AttrValue[]): AttrValue[] =>
      vs
        .filter((v) => v.id !== valueId)
        .map((v) => ({
          ...v,
          children: v.children ? prune(v.children) : undefined,
        }));
    patch(selected.id, (a) => ({ ...a, values: prune(a.values) }));
  };

  const reorderValue = (valueId: string, dir: -1 | 1) => {
    if (!selected) return;
    if (isPolicyLocked(selected)) {
      openValuesLocked();
      return;
    }
    const swapInList = (
      vs: AttrValue[],
    ): { list: AttrValue[]; moved: boolean } => {
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
      let tier = 1;
      const renum = list.map((v) =>
        v.tier != null ? { ...v, tier: tier++ } : v,
      );
      return { ...a, values: renum };
    });
  };

  const handleSharedScale = (sourceId: string) => {
    if (!selected) return;
    const src = attributes.find((a) => a.id === sourceId);
    if (!src) return;
    patch(selected.id, (a) => ({
      ...a,
      valuesLink: { attributeId: src.id, attributeName: src.name },
      values: src.values.map((v) => ({ ...v })),
      type: src.type,
    }));
    setReuseForId(null);
  };

  const handleDefinitionChange = (
    next: Partial<Pick<HubAttribute, 'name' | 'type' | 'description'>>,
  ) => {
    if (!selected) return;
    patch(selected.id, (a) => ({ ...a, ...next }));
  };

  const toggleResourceBinding = (resource: ResourceKind) => {
    if (!selected) return;
    patch(selected.id, (a) => {
      const has = a.appliesTo.some((c) => c.resource === resource);
      return {
        ...a,
        appliesTo: has
          ? a.appliesTo.filter((c) => c.resource !== resource)
          : [...a.appliesTo, defaultResourceConfig(resource)],
      };
    });
  };

  const toggleRequired = (resource: ResourceKind) => {
    if (!selected) return;
    patch(selected.id, (a) => ({
      ...a,
      appliesTo: a.appliesTo.map((c) =>
        c.resource === resource ? { ...c, required: !c.required } : c,
      ),
    }));
  };

  const handleCreate = (draft: InlineCreateDraft) => {
    const values: AttrValue[] = draft.values.map((label, i) => ({
      id: `v-${Date.now()}-${i}`,
      label,
    }));
    const created: HubAttribute = {
      id: newAttributeId(),
      name: draft.name,
      type: draft.type,
      description: 'New attribute.',
      values,
      source: { kind: 'manual' },
      appliesTo: [defaultResourceConfig('Channels')],
      usedByPolicies: 0,
      policyNames: [],
      access: defaultAccessModel('Security Administrators'),
      readIntoFiltering: false,
    };
    setAttributes((prev) => [...prev, created]);
    setCreating(false);
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
              : 'Approach A — one owner, one page, no advanced tier. Create attributes and configure where they apply.'
          }
          backButton={!!selected}
          onBack={() => setSelectedId(null)}
          trailing={
            selected && isSourceOwned(selected) && selected.source.state ? (
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
                <StreamlinedDetail
                  attribute={selected}
                  onDefinitionChange={handleDefinitionChange}
                  onAddValue={addValue}
                  onAddChild={addChild}
                  onDeleteValue={deleteValue}
                  onReorderValue={reorderValue}
                  onValuesLockedAttempt={openValuesLocked}
                  onSharedScale={() => setReuseForId(selected.id)}
                  onUnlink={openUnlinkGate}
                  onToggleResource={toggleResourceBinding}
                  onToggleRequired={toggleRequired}
                />
              ) : creating ? (
                <InlineCreate
                  existingNames={attributes.map((a) => a.name)}
                  onCancel={() => setCreating(false)}
                  onCreate={handleCreate}
                />
              ) : (
                <>
                  <CatalogFilters
                    selectedResources={selectedResources}
                    onToggleResource={toggleResourceFilter}
                    onClearResources={() => setSelectedResources([])}
                    source={source}
                    onSourceChange={setSource}
                    query={query}
                    onQueryChange={setQuery}
                    onNewAttribute={() => setCreating(true)}
                  />
                  <CatalogTable
                    attributes={filtered}
                    onOpenDetail={setSelectedId}
                    onBulk={() => undefined}
                    onDeactivate={openDeactivate}
                    onDelete={openDelete}
                    onNewAttribute={() => setCreating(true)}
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

      {reuseAttr && (
        <ReuseValuesPicker
          current={reuseAttr}
          attributes={attributes}
          onClose={() => setReuseForId(null)}
          onPick={handleSharedScale}
        />
      )}

      <GuardrailDialog
        kind={guardrail?.kind ?? null}
        context={guardrail?.context ?? { attributeName: '' }}
        onClose={() => setGuardrail(null)}
        onConfirm={confirmGuardrail}
        onLinkExisting={() => setGuardrail(null)}
      />
    </div>
  );
}
