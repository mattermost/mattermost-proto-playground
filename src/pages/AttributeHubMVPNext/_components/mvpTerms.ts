import {
  inheritanceParentKind,
  hasInheritanceParent,
  SYNC_WHO_SETS,
  type AttrType,
  type AttrValue,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
  type SourceSystem,
  type WhoSets,
} from '@/pages/AttributeManagementHub/hubData';

/**
 * MVP-local terminology + sync + inheritance helpers (build brief §Terminology,
 * §External source, §Inheritance). Everything here is localized to the MVP scene
 * so the shared `hubData.ts` stays untouched. Imports from `hubData` are
 * read-only.
 */

// ─── Terminology (brief §Terminology) ───────────────────────────────────────

/**
 * Listing / definition count label. "N options" for every option-bearing type
 * (Select, Multiselect, Ranked, Ranked-hierarchical). Ranked-hierarchical counts
 * every tier and nested marking. "Free text" for Text.
 */
function countAllOptions(values: AttrValue[]): number {
  let n = 0;
  const walk = (vs: AttrValue[]) => {
    for (const v of vs) {
      n += 1;
      if (v.children?.length) {
        walk(v.children);
      }
    }
  };
  walk(values);
  return n;
}

export function optionCountLabel(a: HubAttribute): string {
  if (a.type === 'Text') return 'Free text';
  const n =
    a.type === 'Ranked-hierarchical'
      ? countAllOptions(a.values)
      : a.values.length;
  return `${n} ${n === 1 ? 'option' : 'options'}`;
}

/** Per-resource naming control label — "Name on {resource}" (brief). */
export function nameOnResourceLabel(resource: ResourceKind): string {
  return `Name on ${resource}`;
}

// ─── External source + sync status (brief §External source) ──────────────────

const PLUGIN_NAME_BY_SYSTEM: Partial<Record<SourceSystem, string>> = {
  UAS: 'User Attribute Sync',
  SCIM: 'SCIM Provisioner',
};

/** Core Mattermost sync — not installed plugins. */
export const CORE_SYNC_SYSTEMS: SourceSystem[] = ['LDAP', 'SAML'];

const CORE_SYNC_BAR_LABEL: Partial<Record<SourceSystem, string>> = {
  LDAP: 'Synced with AD/LDAP',
  SAML: 'Synced with SAML',
};

const CORE_SYNC_LISTING_LABEL: Partial<Record<SourceSystem, string>> = {
  LDAP: 'AD/LDAP',
  SAML: 'SAML',
};

const CORE_SYNC_FILTER_LABEL: Partial<Record<SourceSystem, string>> = {
  LDAP: 'AD/LDAP',
  SAML: 'SAML',
};

export function isCoreSyncSource(attribute: HubAttribute): boolean {
  return (
    attribute.source.kind === 'synced' &&
    attribute.source.system != null &&
    CORE_SYNC_SYSTEMS.includes(attribute.source.system)
  );
}

export function isPluginManagedSource(attribute: HubAttribute): boolean {
  return attribute.source.kind === 'synced' && !isCoreSyncSource(attribute);
}

/** Installed plugin that owns a synced attribute (plugin-backed sources only). */
export function managedByPluginName(attribute: HubAttribute): string {
  if (attribute.source.kind !== 'synced' || isCoreSyncSource(attribute)) {
    return '';
  }
  return (
    attribute.source.pluginName ??
    (attribute.source.system
      ? PLUGIN_NAME_BY_SYSTEM[attribute.source.system]
      : undefined) ??
    'External Attribute Plugin'
  );
}

export function managedByPluginLabel(attribute: HubAttribute): string {
  return `Managed by ${managedByPluginName(attribute)}`;
}

export function managedSourceBarLabel(attribute: HubAttribute): string {
  if (isCoreSyncSource(attribute) && attribute.source.system) {
    return (
      CORE_SYNC_BAR_LABEL[attribute.source.system] ??
      `Synced with ${attribute.source.system}`
    );
  }
  return managedByPluginLabel(attribute);
}

export function managedSourceListingLabel(attribute: HubAttribute): string {
  if (isCoreSyncSource(attribute) && attribute.source.system) {
    return (
      CORE_SYNC_LISTING_LABEL[attribute.source.system] ??
      attribute.source.system
    );
  }
  return managedByPluginName(attribute);
}

/** Label for read-in / config copy (core source name or plugin name). */
export function managedSourceConfigLabel(attribute: HubAttribute): string {
  if (isCoreSyncSource(attribute) && attribute.source.system) {
    return (
      CORE_SYNC_LISTING_LABEL[attribute.source.system] ??
      attribute.source.system
    );
  }
  return managedByPluginName(attribute);
}

export function managedSourceActionLabel(attribute: HubAttribute): string {
  return isCoreSyncSource(attribute) ? 'Manage configuration' : 'Plugin settings';
}

export function managedSourceReadOnlyHint(attribute: HubAttribute): string {
  if (isCoreSyncSource(attribute)) {
    return 'Name, type, and values are synced from the external source and are read-only here.';
  }
  return 'Name, type, and values are owned by the plugin and are read-only here.';
}

export function managedSourceDisconnectedHint(attribute: HubAttribute): string {
  if (isCoreSyncSource(attribute) && attribute.source.system === 'LDAP') {
    return 'AD/LDAP sync is disconnected. Values may be out of date until the connection is restored.';
  }
  if (isCoreSyncSource(attribute) && attribute.source.system === 'SAML') {
    return 'SAML sync is disconnected. Values may be out of date until the connection is restored.';
  }
  const name = managedByPluginName(attribute);
  return `${name} is disconnected. Values may be out of date until the connection is restored.`;
}

/** Who-can-set chip label when the sync system owns assignment. */
export function syncSetterDisplayLabel(
  attribute: HubAttribute,
  relationalDefault: string | null | undefined,
): string {
  if (
    relationalDefault != null &&
    SYNC_WHO_SETS.includes(relationalDefault as WhoSets)
  ) {
    if (relationalDefault === 'LDAP') {
      return 'AD/LDAP';
    }
    if (relationalDefault === 'SAML') {
      return 'SAML';
    }
    return managedByPluginName(attribute);
  }
  return relationalDefault ?? '';
}

/** Locked who-can-set hint — uses the sync owner label (AD/LDAP, SAML, plugin name). */
export function syncSetterLockedHint(
  attribute: HubAttribute,
  relationalDefault: string | null | undefined,
): string {
  if (
    relationalDefault != null &&
    SYNC_WHO_SETS.includes(relationalDefault as WhoSets)
  ) {
    return `Set by ${syncSetterDisplayLabel(attribute, relationalDefault)} — not editable.`;
  }
  return 'Set by the sync system — not editable.';
}

export const MVP_MANUAL_SOURCE_LABEL = 'Managed here';

/** Classification is authored on the dedicated markings page, not in-hub. */
export const MVP_CLASSIFICATION_SOURCE_LABEL = 'Classification Markings';

/** Source column label for manually-managed attributes. */
export function mvpManualSourceOwnershipLabel(
  attribute: HubAttribute,
): string {
  if (attribute.id === 'classification') {
    return MVP_CLASSIFICATION_SOURCE_LABEL;
  }
  return MVP_MANUAL_SOURCE_LABEL;
}

export type MvpSourceFilter = 'All sources' | 'Managed here' | SourceSystem;

export function mvpSourceFilterLabel(filter: MvpSourceFilter): string {
  if (filter === 'All sources') {
    return filter;
  }
  if (filter === 'Managed here') {
    return filter;
  }
  if (CORE_SYNC_FILTER_LABEL[filter as SourceSystem]) {
    return CORE_SYNC_FILTER_LABEL[filter as SourceSystem]!;
  }
  return PLUGIN_NAME_BY_SYSTEM[filter as SourceSystem] ?? filter;
}

/** Plugin connectivity as exposed in the attribute hub — not upstream sync detail. */
export type PluginStatus = 'active' | 'disconnected';

export function pluginStatus(a: HubAttribute): PluginStatus {
  if (a.source.kind !== 'synced') {
    return 'disconnected';
  }
  if (!isCoreSyncSource(a) && a.source.pluginActive === false) {
    return 'disconnected';
  }
  if (a.source.state !== 'Synced') {
    return 'disconnected';
  }
  return 'active';
}

export function pluginStatusLabel(status: PluginStatus): string {
  return status === 'active' ? 'Active' : 'Disconnected';
}

/**
 * Sources offered in the ADD connect flow — LDAP + SAML only (existing product
 * capability). UAS / SCIM / other plugins are NOT connectable here; they appear
 * already-synced on attributes that already carry them.
 */
export const CONNECTABLE_SOURCES: SourceSystem[] = ['LDAP', 'SAML'];

export interface ConnectSourceOption {
  system: SourceSystem;
  title: string;
  description: string;
}

export const CONNECT_SOURCE_OPTIONS: ConnectSourceOption[] = [
  {
    system: 'LDAP',
    title: 'AD/LDAP',
    description: 'Sync with your directory of record',
  },
  {
    system: 'SAML',
    title: 'SAML',
    description: 'Map values from SAML at sign-in',
  },
];

/** Deep link out to the installed plugin configuration ("Plugin settings"). */
export function manageConnectionHref(system: SourceSystem | undefined): string {
  switch (system) {
    case 'LDAP':
      return 'https://docs.mattermost.com/configure/authentication-configuration-settings.html';
    case 'SAML':
      return 'https://docs.mattermost.com/onboard/sso-saml.html';
    default:
      return 'https://docs.mattermost.com/configure/environment-configuration-settings.html';
  }
}

// ─── Inheritance + ceiling rule (brief §Inheritance) ─────────────────────────

/**
 * Ceiling ("Override rules") modes.
 * Ranked / Ranked-hierarchical get the full ranked set; every other type gets
 * the reduced set (no below/above).
 */
export type CeilingMode =
  | 'no-constraint'
  | 'not-below'
  | 'not-above'
  | 'locked'
  | 'inherit-default';

export interface CeilingOption {
  key: CeilingMode;
  label: string;
}

const RANKED_CEILING: CeilingOption[] = [
  { key: 'no-constraint', label: 'No constraint' },
  { key: 'not-below', label: 'Cannot go below the parent value' },
  { key: 'not-above', label: 'Cannot go above the parent value' },
  { key: 'locked', label: 'Locked to the parent value' },
];

const OTHER_CEILING: CeilingOption[] = [
  { key: 'inherit-default', label: 'Inherit as default (overridable)' },
  { key: 'locked', label: 'Locked to the parent value' },
];

export function isRankedType(type: AttrType): boolean {
  return type === 'Ranked' || type === 'Ranked-hierarchical';
}

export function ceilingOptions(type: AttrType): CeilingOption[] {
  return isRankedType(type) ? RANKED_CEILING : OTHER_CEILING;
}

/** Default ceiling mode when inheritance is first turned on, per type. */
export function defaultCeilingMode(type: AttrType): CeilingMode {
  return isRankedType(type) ? 'no-constraint' : 'inherit-default';
}

/**
 * Inheritance UI is edge-scoped on the CHILD binding and self-hiding: it appears
 * only when the child's parent resource is also applied (Posts←Channels,
 * Channels←Teams). If no parent+child pair is applied, no inheritance UI shows
 * anywhere.
 */
export function showsInheritance(
  attribute: HubAttribute,
  resource: ResourceKind,
): boolean {
  return (
    inheritanceParentKind(resource) != null &&
    hasInheritanceParent(attribute, resource)
  );
}

export function inheritanceParentLabel(resource: ResourceKind): string | null {
  const parent = inheritanceParentKind(resource);
  return parent ? parent.replace(/s$/, '') : null;
}

/**
 * Enforcement posture per edge: Post edges are advisory (warn, not block);
 * Channel (and other) edges are enforced.
 */
export function inheritanceEnforcement(
  resource: ResourceKind,
): 'advisory' | 'enforced' {
  return resource === 'Posts' ? 'advisory' : 'enforced';
}

/** Local per-binding inheritance state — layered over ResourceConfig at runtime. */
export interface InheritanceState {
  on: boolean;
  ceiling: CeilingMode;
}

/**
 * Read the current inheritance state from the (shared, read-only) config shape.
 * The shared model only carries `inheritMode: off | inherit | inherit-lock`, so
 * we widen it into the MVP's on/off + ceiling model without mutating the shared
 * type. `inherit-lock` maps to the "Locked to the parent value" ceiling.
 */
export function readInheritance(
  cfg: ResourceConfig,
  type: AttrType,
): InheritanceState {
  const mode = cfg.inheritMode ?? (cfg.inheritToChild ? 'inherit-lock' : 'off');
  if (mode === 'off') {
    return { on: false, ceiling: defaultCeilingMode(type) };
  }
  if (mode === 'inherit-lock') {
    return { on: true, ceiling: 'locked' };
  }
  return { on: true, ceiling: defaultCeilingMode(type) };
}
