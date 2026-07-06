import { useMemo, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import DefinitionSection from '../AttributeManagementV2/_components/DefinitionSection/DefinitionSection';
import AccessEditingSection from '../AttributeManagementV2/_components/AccessEditingSection/AccessEditingSection';
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
  isEligibleForPolicies,
  policiesFor,
  type Resource,
  type ValueOption,
} from '../AttributeManagementV2/data';
import CatalogFilterBar, {
  type ResourceFilterKey,
} from '../AttributeManagementVariationD/_components/CatalogFilterBar/CatalogFilterBar';
import AttributeCatalogTable from '../AttributeManagementVariationD/_components/AttributeCatalogTable/AttributeCatalogTable';
import AppliesToSection from '../AttributeManagementVariationD/_components/AppliesToSection/AppliesToSection';
import {
  ATTRIBUTES_D,
  defaultBindingD,
  type AttributeD,
  type ResourceBindingD,
} from '../AttributeManagementVariationD/dData';
import {
  ACTIVE_SIDEBAR_ITEM,
  SIDEBAR_CATEGORIES,
} from './consoleSidebarFixture';
import styles from './AttributeManagementVariationE.module.scss';

/**
 * Attribute Management — Variation E (System Console shell)
 *
 * Same interaction model as Variation D (per-resource value overlays), but
 * hosted inside the System Console with the Smart Markings sidebar. Global
 * Active nav item: Manage Attributes under Attribute System.
 */
export default function AttributeManagementVariationE() {
  const initialParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const isReuseDeepLink = initialParams.get('flow') === 'reuse';
  const resourceParam = initialParams.get('resource') as ResourceFilterKey | null;
  const validResources: ResourceFilterKey[] = [
    'All',
    'Users',
    'Channels',
    'Posts',
    'Teams',
  ];
  const initialResource =
    resourceParam && validResources.includes(resourceParam)
      ? resourceParam
      : 'All';

  const [attributes, setAttributes] = useState<AttributeD[]>(ATTRIBUTES_D);
  const [selectedId, setSelectedId] = useState<string | null>(
    isReuseDeepLink ? null : initialParams.get('attr'),
  );
  const [resource, setResource] = useState<ResourceFilterKey>(initialResource);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSheetForId, setOrderSheetForId] = useState<string | null>(
    initialParams.get('sheet') === 'order' ? initialParams.get('attr') : null,
  );
  const [newOpen, setNewOpen] = useState(initialParams.get('flow') === 'new');
  const [reusePickerForId, setReusePickerForId] = useState<string | null>(
    initialParams.get('flow') === 'reuse' ? initialParams.get('attr') : null,
  );
  const [guardrail, setGuardrail] = useState<{
    kind: GuardrailKind;
    context: GuardrailContext;
  } | null>(initialGuardrail(initialParams, ATTRIBUTES_D));

  const filtered = useMemo(() => {
    return attributes.filter((a) => {
      if (resource !== 'All') {
        if (!a.appliesTo.some((b) => b.resource === resource)) return false;
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
  }, [attributes, resource, eligibleOnly, searchQuery]);

  const selected = selectedId
    ? attributes.find((a) => a.id === selectedId)
    : null;
  const orderSheetAttr = orderSheetForId
    ? attributes.find((a) => a.id === orderSheetForId)
    : null;

  const patch = (id: string, fn: (a: AttributeD) => AttributeD) =>
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

  const handleSelfEditToggle = (next: boolean) => {
    if (!selected) return;
    if (next && selected.inUseByPolicies > 0) {
      setGuardrail({
        kind: 'self-edit-on-bound',
        context: {
          attributeName: selected.name,
          policies: policiesFor(selected),
        },
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
    next: Partial<ResourceBindingD>,
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
      appliesTo: [...a.appliesTo, defaultBindingD(res)],
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
    patch(selected.id, (a) => ({
      ...a,
      sharedValuesLink: undefined,
      values: a.values.map((v) => ({ ...v })),
    }));
  };

  const requestUnlink = () => {
    if (!selected || !selected.sharedValuesLink) return;
    const sibling = attributes.find(
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
    const created: AttributeD = {
      id: `attr-${Date.now()}`,
      name: draft.name,
      type: draft.type,
      values,
      source: { kind: 'manual' },
      externallyOwned: false,
      restrictedValues: false,
      selfEdit: false,
      valueVisibility: 'Visible',
      appliesTo: draft.appliesTo.map(defaultBindingD),
      inUseByPolicies: 0,
      sharedValuesLink: reuse
        ? { siblingId: reuse.id, direction: 'mirrors' }
        : undefined,
    };
    setAttributes((prev) => [...prev, created]);
    setNewOpen(false);
    setSelectedId(created.id);
  };

  const handleDeactivateAttempt = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    setGuardrail({
      kind: 'deactivate-forbidden',
      context: { attributeName: a.name, policies: policiesFor(a) },
    });
  };

  const listHeaderTrailing = (
    <Button
      emphasis="Primary"
      size="Medium"
      leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
      onClick={() => setNewOpen(true)}
    >
      New attribute
    </Button>
  );

  return (
    <div className={styles['console']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={SIDEBAR_CATEGORIES}
        activeItemId={ACTIVE_SIDEBAR_ITEM}
        onItemClick={() => {}}
      />

      <div className={styles['console__center']}>
        <ConsolePageHeader
          title={selected ? selected.name : 'Manage Attributes'}
          tag={selected ? undefined : 'Enterprise Advanced'}
          backButton={selected != null}
          onBack={selected ? () => setSelectedId(null) : undefined}
          trailing={
            selected ? (
              <IconButton
                size="Medium"
                aria-label="More actions"
                icon={<Icon size="20" glyph={<DotsHorizontalIcon />} />}
                onClick={() => {
                  if (selected.inUseByPolicies > 0) {
                    handleDeactivateAttempt(selected.id);
                  }
                }}
              />
            ) : (
              listHeaderTrailing
            )
          }
        />

        <div className={styles['console__scroll']}>
          <div className={styles['console__content']}>
            {selected ? (
              <>
                <div className={styles['console__meta']}>
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
                        className={styles['console__inline-link']}
                        onClick={() =>
                          openSharedValues(selected.sharedValuesLink!.siblingId)
                        }
                      >
                        Shares values with{' '}
                        {
                          attributes.find(
                            (a) =>
                              a.id === selected.sharedValuesLink!.siblingId,
                          )?.name
                        }{' '}
                        ↗
                      </button>
                    </>
                  )}
                </div>
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
                    patch(selected.id, (a) => ({
                      ...a,
                      valueVisibility: next,
                    }))
                  }
                />
                <AppliesToSection
                  attribute={selected}
                  onBindingChange={handleBindingChange}
                  onAddResource={handleAddResource}
                />
              </>
            ) : (
              <>
                <p className={styles['console__description']}>
                  Define an attribute once, then customize allowed values per
                  resource without deleting from the global catalog.
                </p>

                <CatalogFilterBar
                  activeResource={resource}
                  onResourceChange={setResource}
                  eligibleOnly={eligibleOnly}
                  onEligibleOnlyChange={setEligibleOnly}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                />

                <AttributeCatalogTable
                  attributes={filtered}
                  allAttributes={attributes}
                  resourceFilter={resource}
                  onOpenDetail={setSelectedId}
                  onOpenLinked={openSharedValues}
                  onInUseClick={openInUse}
                  onNewAttribute={() => setNewOpen(true)}
                  onDeactivateAttempt={handleDeactivateAttempt}
                />
              </>
            )}
          </div>
        </div>
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
    </div>
  );
}

function initialGuardrail(
  params: URLSearchParams,
  attrs: AttributeD[],
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
