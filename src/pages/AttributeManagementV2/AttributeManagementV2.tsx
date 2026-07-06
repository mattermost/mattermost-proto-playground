import { useMemo, useState } from 'react';
import AppShellAM from './_components/AppShellAM/AppShellAM';
import PageHeader from './_components/PageHeader/PageHeader';
import ResourceFilters, {
  type ViewMode,
} from './_components/ResourceFilters/ResourceFilters';
import BulkManagementMenu from './_components/BulkManagementMenu/BulkManagementMenu';
import AttributeListRow from './_components/AttributeListRow/AttributeListRow';
import EligibilityAuditTable from './_components/EligibilityAuditTable/EligibilityAuditTable';
import DetailShell from './_components/DetailShell/DetailShell';
import DefinitionSection from './_components/DefinitionSection/DefinitionSection';
import AccessEditingSection from './_components/AccessEditingSection/AccessEditingSection';
import AppliesToSection from './_components/AppliesToSection/AppliesToSection';
import ManageOrderClampSheet from './_components/ManageOrderClampSheet/ManageOrderClampSheet';
import NewAttributeSheet, {
  type NewAttributeDraft,
} from './_components/NewAttributeSheet/NewAttributeSheet';
import ReuseValuesPicker from './_components/ReuseValuesPicker/ReuseValuesPicker';
import GuardrailModals, {
  type GuardrailKind,
  type GuardrailContext,
} from './_components/GuardrailModals/GuardrailModals';
import {
  ATTRIBUTES,
  isEligibleForPolicies,
  policiesFor,
  type Attribute,
  type Resource,
  type ResourceBinding,
  type ValueOption,
} from './data';
import styles from './AttributeManagementV2.module.scss';

/**
 * Attribute Management — Variation A
 * Single list + resource filter on the Agents-style product-switcher pattern.
 *
 * Deep links (every state is URL-reachable for review):
 *   ?attr=<id>                  open that attribute's detail
 *   ?attr=<id>&sheet=order      open the values & order sheet
 *   ?view=audit                 eligibility audit
 *   ?flow=new                   new-attribute create flow
 *   ?flow=reuse&attr=<id>       reuse-values picker on an attribute
 *   ?attr=<id>&guard=<kind>     a guardrail dialog
 *
 * Default render = populated list, 1280×800 baseline, no overlay.
 */
export default function AttributeManagementV2() {
  const initialParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const isReuseDeepLink = initialParams.get('flow') === 'reuse';

  const [attributes, setAttributes] = useState<Attribute[]>(ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string | null>(
    // On a reuse deep link the picker opens standalone over the list, so the
    // detail is NOT pre-selected (otherwise the picker would be suppressed).
    isReuseDeepLink ? null : initialParams.get('attr'),
  );
  const [selectedResources, setSelectedResources] = useState<Set<Resource>>(
    initialResourceSelection(initialParams),
  );
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialParams.get('view') === 'audit' ? 'audit' : 'list',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSheetForId, setOrderSheetForId] = useState<string | null>(
    initialParams.get('sheet') === 'order' ? initialParams.get('attr') : null,
  );
  const [newOpen, setNewOpen] = useState(initialParams.get('flow') === 'new');
  const [bulkMenuOpen, setBulkMenuOpen] = useState(
    initialParams.get('bulk') === 'open',
  );
  const [reusePickerForId, setReusePickerForId] = useState<string | null>(
    initialParams.get('flow') === 'reuse' ? initialParams.get('attr') : null,
  );
  const [guardrail, setGuardrail] = useState<{
    kind: GuardrailKind;
    context: GuardrailContext;
  } | null>(initialGuardrail(initialParams, ATTRIBUTES));

  // ─── Filtered catalog ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return attributes.filter((a) => {
      // Empty selection = show all. Otherwise keep attributes that apply to ANY
      // selected resource type (additive, not exclusive).
      if (selectedResources.size > 0) {
        if (!a.appliesTo.some((b) => selectedResources.has(b.resource)))
          return false;
      }
      if (eligibleOnly && !isEligibleForPolicies(a).eligible) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.trim().toLowerCase();
        if (
          !a.name.toLowerCase().includes(q) &&
          !a.type.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [attributes, selectedResources, eligibleOnly, searchQuery]);

  const selected = selectedId
    ? attributes.find((a) => a.id === selectedId)
    : null;
  const orderSheetAttr = orderSheetForId
    ? attributes.find((a) => a.id === orderSheetForId)
    : null;

  // ─── Mutators ────────────────────────────────────────────────────────────────
  const patch = (id: string, fn: (a: Attribute) => Attribute) =>
    setAttributes((prev) => prev.map((a) => (a.id === id ? fn(a) : a)));

  const openInUse = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    setGuardrail({
      kind: 'in-use-dry-run',
      context: { attributeName: a.name, policies: policiesFor(a) },
    });
  };

  const openSharedValues = (siblingId: string) => setSelectedId(siblingId);

  const openSourceHealth = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    if (a.inUseByPolicies > 0) {
      setGuardrail({
        kind: 'stale-source-block',
        context: { attributeName: a.name, policies: [] },
      });
    } else {
      setSelectedId(id);
    }
  };

  const handleSelfEditToggle = (next: boolean) => {
    if (!selected) return;
    // Self-edit On while policy-bound = hard guardrail dry-run (§8).
    if (next && selected.inUseByPolicies > 0) {
      setGuardrail({
        kind: 'self-edit-on-bound',
        context: { attributeName: selected.name, policies: policiesFor(selected) },
      });
      return;
    }
    patch(selected.id, (a) => ({ ...a, selfEdit: next }));
  };

  const confirmGuardrail = () => {
    if (guardrail?.kind === 'self-edit-on-bound' && selected) {
      patch(selected.id, (a) => ({ ...a, selfEdit: true }));
    }
    if (guardrail?.kind === 'unlink-shared-schema') {
      handleUnlink();
    }
    setGuardrail(null);
  };

  const handleBindingChange = (
    res: Resource,
    next: Partial<ResourceBinding>,
  ) => {
    if (!selected) return;
    patch(selected.id, (a) => ({
      ...a,
      appliesTo: a.appliesTo.map((b) =>
        b.resource === res ? { ...b, ...next } : b,
      ),
    }));
  };

  const handleAddResource = (res: Resource) => {
    if (!selected) return;
    patch(selected.id, (a) => ({
      ...a,
      appliesTo: [...a.appliesTo, defaultBinding(res)],
    }));
  };

  const handleSaveValues = (values: ValueOption[]) => {
    if (!orderSheetForId) return;
    patch(orderSheetForId, (a) => ({ ...a, values }));
    setOrderSheetForId(null);
  };

  const handleReuse = (siblingId: string) => {
    if (!selected) return;
    const sibling = attributes.find((a) => a.id === siblingId);
    if (!sibling) return;
    patch(selected.id, (a) => ({
      ...a,
      sharedValuesLink: { siblingId, direction: 'mirrors' },
      values: sibling.values,
      type: sibling.type,
    }));
    setReusePickerForId(null);
  };

  const handleUnlink = () => {
    if (!selected) return;
    // Keep a copy of the current values; restore editability.
    patch(selected.id, (a) => ({
      ...a,
      sharedValuesLink: undefined,
      values: a.values.map((v) => ({ ...v })),
    }));
  };

  // Finding 5: open the policy-impact dry-run gate before unlinking a shared
  // schema. Policies that compare the two attributes are surfaced.
  const requestUnlink = () => {
    if (!selected || !selected.sharedValuesLink) return;
    const sibling = attributes.find(
      (a) => a.id === selected.sharedValuesLink!.siblingId,
    );
    // Union of policies on both sides — those most at risk of comparing the two.
    const policies = Array.from(
      new Set([
        ...policiesFor(selected),
        ...(sibling ? policiesFor(sibling) : []),
      ]),
    );
    setGuardrail({
      kind: 'unlink-shared-schema',
      context: {
        attributeName: selected.name,
        linkedName: sibling?.name,
        policies,
      },
    });
  };

  const handleCreate = (draft: NewAttributeDraft) => {
    const reuse = draft.reuseFromId
      ? attributes.find((a) => a.id === draft.reuseFromId)
      : null;
    const values: ValueOption[] = reuse
      ? reuse.values
      : draft.values.map((label, i) => ({
          id: `v-${Date.now()}-${i}`,
          label,
          rank:
            draft.type === 'Ranked' || draft.type === 'Hierarchical'
              ? i
              : undefined,
        }));
    const created: Attribute = {
      id: `attr-${Date.now()}`,
      name: draft.name,
      type: draft.type,
      values,
      source: { kind: 'manual' },
      externallyOwned: false,
      restrictedValues: false,
      selfEdit: false,
      valueVisibility: 'Visible',
      appliesTo: draft.appliesTo.map(defaultBinding),
      inUseByPolicies: 0,
      sharedValuesLink: reuse
        ? { siblingId: reuse.id, direction: 'mirrors' }
        : undefined,
    };
    setAttributes((prev) => [...prev, created]);
    setNewOpen(false);
    setSelectedId(created.id);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AppShellAM>
      <div className={styles['page']}>
        {selected ? (
          <DetailShell
            title={selected.name}
            meta={
              <>
                <span>{selected.type}</span>
                <span aria-hidden>·</span>
                <span>
                  Applies to{' '}
                  {selected.appliesTo.map((b) => b.resource).join(' · ')}
                </span>
                {selected.sharedValuesLink && (
                  <>
                    <span aria-hidden>·</span>
                    <button
                      type="button"
                      className={styles['page__inline-link']}
                      onClick={() =>
                        openSharedValues(selected.sharedValuesLink!.siblingId)
                      }
                    >
                      Shares values with{' '}
                      {
                        attributes.find(
                          (a) => a.id === selected.sharedValuesLink!.siblingId,
                        )?.name
                      }{' '}
                      ↗
                    </button>
                  </>
                )}
              </>
            }
            onBack={() => setSelectedId(null)}
            onOverflow={() => {
              if (selected.inUseByPolicies > 0) {
                setGuardrail({
                  kind: 'deactivate-forbidden',
                  context: {
                    attributeName: selected.name,
                    policies: policiesFor(selected),
                  },
                });
              }
            }}
          >
            <DefinitionSection
              attribute={selected}
              allAttributes={attributes}
              onManageOrderClamp={() => setOrderSheetForId(selected.id)}
              onOpenLinkedAttribute={openSharedValues}
              onReuse={handleReuse}
              onUnlink={handleUnlink}
              onRequestUnlink={requestUnlink}
            />
            <AccessEditingSection
              attribute={selected}
              onSelfEditToggle={handleSelfEditToggle}
              onVisibilityChange={(next) =>
                patch(selected.id, (a) => ({ ...a, valueVisibility: next }))
              }
            />
            <AppliesToSection
              attribute={selected}
              onBindingChange={handleBindingChange}
              onAddResource={handleAddResource}
            />
          </DetailShell>
        ) : (
          <>
            <PageHeader
              title="Attribute Management"
              description="Define an attribute once and apply it across users, channels, posts, and teams."
              primaryActionLabel="New attribute"
              onPrimaryAction={() => setNewOpen(true)}
              trailingAction={
                <BulkManagementMenu
                  open={bulkMenuOpen}
                  onOpenChange={setBulkMenuOpen}
                />
              }
            />
            <ResourceFilters
              selectedResources={selectedResources}
              onSelectedResourcesChange={setSelectedResources}
              eligibleOnly={eligibleOnly}
              onEligibleOnlyChange={setEligibleOnly}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />

            {viewMode === 'list' ? (
              <div className={styles['page__list']}>
                {filtered.length === 0 ? (
                  <div className={styles['page__empty']}>
                    <p className={styles['page__empty-msg']}>
                      {emptyCopy(selectedResources, eligibleOnly)}
                    </p>
                  </div>
                ) : (
                  filtered.map((a) => (
                    <AttributeListRow
                      key={a.id}
                      attribute={a}
                      onSelect={setSelectedId}
                      onSharedValuesClick={openSharedValues}
                      onInUseClick={openInUse}
                      onSourceHealthClick={openSourceHealth}
                    />
                  ))
                )}
              </div>
            ) : (
              <EligibilityAuditTable attributes={filtered} />
            )}
          </>
        )}
      </div>

      {orderSheetAttr && (
        <ManageOrderClampSheet
          open
          attribute={orderSheetAttr}
          onClose={() => setOrderSheetForId(null)}
          onSave={handleSaveValues}
          onReviewPolicies={() =>
            setGuardrail({
              kind: 'in-use-dry-run',
              context: {
                attributeName: orderSheetAttr.name,
                policies: policiesFor(orderSheetAttr),
              },
            })
          }
        />
      )}

      {/* Reuse picker reachable via deep link without opening detail first. */}
      {reusePickerForId && !selected && (
        <ReuseValuesPicker
          open
          currentId={reusePickerForId}
          attributes={attributes}
          onClose={() => setReusePickerForId(null)}
          onPick={(id) => {
            const targetId = reusePickerForId;
            const sibling = attributes.find((a) => a.id === id);
            if (sibling) {
              patch(targetId, (a) => ({
                ...a,
                sharedValuesLink: { siblingId: id, direction: 'mirrors' },
                values: sibling.values,
                type: sibling.type,
              }));
            }
            setSelectedId(targetId);
            setReusePickerForId(null);
          }}
        />
      )}

      <NewAttributeSheet
        open={newOpen}
        attributes={attributes}
        onClose={() => setNewOpen(false)}
        onCreate={handleCreate}
      />

      <GuardrailModals
        open={guardrail?.kind ?? null}
        context={guardrail?.context ?? { attributeName: '' }}
        onClose={() => setGuardrail(null)}
        onConfirm={confirmGuardrail}
      />
    </AppShellAM>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function defaultBinding(resource: Resource): ResourceBinding {
  switch (resource) {
    case 'Users':
      return { resource, whoSets: 'System admin', userDisplay: 'hide-empty' };
    case 'Channels':
      return {
        resource,
        required: false,
        whoSets: 'Channel admin',
        displayLocations: ['Sidebar'],
        inheritMode: 'off',
      };
    case 'Posts':
      return { resource, required: false, whoSets: 'Post author' };
    case 'Teams':
      return { resource, required: false, whoSets: 'Team admin' };
  }
}

function initialResourceSelection(params: URLSearchParams): Set<Resource> {
  // Deep-link: ?resource=Channels,Posts pre-selects the checkbox filter.
  const raw = params.get('resource');
  if (!raw) return new Set();
  const valid = new Set<Resource>(['Users', 'Channels', 'Posts', 'Teams']);
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter((s): s is Resource => valid.has(s as Resource)),
  );
}

function emptyCopy(
  selectedResources: Set<Resource>,
  eligibleOnly: boolean,
): string {
  if (eligibleOnly) {
    return 'No attributes are usable in access policies yet. Attributes become eligible when users can’t self-edit them.';
  }
  if (selectedResources.size === 1) {
    return `No attributes apply to ${[...selectedResources][0]} yet.`;
  }
  if (selectedResources.size > 1) {
    return 'No attributes apply to the selected resource types yet.';
  }
  return 'No attributes match the current filters.';
}

function initialGuardrail(
  params: URLSearchParams,
  attrs: Attribute[],
): { kind: GuardrailKind; context: GuardrailContext } | null {
  const guard = params.get('guard') as GuardrailKind | null;
  const attrId = params.get('attr');
  if (!guard) return null;
  const a = attrs.find((x) => x.id === attrId);
  const name = a?.name ?? '';
  const policies = a ? policiesFor(a) : [];
  if (guard === 'shared-schema-edit') {
    return {
      kind: guard,
      context: { attributeName: name, policies, siblings: a?.sharedWith ?? [] },
    };
  }
  if (guard === 'unlink-shared-schema') {
    const sibling = a?.sharedValuesLink
      ? attrs.find((x) => x.id === a.sharedValuesLink!.siblingId)
      : undefined;
    const union = Array.from(
      new Set([...policies, ...(sibling ? policiesFor(sibling) : [])]),
    );
    return {
      kind: guard,
      context: {
        attributeName: name,
        linkedName: sibling?.name,
        policies: union,
      },
    };
  }
  return { kind: guard, context: { attributeName: name, policies } };
}
