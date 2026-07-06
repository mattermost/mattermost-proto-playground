import { useMemo, useState } from 'react';
import AppShellAM from '../AttributeManagementV2/_components/AppShellAM/AppShellAM';
import PageHeader from '../AttributeManagementV2/_components/PageHeader/PageHeader';
import ResourceFilters, {
  type ViewMode,
} from '../AttributeManagementV2/_components/ResourceFilters/ResourceFilters';
import AttributeListRow from '../AttributeManagementV2/_components/AttributeListRow/AttributeListRow';
import EligibilityAuditTable from '../AttributeManagementV2/_components/EligibilityAuditTable/EligibilityAuditTable';
import DetailShell from '../AttributeManagementV2/_components/DetailShell/DetailShell';
import DefinitionSection from '../AttributeManagementV2/_components/DefinitionSection/DefinitionSection';
import AccessEditingSection from '../AttributeManagementV2/_components/AccessEditingSection/AccessEditingSection';
import AppliesToSection from '../AttributeManagementV2/_components/AppliesToSection/AppliesToSection';
import ManageOrderClampSheet from '../AttributeManagementV2/_components/ManageOrderClampSheet/ManageOrderClampSheet';
import NewAttributeSheet, {
  type NewAttributeDraft,
} from '../AttributeManagementV2/_components/NewAttributeSheet/NewAttributeSheet';
import ReuseValuesPicker from '../AttributeManagementV2/_components/ReuseValuesPicker/ReuseValuesPicker';
import GuardrailModals, {
  type GuardrailKind,
  type GuardrailContext,
} from '../AttributeManagementV2/_components/GuardrailModals/GuardrailModals';
import {
  ATTRIBUTES,
  isEligibleForPolicies,
  policiesFor,
  type Attribute,
  type Resource,
  type ResourceBinding,
  type ValueOption,
} from '../AttributeManagementV2/data';
import AreaTabs from './_components/AreaTabs/AreaTabs';
import UserAttributesArea from './_components/UserAttributesArea/UserAttributesArea';
import {
  ATTRIBUTES_AREA_LIST,
  USER_AREA_LIST,
  type AreaKey,
  siblingArea,
  siblingName,
} from './bData';

/** B's Attributes area is scoped to non-user resources. */
const B_AREA_RESOURCES: Resource[] = ['Channels', 'Posts', 'Teams'];
import styles from './AttributeManagementVariationB.module.scss';

/**
 * Attribute Management — Variation B (two areas: Resource Attributes + User
 * Attributes). Reuses Variation A's shared `_components` verbatim. The only
 * legitimate divergence is the catalog scope and the top-level tab chrome.
 *
 * Deep links (match A, plus area):
 *   ?area=attributes|user   open an area (default: attributes)
 *   ?attr=<id>              open that attribute's detail
 *   ?attr=<id>&sheet=order  open the values & order sheet
 *   ?view=audit             eligibility audit
 *   ?flow=new               new-attribute create flow
 *   ?attr=<id>&guard=<kind> a guardrail dialog
 *   ?state=loading|empty    force a User-Attributes render state
 */
export default function AttributeManagementVariationB() {
  const initialParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const isReuseDeepLink = initialParams.get('flow') === 'reuse';

  const [area, setArea] = useState<AreaKey>(
    initialParams.get('area') === 'user' ? 'user' : 'attributes',
  );
  const [attributes, setAttributes] = useState<Attribute[]>(
    ATTRIBUTES_AREA_LIST,
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    // On a reuse deep link the picker opens standalone over the list, so the
    // detail is NOT pre-selected (otherwise the picker would be suppressed).
    isReuseDeepLink ? null : initialParams.get('attr'),
  );
  const [reusePickerForId, setReusePickerForId] = useState<string | null>(
    isReuseDeepLink ? initialParams.get('attr') : null,
  );
  const [selectedResources, setSelectedResources] = useState<Set<Resource>>(
    new Set(),
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
  const [guardrail, setGuardrail] = useState<{
    kind: GuardrailKind;
    context: GuardrailContext;
  } | null>(initialGuardrail(initialParams, ATTRIBUTES_AREA_LIST));

  const forcedUserState =
    initialParams.get('state') === 'loading'
      ? 'loading'
      : initialParams.get('state') === 'empty'
        ? 'empty'
        : 'default';

  const filtered = useMemo(() => {
    return attributes.filter((a) => {
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

  const openSharedValues = (siblingId: string) => {
    const inThisArea = attributes.some((a) => a.id === siblingId);
    if (!inThisArea) {
      // Sibling lives in the User Attributes area — cross over.
      setSelectedId(null);
      setArea('user');
      return;
    }
    setSelectedId(siblingId);
  };

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
  };

  const handleUnlink = () => {
    if (!selected) return;
    patch(selected.id, (a) => ({
      ...a,
      sharedValuesLink: undefined,
      values: a.values.map((v) => ({ ...v })),
    }));
  };

  // Finding 5: policy-impact dry-run gate before unlinking a shared schema.
  // B's catalog is partitioned, so the sibling is resolved from the full pool.
  const requestUnlink = () => {
    if (!selected || !selected.sharedValuesLink) return;
    const sibling = ATTRIBUTES.find(
      (a) => a.id === selected.sharedValuesLink!.siblingId,
    );
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

  // Cross-area link FROM the User Attributes area INTO the detail.
  const openInAttributesArea = (id: string) => {
    setArea('attributes');
    setSelectedId(id);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AppShellAM>
      <div className={styles['page']}>
        {area === 'attributes' && selected ? (
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
                      Shares values with {siblingName(selected)}
                      {siblingArea(selected) === 'user'
                        ? ' (User Attributes)'
                        : ''}{' '}
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
              primaryActionLabel={
                area === 'user' ? 'New user attribute' : 'New attribute'
              }
              onPrimaryAction={() => setNewOpen(true)}
            />

            <AreaTabs
              active={area}
              onChange={(next) => {
                setArea(next);
                setSelectedId(null);
              }}
            />

            {area === 'attributes' ? (
              <>
                <ResourceFilters
                  selectedResources={selectedResources}
                  onSelectedResourcesChange={setSelectedResources}
                  eligibleOnly={eligibleOnly}
                  onEligibleOnlyChange={setEligibleOnly}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  resources={B_AREA_RESOURCES}
                />

                {viewMode === 'list' ? (
                  <div className={styles['page__list']}>
                    {filtered.length === 0 ? (
                      <div className={styles['page__empty']}>
                        <p className={styles['page__empty-msg']}>
                          No attributes match the current filters.
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
            ) : (
              <UserAttributesArea
                attributes={USER_AREA_LIST}
                forceState={forcedUserState}
                onOpenInAttributesArea={openInAttributesArea}
                onOpenDetail={openInAttributesArea}
              />
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

      {/* Reuse picker reachable via deep link without opening detail first.
          B's catalog is partitioned, so the picker draws candidates from the
          full attribute pool. */}
      {reusePickerForId && !selected && (
        <ReuseValuesPicker
          open
          currentId={reusePickerForId}
          attributes={ATTRIBUTES}
          onClose={() => setReusePickerForId(null)}
          onPick={(id) => {
            const targetId = reusePickerForId;
            const sibling = ATTRIBUTES.find((a) => a.id === id);
            if (sibling) {
              setAttributes((prev) =>
                prev.map((a) =>
                  a.id === targetId
                    ? {
                        ...a,
                        sharedValuesLink: {
                          siblingId: id,
                          direction: 'mirrors',
                        },
                        values: sibling.values,
                        type: sibling.type,
                      }
                    : a,
                ),
              );
            }
            // Show the result in whichever area holds the target.
            if (attributes.some((a) => a.id === targetId)) {
              setArea('attributes');
              setSelectedId(targetId);
            } else {
              openInAttributesArea(targetId);
            }
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

function initialGuardrail(
  params: URLSearchParams,
  attrs: Attribute[],
): { kind: GuardrailKind; context: GuardrailContext } | null {
  const guard = params.get('guard') as GuardrailKind | null;
  const attrId = params.get('attr');
  if (!guard) return null;
  // Resolve against the full catalog so deep links work for attributes in
  // either area (e.g. Clearance, which lives in the User Attributes area).
  const a = attrs.find((x) => x.id === attrId) ?? ATTRIBUTES.find((x) => x.id === attrId);
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
      ? ATTRIBUTES.find((x) => x.id === a.sharedValuesLink!.siblingId)
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
