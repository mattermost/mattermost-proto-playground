import { useEffect, useMemo, useRef, useState } from 'react';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Button from '@/components/ui/Button/Button';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import MvpConnectionPill from './_components/MvpConnectionPill';
import GuardrailDialog, {
  type GuardrailContext,
  type GuardrailKind,
} from '@/pages/AttributeManagementHub/_components/GuardrailDialog/GuardrailDialog';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import {
  HUB_ATTRIBUTES,
  defaultAccessModel,
  defaultResourceConfig,
  isSourceOwned,
  newAttributeId,
  policyLabel,
  type AttrValue,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
  type SourceSystem,
} from '@/pages/AttributeManagementHub/hubData';
import MvpDetailView from './_components/MvpDetailView';
import MvpMarkingsPage from './_components/MvpMarkingsPage';
import MvpCatalogListing, {
  READONLY_ATTR_ID,
} from './_components/MvpCatalogListing';
import { MVP_RESOURCES } from './_components/mvpModel';
import {
  connectionStatus,
  readInheritance,
  type InheritanceState,
} from './_components/mvpTerms';
import WalkthroughFocusProvider from '@/components/walkthrough/WalkthroughFocusProvider';
import styles from './AttributeHubMVP.module.scss';

/** Per (attribute, resource) demo state layered over the read-only base model. */
type EdgeKey = string;
const edgeKey = (attrId: string, resource: ResourceKind): EdgeKey =>
  `${attrId}:${resource}`;

type GuardrailState = { kind: GuardrailKind; context: GuardrailContext } | null;

function subtitle(a: HubAttribute): string {
  const resources = a.appliesTo
    .map((c) => c.resource)
    .filter((r) => MVP_RESOURCES.includes(r));
  const parts = [
    a.type,
    `Applies to ${resources.join(', ') || 'nothing yet'}`,
  ];
  if (a.usedByPolicies > 0) parts.push(policyLabel(a.usedByPolicies));
  return parts.join(' · ');
}

/** Blank create — Type defaults to Select, no wizard. */
function blankAttribute(): HubAttribute {
  return {
    id: newAttributeId(),
    name: '',
    type: 'Select',
    description: '',
    values: [],
    source: { kind: 'manual' },
    appliesTo: [],
    usedByPolicies: 0,
    policyNames: [],
    access: defaultAccessModel('Security Administrators'),
    readIntoFiltering: false,
  };
}

function readParams(): URLSearchParams {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

/**
 * Global Attributes — MVP (P0). A ruthlessly-scoped cut of the Simplified hub
 * for the scope session: listing (search/filter/row-actions), create-as-blank-
 * detail-page (Type=Select), Definition (Name/Type/Values), and Applies-to
 * (Users/Channels/Posts) with the §3 per-resource config. Delegation is a quiet
 * DGA line, not a control. Allowed-value subsets are OPEN — hidden unless
 * ?allowed=on. Deep-links: ?attr=<id>, ?flow=new, ?allowed=on,
 * ?resource=Channels|Users|Posts (comma-separated for multi-select).
 */
export default function AttributeHubMVP() {
  const params = readParams();
  const allowedOn = params.get('allowed') === 'on';

  const [attributes, setAttributes] = useState<HubAttribute[]>(HUB_ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (params.get('flow') === 'new') return null;
    const attr = params.get('attr');
    // Never open the read-only attribute in detail.
    return attr === READONLY_ATTR_ID ? null : attr;
  });
  const [draft, setDraft] = useState<HubAttribute | null>(
    params.get('flow') === 'new' ? blankAttribute() : null,
  );
  /** Read-only markings page (?markings=<id> deep link, e.g. classification). */
  const [markingsId, setMarkingsId] = useState<string | null>(
    () => params.get('markings'),
  );

  const [selectedResources, setSelectedResources] = useState<ResourceKind[]>(
    () => {
      const raw = params.get('resource');
      if (raw == null || raw.trim() === '') {
        return [];
      }
      return raw
        .split(',')
        .map((part) => part.trim())
        .filter((part): part is ResourceKind =>
          (MVP_RESOURCES as readonly string[]).includes(part),
        );
    },
  );
  const [source, setSource] = useState('All sources');
  const [query, setQuery] = useState('');
  const [guardrail, setGuardrail] = useState<GuardrailState>(null);

  /**
   * Demo-interactive state that the shared read-only base model can't hold:
   * per-resource inheritance (on/off + ceiling) and per-resource display names.
   * Keyed by attribute id + resource so it survives detail navigation.
   */
  const [inheritanceEdges, setInheritanceEdges] = useState<
    Record<EdgeKey, InheritanceState>
  >({});
  const [resourceNames, setResourceNames] = useState<Record<EdgeKey, string>>(
    {},
  );

  const nameRef = useRef<HTMLInputElement | null>(null);
  const creating = draft !== null;

  useEffect(() => {
    if (creating) nameRef.current?.focus();
  }, [creating]);

  const persisted = selectedId
    ? attributes.find((a) => a.id === selectedId) ?? null
    : null;
  const active = draft ?? persisted;

  const filtered = useMemo(() => {
    return attributes.filter((a) => {
      if (selectedResources.length > 0) {
        if (
          !a.appliesTo.some(
            (c) =>
              MVP_RESOURCES.includes(c.resource) &&
              selectedResources.includes(c.resource),
          )
        ) {
          return false;
        }
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

  const toggleResource = (r: ResourceKind) =>
    setSelectedResources((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  const mutate = (fn: (a: HubAttribute) => HubAttribute) => {
    if (draft) {
      setDraft((d) => (d ? fn(d) : d));
    } else if (selectedId) {
      setAttributes((prev) => prev.map((a) => (a.id === selectedId ? fn(a) : a)));
    }
  };

  const addValue = (label: string) => {
    if (!active) return;
    const isRanked = active.type === 'Ranked';
    const nextTier = isRanked
      ? active.values.filter((v) => v.tier != null).length + 1
      : undefined;
    const value: AttrValue = { id: `v-${Date.now()}`, label, tier: nextTier };
    mutate((a) => ({ ...a, values: [...a.values, value] }));
  };

  const toggleValueDisabled = (valueId: string) => {
    mutate((a) => ({
      ...a,
      values: a.values.map((v) =>
        v.id === valueId ? { ...v, disabled: !v.disabled } : v,
      ),
    }));
  };

  const deleteValue = (valueId: string) => {
    if (!active) return;
    const target = active.values.find((v) => v.id === valueId);
    if (target && (target.inUseCount ?? 0) > 0) return;
    mutate((a) => ({
      ...a,
      values: a.values.filter((v) => v.id !== valueId),
    }));
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

  /** Inheritance for a (attribute, resource) edge — seeded from the base cfg. */
  const inheritanceFor = (
    attr: HubAttribute,
    cfg: ResourceConfig,
  ): InheritanceState =>
    inheritanceEdges[edgeKey(attr.id, cfg.resource)] ??
    readInheritance(cfg, attr.type);

  const setInheritance = (resource: ResourceKind, next: InheritanceState) => {
    if (!active) return;
    setInheritanceEdges((prev) => ({
      ...prev,
      [edgeKey(active.id, resource)]: next,
    }));
  };

  const nameOnResourceFor = (attr: HubAttribute, resource: ResourceKind) =>
    resourceNames[edgeKey(attr.id, resource)] ?? '';

  const setNameOnResource = (resource: ResourceKind, value: string) => {
    if (!active) return;
    setResourceNames((prev) => ({
      ...prev,
      [edgeKey(active.id, resource)]: value,
    }));
  };

  const connectSource = (_system: SourceSystem) => {
    // Demo — modal closes on selection; no transient connected state in the UI.
  };

  const addResource = (resource: ResourceKind) => {
    mutate((a) =>
      a.appliesTo.some((c) => c.resource === resource)
        ? a
        : { ...a, appliesTo: [...a.appliesTo, defaultResourceConfig(resource)] },
    );
  };

  const removeResource = (resource: ResourceKind) => {
    mutate((a) => ({
      ...a,
      appliesTo: a.appliesTo.filter((c) => c.resource !== resource),
    }));
  };

  const confirmGuardrail = () => {
    setGuardrail(null);
  };

  const openDetail = (id: string) => {
    if (id === READONLY_ATTR_ID) return;
    setDraft(null);
    setSelectedId(id);
  };

  const openMarkings = (id: string) => {
    setDraft(null);
    setSelectedId(null);
    setMarkingsId(id);
  };

  const markingsAttr = markingsId
    ? attributes.find((a) => a.id === markingsId) ?? null
    : null;

  const startCreate = () => {
    setSelectedId(null);
    setDraft(blankAttribute());
  };

  const cancelCreate = () => setDraft(null);

  const commitCreate = () => {
    if (!draft) return;
    const created: HubAttribute = { ...draft, name: draft.name.trim() };
    setAttributes((prev) => [...prev, created]);
    setDraft(null);
    setSelectedId(created.id);
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

  const openDeactivate = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    setGuardrail({
      kind: 'deactivate-blocked',
      context: { attributeName: a.name, bindingCount: 6, policies: a.policyNames },
    });
  };

  const reorderAttributes = (activeId: string, overId: string) => {
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

  const createEnabled = !!draft && draft.name.trim().length > 0 && !!draft.type;

  return (
    <WalkthroughFocusProvider>
      <div className={styles['console']}>
        <ConsoleSidebar
          className={sidebarStyles['console-sidebar--product']}
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          username="leonard.riley"
          categories={HUB_SIDEBAR_CATEGORIES}
          activeItemId={HUB_ACTIVE_ITEM}
        />
        <div className={styles['console__center']}>
          <ConsolePageHeader
            title={
              markingsAttr
                ? `${markingsAttr.name} markings`
                : creating
                  ? 'New attribute'
                  : active
                    ? active.name || 'Untitled attribute'
                    : 'Manage Attributes'
            }
            subtitle={
              markingsAttr
                ? 'Read-only — ranked tiers and their nested handling markings.'
                : creating
                  ? draft &&
                    (draft.values.length > 0 || draft.appliesTo.length > 0)
                    ? subtitle(draft)
                    : 'Name the attribute, choose a type, and pick where it applies.'
                  : active
                    ? subtitle(active)
                    : 'Define an attribute once, then choose which resources can use it.'
            }
            backButton={!!active || !!markingsAttr}
            onBack={() => {
              setDraft(null);
              setSelectedId(null);
              setMarkingsId(null);
            }}
            trailing={
              markingsAttr ? undefined : creating ? (
                <div className={styles['console__create-actions']}>
                  <Button
                    emphasis="Tertiary"
                    size="Medium"
                    onClick={cancelCreate}
                  >
                    Cancel
                  </Button>
                  <Button
                    emphasis="Primary"
                    size="Medium"
                    disabled={!createEnabled}
                    onClick={commitCreate}
                  >
                    Create attribute
                  </Button>
                </div>
              ) : active && isSourceOwned(active) ? (
                <MvpConnectionPill
                  status={connectionStatus(active)}
                  size="Medium"
                />
              ) : undefined
            }
          />
          <div className={styles['console__scroll']}>
            <Scrollbars>
              <div className={styles['console__content']}>
                {markingsAttr ? (
                  <MvpMarkingsPage attribute={markingsAttr} />
                ) : active ? (
                  <MvpDetailView
                    attribute={active}
                    creating={creating}
                    onDefinitionChange={(next) =>
                      mutate((a) => ({ ...a, ...next }))
                    }
                    onAddValue={addValue}
                    onDeleteValue={deleteValue}
                    onToggleValueDisabled={toggleValueDisabled}
                    onBindingChange={bindingChange}
                    onReadIntoFilteringChange={readIntoFilteringChange}
                    onAddResource={addResource}
                    onRemoveResource={removeResource}
                    allowedOn={allowedOn}
                    onConnectSource={connectSource}
                    inheritanceFor={(cfg) => inheritanceFor(active, cfg)}
                    onInheritanceChange={setInheritance}
                    nameOnResourceFor={(resource) =>
                      nameOnResourceFor(active, resource)
                    }
                    onNameOnResourceChange={setNameOnResource}
                    nameRef={(el) => {
                      nameRef.current = el;
                    }}
                  />
                ) : (
                  <MvpCatalogListing
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
                    onOpenMarkings={openMarkings}
                    onReorderAttributes={reorderAttributes}
                    onDeactivate={openDeactivate}
                    onDelete={openDelete}
                  />
                )}
              </div>
            </Scrollbars>
          </div>
        </div>

        <GuardrailDialog
          kind={guardrail?.kind ?? null}
          context={guardrail?.context ?? { attributeName: '' }}
          onClose={() => setGuardrail(null)}
          onConfirm={confirmGuardrail}
        />
      </div>
    </WalkthroughFocusProvider>
  );
}
