import { useEffect, useMemo, useRef, useState } from 'react';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import AdminPanelFooter from '@/components/ui/AdminPanelFooter/AdminPanelFooter';
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
import { connectionStatus } from './_components/mvpTerms';
import WalkthroughFocusProvider from '@/components/walkthrough/WalkthroughFocusProvider';
import styles from './AttributeHubMVPNext.module.scss';

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
    displayName: '',
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

function attributeLabel(a: HubAttribute): string {
  return a.displayName?.trim() || a.name.trim() || 'Untitled attribute';
}

function normalizeAttribute(a: HubAttribute): HubAttribute {
  const displayName = a.displayName?.trim();
  return {
    ...a,
    name: a.name.trim(),
    displayName: displayName === '' ? undefined : displayName,
  };
}

function snapshotAttribute(a: HubAttribute): string {
  return JSON.stringify(normalizeAttribute(a));
}

function initialEditorState(
  params: URLSearchParams,
  catalog: HubAttribute[],
): {
  draft: HubAttribute | null;
  selectedId: string | null;
  savedSnapshot: string;
} {
  if (params.get('flow') === 'new') {
    const blank = blankAttribute();
    return {
      draft: blank,
      selectedId: null,
      savedSnapshot: snapshotAttribute(blank),
    };
  }
  const attrId = params.get('attr');
  if (attrId != null && attrId !== READONLY_ATTR_ID) {
    const attr = catalog.find((a) => a.id === attrId);
    if (attr) {
      const clone = structuredClone(attr);
      return {
        draft: clone,
        selectedId: attrId,
        savedSnapshot: snapshotAttribute(clone),
      };
    }
  }
  return { draft: null, selectedId: null, savedSnapshot: '' };
}

/**
 * Manage Attributes — MVP (P0) working copy. Served at the canonical
 * `/prototypes/attribute-hub-mvp` route so shared links open this iteration.
 * Frozen snapshot lives at `/prototypes/attribute-hub-mvp-next`. Deep-links:
 * ?attr=<id>, ?flow=new, ?allowed=on, ?resource=Channels|Users|Posts
 * (comma-separated).
 */
export default function AttributeHubMVPNext() {
  const params = readParams();
  const allowedOn = params.get('allowed') === 'on';

  const [attributes, setAttributes] = useState<HubAttribute[]>(HUB_ATTRIBUTES);
  const initialEditor = initialEditorState(params, HUB_ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialEditor.selectedId,
  );
  const [draft, setDraft] = useState<HubAttribute | null>(initialEditor.draft);
  const [savedSnapshot, setSavedSnapshot] = useState(initialEditor.savedSnapshot);
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

  const displayNameRef = useRef<HTMLInputElement | null>(null);
  const creating = draft !== null && selectedId === null;

  useEffect(() => {
    if (creating) displayNameRef.current?.focus();
  }, [creating]);

  const dirty =
    draft != null && snapshotAttribute(draft) !== savedSnapshot;
  const saveEnabled =
    draft != null &&
    (draft.displayName?.trim().length ?? 0) + draft.name.trim().length > 0;

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
    setDraft((current) => (current ? fn(current) : current));
  };

  const addValue = (label: string) => {
    if (!draft) return;
    const isRanked = draft.type === 'Ranked';
    const nextTier = isRanked
      ? draft.values.filter((v) => v.tier != null).length + 1
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
    if (!draft) return;
    const target = draft.values.find((v) => v.id === valueId);
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
    const attr = attributes.find((a) => a.id === id);
    if (!attr) return;
    const clone = structuredClone(attr);
    setDraft(clone);
    setSavedSnapshot(snapshotAttribute(clone));
    setSelectedId(id);
    setMarkingsId(null);
  };

  const openMarkings = (id: string) => {
    setDraft(null);
    setSavedSnapshot('');
    setSelectedId(null);
    setMarkingsId(id);
  };

  const markingsAttr = markingsId
    ? attributes.find((a) => a.id === markingsId) ?? null
    : null;

  const startCreate = () => {
    const blank = blankAttribute();
    setSelectedId(null);
    setDraft(blank);
    setSavedSnapshot(snapshotAttribute(blank));
    setMarkingsId(null);
  };

  const handleSave = () => {
    if (!draft || !saveEnabled) return;
    const saved = normalizeAttribute(draft);
    if (creating) {
      setAttributes((prev) => [...prev, saved]);
      setSelectedId(saved.id);
    } else if (selectedId) {
      setAttributes((prev) =>
        prev.map((a) => (a.id === selectedId ? saved : a)),
      );
    }
    const nextDraft = structuredClone(saved);
    setDraft(nextDraft);
    setSavedSnapshot(snapshotAttribute(nextDraft));
  };

  const handleCancel = () => {
    if (creating) {
      setDraft(null);
      setSavedSnapshot('');
      setSelectedId(null);
      return;
    }
    if (selectedId) {
      const attr = attributes.find((a) => a.id === selectedId);
      if (!attr) return;
      const reset = structuredClone(attr);
      setDraft(reset);
      setSavedSnapshot(snapshotAttribute(reset));
    }
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
    if (selectedId === id) {
      setSelectedId(null);
      setDraft(null);
      setSavedSnapshot('');
    }
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
                : draft
                  ? creating
                    ? 'New attribute'
                    : attributeLabel(draft)
                  : 'Manage Attributes'
            }
            subtitle={
              markingsAttr
                ? 'Read-only — ranked tiers and their nested handling markings.'
                : draft
                  ? creating &&
                    draft.values.length === 0 &&
                    draft.appliesTo.length === 0
                    ? 'Add a display name, choose a type, and pick where it applies.'
                    : subtitle(draft)
                  : 'Define an attribute once, then choose which resources can use it.'
            }
            backButton={!!draft || !!markingsAttr}
            onBack={() => {
              setDraft(null);
              setSavedSnapshot('');
              setSelectedId(null);
              setMarkingsId(null);
            }}
            trailing={
              draft && !creating && isSourceOwned(draft) ? (
                <MvpConnectionPill
                  status={connectionStatus(draft)}
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
                ) : draft ? (
                  <MvpDetailView
                    attribute={draft}
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
                    displayNameRef={(el) => {
                      displayNameRef.current = el;
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
          {draft && !markingsAttr && (
            <AdminPanelFooter
              saveDisabled={!dirty || !saveEnabled}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
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
