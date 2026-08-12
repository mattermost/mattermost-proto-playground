import { useEffect, useMemo, useRef, useState } from 'react';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Button from '@/components/ui/Button/Button';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import SyncPill from '@/pages/AttributeManagementHub/_components/SyncPill/SyncPill';
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
  eligibility,
  isPolicyLocked,
  isSourceOwned,
  newAttributeId,
  policyLabel,
  type AccessGrant,
  type AttrValue,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import SimplifiedDetailView from './_components/SimplifiedDetailView';
import ConnectSourceModal from './_components/ConnectSourceModal';
import CatalogListing from './_components/CatalogListing';
import LinkValuesModal from './_components/LinkValuesModal';
import {
  displayType,
  syncValuesWithType,
  assignSequentialTiers,
  comparesRank,
  findValueByLabel,
  markResourceIntroducedValue,
  resolveValueLink,
  setValueLinkConfig,
  suggestValueMappings,
  type ValueLinkConfig,
} from './_components/simplifiedModel';
import styles from './AttributeHubSimplified.module.scss';

type GuardrailState = { kind: GuardrailKind; context: GuardrailContext } | null;
type Editors = { roles: AccessGrant[]; users: AccessGrant[] };

const SYSTEM_SUBJECTS = ['UAS sync (system)', 'LDAP sync (system)', 'SAML sync (system)', 'SCIM sync (system)'];

/** Merge the old two-mode access model into one editors set (§4 collapse). */
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
    displayType(a),
    `Applies to ${a.appliesTo.map((c) => c.resource).join(', ') || 'nothing yet'}`,
  ];
  if (a.usedByPolicies > 0) parts.push(policyLabel(a.usedByPolicies));
  const elig = eligibility(a);
  parts.push(elig.eligible ? 'Usable in policies' : 'Not usable in policies');
  return parts.join(' · ');
}

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
 * Attribute Management — Simplified variation. Assembles the resolved
 * section-by-section redesign (spec 29): merged Definition/Values, first-class
 * Applies-to (summary rows), single Who-can-edit, and create-as-detail.
 */
export interface AttributeHubSimplifiedProps {
  /** Collapsed applies-to row summary — chips (default) or inline secondary text. */
  appliesToRowSummary?: 'chips' | 'inline';
  /**
   * Channel Attributes walkthrough alignment (2026-08-06): banner open to every
   * attribute type, display location a per-channel default, value-editability
   * rule on the attribute, and classification deferred to its own setup page.
   */
  channelAlignment?: boolean;
  /** Move the "Changing the value" rule onto each Applies-to binding. */
  perResourceEditability?: boolean;
}

export default function AttributeHubSimplified({
  appliesToRowSummary = 'chips',
  channelAlignment = false,
  perResourceEditability = false,
}: AttributeHubSimplifiedProps = {}) {
  const params = readParams();

  const [attributes, setAttributes] = useState<HubAttribute[]>(HUB_ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string | null>(
    params.get('flow') === 'new' ? null : params.get('attr'),
  );
  const [draft, setDraft] = useState<HubAttribute | null>(
    params.get('flow') === 'new' ? blankAttribute() : null,
  );
  const [editorsById, setEditorsById] = useState<Record<string, Editors>>({});

  const [selectedResources, setSelectedResources] = useState<ResourceKind[]>([]);
  const [source, setSource] = useState('All sources');
  const [query, setQuery] = useState('');
  const [connectSourceMode, setConnectSourceMode] = useState<
    'connect' | 'manage' | null
  >(null);
  const [guardrail, setGuardrail] = useState<GuardrailState>(null);
  const [linkValuesOpen, setLinkValuesOpen] = useState(false);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const creating = draft !== null;

  // Auto-focus Name on create-mode open.
  useEffect(() => {
    if (creating) nameRef.current?.focus();
  }, [creating]);

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

  // ── Mutation on the active attribute (persisted or draft) ─────────────────
  const mutate = (fn: (a: HubAttribute) => HubAttribute) => {
    if (draft) {
      setDraft((d) => (d ? fn(d) : d));
    } else if (selectedId) {
      setAttributes((prev) => prev.map((a) => (a.id === selectedId ? fn(a) : a)));
    }
  };

  // Assign missing ranks when opening a ranked attribute.
  useEffect(() => {
    if (!active) return;
    const synced = syncValuesWithType(active);
    if (synced.values === active.values) return;
    mutate(() => synced);
  }, [active?.id, active?.type]);

  const setEditors = (next: Editors) => {
    if (!active) return;
    setEditorsById((m) => ({ ...m, [active.id]: next }));
  };

  const openValuesLocked = () => {
    if (!active) return;
    setGuardrail({
      kind: 'values-locked',
      context: { attributeName: active.name, policies: active.policyNames },
    });
  };

  // ── Value editing (mirrors baseline behavior) ─────────────────────────────
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
    mutate((a) => {
      let values = prune(a.values);
      if (comparesRank(displayType(a))) {
        values = assignSequentialTiers(values);
      }
      return { ...a, values };
    });
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

  const relabelValue = (valueId: string, label: string) => {
    if (!active) return;
    if (isPolicyLocked(active)) return openValuesLocked();
    const rename = (vs: AttrValue[]): AttrValue[] =>
      vs.map((v) => ({
        ...v,
        label: v.id === valueId ? label : v.label,
        children: v.children ? rename(v.children) : undefined,
      }));
    mutate((a) => ({ ...a, values: rename(a.values) }));
  };

  const setValueRank = (valueId: string, tier: number) => {
    if (!active) return;
    if (isPolicyLocked(active)) return openValuesLocked();
    mutate((a) => {
      let values = a.values;
      if (comparesRank(displayType(a)) && values.some((v) => v.tier == null)) {
        values = assignSequentialTiers(values);
      }
      const target = values.find((v) => v.id === valueId);
      if (!target || target.tier == null) return { ...a, values };
      const ranked = values.filter((v) => v.tier != null);
      const others = ranked.filter((v) => v.id !== valueId);
      const clamped = Math.max(1, Math.min(tier, ranked.length));
      // Order others by current tier ascending, then splice target in at slot.
      others.sort((x, y) => (x.tier ?? 0) - (y.tier ?? 0));
      const reordered: AttrValue[] = [];
      others.forEach((v, i) => {
        if (i + 1 === clamped) reordered.push(target);
        reordered.push(v);
      });
      if (reordered.length < ranked.length) reordered.push(target);
      let t = 1;
      const tierMap = new Map<string, number>();
      reordered.forEach((v) => tierMap.set(v.id, t++));
      const valuesOut = values.map((v) =>
        v.tier != null ? { ...v, tier: tierMap.get(v.id) ?? v.tier } : v,
      );
      return { ...a, values: valuesOut };
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

  const addResourceValue = (resource: ResourceKind, label: string) => {
    if (!active) return;
    if (isPolicyLocked(active)) return openValuesLocked();
    if (isSourceOwned(active)) return;

    const trimmed = label.trim();
    if (!trimmed) return;

    const existing = findValueByLabel(active.values, trimmed);
    if (existing) {
      mutate((a) => ({
        ...a,
        appliesTo: a.appliesTo.map((c) => {
          if (c.resource !== resource) return c;
          const disabled = new Set(c.disabledValueIds ?? []);
          disabled.delete(existing.id);
          return {
            ...c,
            disabledValueIds: disabled.size > 0 ? Array.from(disabled) : [],
          };
        }),
      }));
      markResourceIntroducedValue(active.id, resource, existing.id);
      return;
    }

    const type = displayType(active);
    const ranked = comparesRank(type);
    const nextTier =
      ranked && active.type !== 'Ranked-hierarchical'
        ? active.values.filter((v) => v.tier != null).length + 1
        : undefined;
    const value: AttrValue = { id: `v-${Date.now()}`, label: trimmed, tier: nextTier };

    mutate((a) => {
      let values = [...a.values, value];
      if (comparesRank(displayType(a))) {
        values = assignSequentialTiers(values);
      }
      const newId =
        values.find((v) => v.label.trim().toLowerCase() === trimmed.toLowerCase())
          ?.id ?? value.id;

      markResourceIntroducedValue(a.id, resource, newId);

      return {
        ...a,
        values,
        appliesTo: a.appliesTo.map((c) => {
          const disabled = new Set(c.disabledValueIds ?? []);
          if (c.resource === resource) {
            disabled.delete(newId);
          } else {
            disabled.add(newId);
          }
          return {
            ...c,
            disabledValueIds: disabled.size > 0 ? Array.from(disabled) : [],
          };
        }),
      };
    });
  };

  const readIntoFilteringChange = (value: boolean) => {
    mutate((a) => ({ ...a, readIntoFiltering: value }));
  };

  const addResource = (resource: ResourceKind) => {
    mutate((a) =>
      a.appliesTo.some((c) => c.resource === resource)
        ? a
        : { ...a, appliesTo: [...a.appliesTo, defaultResourceConfig(resource)] },
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

  const activeValueLink = active ? resolveValueLink(active) : null;

  const confirmGuardrail = () => {
    if (guardrail?.kind === 'remove-binding') {
      const resource = guardrail.context.resource as ResourceKind | undefined;
      if (resource) {
        mutate((a) => ({
          ...a,
          appliesTo: a.appliesTo.filter((c) => c.resource !== resource),
        }));
      }
    }
    if (guardrail?.kind === 'unlink-gated' && active) {
      mutate((a) => ({ ...a, valuesLink: undefined }));
      setValueLinkConfig(active.id, null);
    }
    if (guardrail?.kind === 'delete-blocked') {
      // no-op — informational block
    }
    setGuardrail(null);
  };

  const handleLinkValues = (config: ValueLinkConfig) => {
    if (!active) return;
    const src = attributes.find((attribute) => attribute.id === config.attributeId);
    if (!src) return;

    mutate((a) => {
      const next: HubAttribute = {
        ...a,
        valuesLink: {
          attributeId: config.attributeId,
          attributeName: config.attributeName,
        },
      };
      if (config.mode === 'exact') {
        next.values = src.values.map((value) => ({ ...value }));
        if (comparesRank(displayType(src))) {
          next.type = src.type;
        }
      }
      return next;
    });
    setValueLinkConfig(active.id, {
      ...config,
      mappings:
        config.mode === 'mapped'
          ? config.mappings ?? suggestValueMappings(active.values, src.values)
          : undefined,
    });
    setLinkValuesOpen(false);
  };

  const openUnlinkGate = () => {
    if (!active || !activeValueLink) return;
    const linked = attributes.find(
      (attribute) => attribute.id === activeValueLink.attributeId,
    );
    const policies = Array.from(
      new Set([...active.policyNames, ...(linked?.policyNames ?? [])]),
    );
    setGuardrail({
      kind: 'unlink-gated',
      context: {
        attributeName: active.name,
        linkedName: activeValueLink.attributeName,
        policies,
      },
    });
  };

  // ── Detail / create navigation ────────────────────────────────────────────
  const openDetail = (id: string) => {
    setDraft(null);
    setSelectedId(id);
  };

  const startCreate = () => {
    setSelectedId(null);
    setDraft(blankAttribute());
  };

  const cancelCreate = () => setDraft(null);

  const commitCreate = () => {
    if (!draft) return;
    const created: HubAttribute = { ...draft, name: draft.name.trim() };
    setAttributes((prev) => [...prev, created]);
    // Editors keyed by draft.id carry over — the persisted attribute reuses the id.
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

  const openDeactivate = (id: string) => {
    const a = attributes.find((x) => x.id === id);
    if (!a) return;
    setGuardrail({
      kind: 'deactivate-blocked',
      context: { attributeName: a.name, bindingCount: 6, policies: a.policyNames },
    });
  };

  const createEnabled = !!draft && draft.name.trim().length > 0 && !!draft.type;

  return (
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
            creating
              ? 'New attribute'
              : active
                ? active.name || 'Untitled attribute'
                : 'Manage Attributes'
          }
          subtitle={
            creating
              ? draft && (draft.values.length > 0 || draft.appliesTo.length > 0)
                ? subtitle(draft)
                : 'Not yet usable in policies — add values and a resource.'
              : active
                ? subtitle(active)
                : 'Create attributes once and configure where they apply across users, channels, posts, and teams.'
          }
          backButton={!!active}
          onBack={() => {
            setDraft(null);
            setSelectedId(null);
          }}
          trailing={
            creating ? (
              <div className={styles['console__create-actions']}>
                <Button emphasis="Tertiary" size="Medium" onClick={cancelCreate}>
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
            ) : active && isSourceOwned(active) && active.source.state ? (
              <SyncPill
                state={active.source.state}
                system={active.source.system}
                size="Medium"
              />
            ) : undefined
          }
        />
        <div className={styles['console__scroll']}>
          <Scrollbars>
            <div className={styles['console__content']}>
              {active ? (
                <SimplifiedDetailView
                  attribute={active}
                  attributes={attributes}
                  valueLink={activeValueLink}
                  creating={creating}
                  onDefinitionChange={(next) =>
                    mutate((a) => syncValuesWithType({ ...a, ...next }))
                  }
                  onAddValue={addValue}
                  onAddChild={addChild}
                  onToggleValueDisabled={toggleValueDisabled}
                  onDeleteValue={deleteValue}
                  onReorderValue={reorderValue}
                  onRelabelValue={relabelValue}
                  onSetValueRank={setValueRank}
                  onValuesLockedAttempt={openValuesLocked}
                  onBindingChange={bindingChange}
                  onAddResourceValue={addResourceValue}
                  onReadIntoFilteringChange={readIntoFilteringChange}
                  onAddResource={addResource}
                  onRemoveResource={removeResource}
                  editors={editors}
                  onEditorsChange={setEditors}
                  onConnectSource={() => setConnectSourceMode('connect')}
                  onManageSource={() => setConnectSourceMode('manage')}
                  onLinkValues={() => setLinkValuesOpen(true)}
                  onEditLink={() => setLinkValuesOpen(true)}
                  onUnlinkValues={openUnlinkGate}
                  nameRef={(el) => {
                    nameRef.current = el;
                  }}
                  appliesToRowSummary={appliesToRowSummary}
                  channelAlignment={channelAlignment}
                  perResourceEditability={perResourceEditability}
                />
              ) : (
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
                  onDelete={openDelete}
                />
              )}
            </div>
          </Scrollbars>
        </div>
      </div>

      {active && connectSourceMode && (
        <ConnectSourceModal
          attribute={active}
          mode={connectSourceMode}
          onClose={() => setConnectSourceMode(null)}
        />
      )}

      {active && linkValuesOpen && (
        <LinkValuesModal
          current={active}
          attributes={attributes}
          existing={activeValueLink}
          onClose={() => setLinkValuesOpen(false)}
          onConfirm={handleLinkValues}
        />
      )}

      <GuardrailDialog
        kind={guardrail?.kind ?? null}
        context={guardrail?.context ?? { attributeName: '' }}
        onClose={() => setGuardrail(null)}
        onConfirm={confirmGuardrail}
      />
    </div>
  );
}
