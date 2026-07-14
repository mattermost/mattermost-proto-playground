import {
  inheritanceParentKind,
  hasInheritanceParent,
  type AttrType,
  type AttrValue,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
  type SourceSystem,
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

/** Sync status shrinks to connected / broken only (brief). */
export type ConnectionStatus = 'connected' | 'broken';

/**
 * Map the shared SyncState (Synced / Stale / Failed / Unreachable) down to the
 * MVP's two-state model. Only a clean "Synced" reads as connected; every other
 * state (stale, failed, unreachable) reads as broken and needs attention.
 */
export function connectionStatus(a: HubAttribute): ConnectionStatus {
  return a.source.state === 'Synced' ? 'connected' : 'broken';
}

export function connectionLabel(status: ConnectionStatus): string {
  return status === 'connected' ? 'Connected' : 'Broken';
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
    title: 'LDAP / AD',
    description:
      'Sync options and assigned values from your directory of record.',
  },
  {
    system: 'SAML',
    title: 'SAML',
    description: 'Map values from SAML assertions provided at sign-in.',
  },
];

/** Deep link out to the source/plugin configuration ("Manage connection"). */
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
