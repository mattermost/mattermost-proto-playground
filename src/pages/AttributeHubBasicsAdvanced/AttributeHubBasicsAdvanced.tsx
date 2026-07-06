import { useMemo, useState } from 'react';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import CatalogFilters from '../AttributeManagementHub/_components/CatalogFilters/CatalogFilters';
import CatalogTable from '../AttributeManagementHub/_components/CatalogTable/CatalogTable';
import SyncPill from '../AttributeManagementHub/_components/SyncPill/SyncPill';
import CreateWizard, {
  type WizardDraft,
} from '../AttributeManagementHub/_components/CreateWizard/CreateWizard';
import ReuseValuesPicker from '../AttributeManagementHub/_components/ReuseValuesPicker/ReuseValuesPicker';
import GuardrailDialog, {
  type GuardrailContext,
  type GuardrailKind,
} from '../AttributeManagementHub/_components/GuardrailDialog/GuardrailDialog';
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
  type AccessModel,
  type AttrValue,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from '../AttributeManagementHub/hubData';
import BasicsForm from './BasicsForm';
import AdvancedDrawer from './AdvancedDrawer';
import InlineCreateRow, { type InlineCreateDraft } from './InlineCreateRow';
import styles from './AttributeHubBasicsAdvanced.module.scss';

type GuardrailState = { kind: GuardrailKind; context: GuardrailContext } | null;

function attributeSubtitle(a: HubAttribute): string {
  const parts = [
    a.type,
    `Applies to ${a.appliesTo.map((c) => c.resource).join(', ')}`,
  ];
  if (a.usedByPolicies > 0) parts.push(policyLabel(a.usedByPolicies));
  return parts.join(' · ');
}

/**
 * Attribute Management — Approach B: "Basics by default, one Advanced door."
 *
 * Catalog/listing is reused UNCHANGED from AttributeManagementHub. The DRILL-IN
 * is rebuilt as a Basics form (the 90% case) with a single Advanced settings
 * door (the 10% case), per spec 27 §2/§3 and spec 28 copy/order fixes.
 * Create is inline add-a-row (P4-3), with the guided wizard opt-in.
 */
export default function AttributeHubBasicsAdvanced() {
  const [attributes, setAttributes] = useState<HubAttribute[]>(HUB_ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedResources, setSelectedResources] = useState<ResourceKind[]>([]);
  const [source, setSource] = useState('All sources');
  const [query, setQuery] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [reuseForId, setReuseForId] = useState<string | null>(null);
  const [guardrail, setGuardrail] = useState<GuardrailState>(null);

  const selected = selectedId
    ? attributes.find((a) => a.id === selectedId) ?? null
    : null;
  const reuseAttr = reuseForId
    ? attributes.find((a) => a.id === reuseForId) ?? null
    : null;

  const filtered = useMemo(
    () =>
      attributes.filter((a) => {
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
          )
            return false;
        }
        return true;
      }),
    [attributes, selectedResources, source, query],
  );

  const patch = (id: string, fn: (a: HubAttribute) => HubAttribute) =>
    setAttributes((prev) => prev.map((a) => (a.id === id ? fn(a) : a)));

  const toggleResource = (r: ResourceKind) =>
    setSelectedResources((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  // ── Guardrail openers (reused pattern from the Hub) ───────────────────────
  const openDeactivate = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    setGuardrail({
      kind: 'deactivate-blocked',
      context: { attributeName: a.name, bindingCount: 24, policies: a.policyNames },
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
        policies: isPolicyLocked(selected) ? selected.policyNames : [],
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

  // ── Value editing (policy-locked attrs open the guardrail instead) ────────
  const guardIfLocked = (a: HubAttribute): boolean => {
    if (isPolicyLocked(a)) {
      setGuardrail({
        kind: 'values-locked',
        context: { attributeName: a.name, policies: a.policyNames },
      });
      return true;
    }
    return false;
  };

  const addValue = (label: string, asTier?: boolean) => {
    if (!selected || guardIfLocked(selected)) return;
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
    if (!selected || guardIfLocked(selected)) return;
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
    if (!selected || guardIfLocked(selected)) return;
    const prune = (vs: AttrValue[]): AttrValue[] =>
      vs
        .filter((v) => v.id !== valueId)
        .map((v) => ({
          ...v,
          children: v.children ? prune(v.children) : undefined,
        }));
    patch(selected.id, (a) => ({ ...a, values: prune(a.values) }));
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

  const handleReadIntoChange = (value: boolean) => {
    if (!selected) return;
    patch(selected.id, (a) => ({ ...a, readIntoFiltering: value }));
  };

  const handleDefinitionChange = (
    next: Partial<Pick<HubAttribute, 'name' | 'type' | 'description'>>,
  ) => {
    if (!selected) return;
    patch(selected.id, (a) => ({ ...a, ...next }));
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

  const finishCreate = (
    name: string,
    type: HubAttribute['type'],
    values: AttrValue[],
    appliesTo: ResourceKind[],
    reuseFromId: string | null,
  ) => {
    const reuse = reuseFromId
      ? attributes.find((a) => a.id === reuseFromId)
      : null;
    const created: HubAttribute = {
      id: newAttributeId(),
      name,
      type: reuse ? reuse.type : type,
      description: '',
      values: reuse ? reuse.values.map((v) => ({ ...v })) : values,
      source: { kind: 'manual' },
      appliesTo: (appliesTo.length
        ? appliesTo
        : (['Channels'] as ResourceKind[])
      ).map(defaultResourceConfig),
      usedByPolicies: 0,
      policyNames: [],
      access: defaultAccessModel('Security Administrators'),
      readIntoFiltering: false,
      valuesLink: reuse
        ? { attributeId: reuse.id, attributeName: reuse.name }
        : undefined,
    };
    setAttributes((prev) => [...prev, created]);
    setSelectedId(created.id);
  };

  const handleInlineCreate = (draft: InlineCreateDraft) => {
    const values: AttrValue[] = draft.values.map((label, i) => ({
      id: `v-${Date.now()}-${i}`,
      label,
      tier:
        draft.type === 'Ranked' || draft.type === 'Ranked-hierarchical'
          ? i + 1
          : undefined,
    }));
    finishCreate(draft.name, draft.type, values, ['Channels'], null);
  };

  const handleWizardCreate = (draft: WizardDraft) => {
    const values: AttrValue[] = draft.values.map((label, i) => ({
      id: `v-${Date.now()}-${i}`,
      label,
      tier:
        draft.type === 'Ranked' || draft.type === 'Ranked-hierarchical'
          ? i + 1
          : undefined,
    }));
    finishCreate(draft.name, draft.type, values, draft.appliesTo, draft.reuseFromId);
    setWizardOpen(false);
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
              : 'Create attributes once and configure where they apply across users, channels, posts, and teams.'
          }
          backButton={!!selected}
          onBack={() => {
            setSelectedId(null);
            setAdvancedOpen(false);
          }}
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
                <BasicsForm
                  attribute={selected}
                  onDefinitionChange={handleDefinitionChange}
                  onAddValue={addValue}
                  onAddChild={addChild}
                  onDeleteValue={deleteValue}
                  onUseSharedScale={() => setReuseForId(selected.id)}
                  onUnlink={openUnlinkGate}
                  onBindingChange={handleBindingChange}
                  onAddResource={handleAddResource}
                  onRemoveResource={openRemoveResource}
                  onOpenAdvanced={() => setAdvancedOpen(true)}
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
                  <InlineCreateRow
                    existingNames={attributes.map((a) => a.name)}
                    onCreate={handleInlineCreate}
                    onOpenGuided={() => setWizardOpen(true)}
                  />
                  <CatalogTable
                    attributes={filtered}
                    onOpenDetail={setSelectedId}
                    onBulk={() => undefined}
                    onDeactivate={openDeactivate}
                    onDelete={openDelete}
                    onNewAttribute={() => setWizardOpen(true)}
                    filteredEmpty={attributes.length > 0 && filtered.length === 0}
                  />
                </>
              )}
            </div>
          </Scrollbars>
        </div>
      </div>

      {selected && advancedOpen && (
        <AdvancedDrawer
          attribute={selected}
          onClose={() => setAdvancedOpen(false)}
          onAccessChange={handleAccessChange}
          onBindingChange={handleBindingChange}
          onReadIntoChange={handleReadIntoChange}
        />
      )}

      {wizardOpen && (
        <CreateWizard
          attributes={attributes}
          onClose={() => setWizardOpen(false)}
          onCreate={handleWizardCreate}
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
