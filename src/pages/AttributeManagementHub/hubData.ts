/**
 * Attribute Management Hub — self-contained data model.
 *
 * Catalog-first: one canonical list of every attribute (define-once). Values
 * are never deleted; source-owned attributes are read-only; policy-bound
 * attributes are locked. Seed data exercises every type + source state.
 *
 * No customer identities. Program masking uses codenames.
 */

export type AttrType =
  | 'Ranked'
  | 'Ranked-hierarchical'
  | 'Select'
  | 'Multiselect'
  | 'Text';

export type ResourceKind = 'Users' | 'Channels' | 'Posts' | 'Teams';

/** External-sync state. Text + color, never color alone. */
export type SyncState = 'Synced' | 'Stale' | 'Failed' | 'Unreachable';

export type SourceSystem = 'UAS' | 'LDAP' | 'SCIM';

export interface Source {
  kind: 'manual' | 'synced';
  system?: SourceSystem;
  state?: SyncState;
  /** One-line status shown on the Source section. */
  status?: string;
  fieldMap?: string;
  cadence?: string;
  lastSuccess?: string;
  /** Stale past the freshness budget → hard-block editing anything downstream. */
  pastBudget?: boolean;
}

/** A leaf/branch value. Ranked rows carry a tier; nested markings are display-only. */
export interface AttrValue {
  id: string;
  label: string;
  /** Tier number for ranked rows (undefined for display-only markings). */
  tier?: number;
  /** Display-only nested markings under a ranked tier. */
  children?: AttrValue[];
  /** Value disabled (not deleted) — kept for existing assignments. */
  disabled?: boolean;
  /** How many resources currently carry this value — blocks delete when > 0. */
  inUseCount?: number;
}

export type WhoSets =
  | 'System admin'
  | 'Channel admin'
  | 'Post author'
  | 'Team admin'
  | 'Members'
  | 'UAS'
  | 'LDAP'
  | 'SCIM';

export type DisplayWhere =
  | 'Header'
  | 'Sidebar'
  | 'Banner'
  | 'Hidden'
  | 'Info panel'
  | 'Composer';

/** Post binding surfaces — subset of DisplayWhere (no channel chrome). */
export type PostDisplayLoc = 'Composer' | 'Header';

export const POST_DISPLAY_LOCATIONS: PostDisplayLoc[] = [
  'Composer',
  'Header',
];

export type InheritMode = 'off' | 'inherit' | 'inherit-lock';

/** Whether an assigned value may change after it is set on a resource. */
export type ValueEditability = 'editable' | 'ratchet' | 'locked';

export const VALUE_EDITABILITY_OPTIONS: ValueEditability[] = [
  'editable',
  'ratchet',
  'locked',
];

export const VALUE_EDITABILITY_LABEL: Record<ValueEditability, string> = {
  editable: 'Editable',
  ratchet: 'Can only lower',
  locked: 'Locked after set',
};

/** Ranked types may ratchet (lower-only) after set; select types may not. */
export function supportsRatchetValueEditability(type: AttrType): boolean {
  return type === 'Ranked' || type === 'Ranked-hierarchical';
}

export function valueEditabilityOptionsForType(
  type: AttrType,
): ValueEditability[] {
  if (supportsRatchetValueEditability(type)) {
    return VALUE_EDITABILITY_OPTIONS;
  }
  return VALUE_EDITABILITY_OPTIONS.filter((option) => option !== 'ratchet');
}

export function coerceValueEditabilityForType(
  type: AttrType,
  editability: ValueEditability | undefined,
): ValueEditability {
  const resolved = editability ?? 'editable';
  if (resolved === 'ratchet' && !supportsRatchetValueEditability(type)) {
    return 'editable';
  }
  return resolved;
}

export function coerceAppliesToForType(
  type: AttrType,
  appliesTo: ResourceConfig[],
): ResourceConfig[] {
  return appliesTo.map((cfg) => {
    const valueEditability = coerceValueEditabilityForType(
      type,
      cfg.valueEditability,
    );
    if (valueEditability === cfg.valueEditability) return cfg;
    return { ...cfg, valueEditability };
  });
}

export function resolveValueEditability(cfg: ResourceConfig): ValueEditability {
  return cfg.valueEditability ?? 'editable';
}

export type UserProfileDisplay = 'always' | 'hide-empty';

/**
 * Who can set the value on this resource — a relational default (the natural
 * owner of the resource instance) plus additional grants. Merges the old
 * per-resource `whoSets` with the old global `assignToResources`.
 */
export interface WhoCanSet {
  /** Natural owner seeded when the resource is enabled. Removable. */
  relationalDefault: WhoSets | null;
  /** Roles / specific users / attribute-rules that can also set the value. */
  grants: AccessCapability;
}

export interface ResourceConfig {
  resource: ResourceKind;
  required: boolean;
  whoCanSet: WhoCanSet;
  /** Channels: header/sidebar/banner. Posts: message input / in-channel message view. */
  showWhere?: DisplayWhere[];
  /** Channels: how posts inherit. Teams: how channels inherit. */
  inheritMode?: InheritMode;
  /** @deprecated Prefer inheritMode. */
  inheritToChild?: boolean;
  /** Users only — profile visibility when empty. */
  userProfileDisplay?: UserProfileDisplay;
  /** Base value ids disabled for NEW assignments on this resource. */
  disabledValueIds?: string[];
  /** Whether the value may change after assignment. */
  valueEditability?: ValueEditability;
}

/** Capability delegation — owner + delegates per capability. */
export interface AccessGrant {
  /** Role or user label. */
  subject: string;
  /** True when this is the owner (cannot be removed). */
  owner?: boolean;
}

export interface AttributeAccessRule {
  id: string;
  attributeId: string;
  attributeLabel: string;
  operator: string;
  value: string;
}

export interface AccessCapability {
  roles: AccessGrant[];
  users: AccessGrant[];
  attributeRules: AttributeAccessRule[];
}

export interface AccessModel {
  editDefinition: AccessCapability;
  manageValues: AccessCapability;
}

export interface UserRuleAttribute {
  id: string;
  label: string;
  type: AttrType;
  values: string[];
}

/** Values inherited/mirrored from another attribute (read-only scale). */
export interface ValuesLink {
  attributeId: string;
  attributeName: string;
}

export interface HubAttribute {
  id: string;
  name: string;
  type: AttrType;
  description: string;
  values: AttrValue[];
  source: Source;
  appliesTo: ResourceConfig[];
  /** Read-only "used by N policies" — not a link. */
  usedByPolicies: number;
  /** Policy names for guardrail context. */
  policyNames: string[];
  access: AccessModel;
  /**
   * Hide values the acting admin isn't read into, everywhere they appear.
   * Forced true + non-editable for UAS; only meaningful when applies to Users.
   */
  readIntoFiltering: boolean;
  /** Values are inherited from another attribute (read-only, unlink-gated). */
  valuesLink?: ValuesLink;
  /** This attribute owns a scale that others mirror (unlink names them). */
  mirroredBy?: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Externally-synced attributes have read-only values. */
export function isSourceOwned(a: HubAttribute): boolean {
  return a.source.kind === 'synced';
}

/** Last-sync line for inline status rows (excludes cadence — shown on its own chip). */
export function lastSyncedLabel(source: Source): string | undefined {
  if (source.lastSuccess) {
    return `Last synced ${source.lastSuccess}`;
  }
  if (source.status) {
    return source.status.split(' · ')[0]?.trim() || source.status;
  }
  return undefined;
}

/** Values/order locked while bound to policies. */
export function isPolicyLocked(a: HubAttribute): boolean {
  return a.usedByPolicies > 0;
}

export function resolveInheritMode(cfg: ResourceConfig): InheritMode {
  if (cfg.inheritMode) return cfg.inheritMode;
  return cfg.inheritToChild ? 'inherit-lock' : 'off';
}

export function channelBinding(
  attribute: HubAttribute,
): ResourceConfig | undefined {
  return attribute.appliesTo.find((c) => c.resource === 'Channels');
}

export function teamBinding(
  attribute: HubAttribute,
): ResourceConfig | undefined {
  return attribute.appliesTo.find((c) => c.resource === 'Teams');
}

export function appliesToUsers(a: HubAttribute): boolean {
  return a.appliesTo.some((c) => c.resource === 'Users');
}

/** Read-into filtering is forced on (and locked) for UAS-owned attributes. */
export function readIntoForced(a: HubAttribute): boolean {
  return a.source.system === 'UAS';
}

/** Filtering only bites when it's on AND the attribute is a user attribute. */
export function readIntoActive(a: HubAttribute): boolean {
  return a.readIntoFiltering && appliesToUsers(a);
}

/**
 * Demo stand-in for the acting admin's read-into set (real deployments derive
 * this from identity). Keyed by attribute id → value ids the admin holds.
 */
export const ACTING_USER_HELD: Record<string, string[]> = {
  program: ['pg-aurora'],
};

/** Hide values the acting admin isn't read into (need-to-know). */
export function visibleValues(
  a: HubAttribute,
  values: AttrValue[],
): AttrValue[] {
  if (!readIntoActive(a)) return values;
  const held = ACTING_USER_HELD[a.id] ?? [];
  return values.filter((v) => held.includes(v.id));
}

/** True when any rank-and-file member can set the value on this binding. */
export function isMemberSettable(cfg: ResourceConfig): boolean {
  return (
    cfg.whoCanSet.relationalDefault === 'Members' ||
    cfg.whoCanSet.grants.roles.some((g) => g.subject === 'Members')
  );
}

/**
 * R3 — a child resource's setter is locked when its parent inherits with lock.
 * Team → Channel → Post.
 */
export function whoCanSetLock(
  a: HubAttribute,
  resource: ResourceKind,
): { locked: boolean; parent?: ResourceKind } {
  if (resource === 'Posts') {
    const post = a.appliesTo.find((c) => c.resource === 'Posts');
    if (post && resolveInheritMode(post) === 'inherit-lock') {
      return { locked: true, parent: 'Channels' };
    }
  }
  if (resource === 'Channels') {
    const parent = teamBinding(a);
    if (parent && resolveInheritMode(parent) === 'inherit-lock') {
      return { locked: true, parent: 'Teams' };
    }
  }
  return { locked: false };
}

export function whoCanSetGrantCount(cfg: ResourceConfig): number {
  return (
    (cfg.whoCanSet.relationalDefault ? 1 : 0) +
    capabilityGrantCount(cfg.whoCanSet.grants)
  );
}

export function isChannelDisplayHidden(
  showWhere: DisplayWhere[] | undefined,
): boolean {
  if (!showWhere?.length) {
    return true;
  }
  return showWhere.includes('Hidden');
}

export function channelDisplayIncludes(
  showWhere: DisplayWhere[] | undefined,
  loc: DisplayWhere,
): boolean {
  if (!showWhere || isChannelDisplayHidden(showWhere)) return false;
  return showWhere.includes(loc);
}

export function postDisplayIncludes(
  showWhere: DisplayWhere[] | undefined,
  loc: PostDisplayLoc,
): boolean {
  if (!showWhere || isChannelDisplayHidden(showWhere)) return false;
  return showWhere.includes(loc);
}

export function postDisplayLabel(loc: PostDisplayLoc): string {
  switch (loc) {
    case 'Composer':
      return 'Message input box';
    case 'Header':
      return 'In-channel message view';
    default: {
      const _exhaustive: never = loc;
      return _exhaustive;
    }
  }
}

export function supportsChannelBanner(attribute: HubAttribute): boolean {
  return (
    attribute.type === 'Ranked-hierarchical' || attribute.type === 'Ranked'
  );
}

export function takesValueList(attribute: HubAttribute): boolean {
  return attribute.type !== 'Text';
}

export function listValuesForOverlay(attribute: HubAttribute): AttrValue[] {
  if (attribute.type === 'Ranked-hierarchical') {
    return attribute.values.filter((v) => v.tier != null);
  }
  return attribute.values;
}

/** Reuse is offered only for manually-managed, not-yet-linked attributes. */
export function canReuseValues(a: HubAttribute): boolean {
  return a.source.kind === 'manual' && !a.valuesLink && !a.mirroredBy?.length;
}

/**
 * Eligibility is DERIVED, never a stored toggle. An attribute is usable in
 * access policies iff its values are NOT end-user-self-editable.
 */
export function eligibility(a: HubAttribute): {
  eligible: boolean;
  why: string;
} {
  // R4 — a value any member can set can't be trusted. Posts have no members.
  const memberSettable = a.appliesTo.find(
    (c) => c.resource !== 'Posts' && isMemberSettable(c),
  );
  if (memberSettable) {
    return {
      eligible: false,
      why: `Members can set the value on ${memberSettable.resource.toLowerCase()}, so it cannot be trusted for access decisions.`,
    };
  }
  if (isSourceOwned(a)) {
    return {
      eligible: true,
      why: `Values are set by ${a.source.system}, not the end user.`,
    };
  }
  return {
    eligible: true,
    why: 'End users cannot edit their own value.',
  };
}

/** Total leaf + tier value count for the catalog "value count" cell. */
export function valueCount(a: HubAttribute): number {
  let n = 0;
  const walk = (vs: AttrValue[]) => {
    for (const v of vs) {
      n += 1;
      if (v.children) walk(v.children);
    }
  };
  walk(a.values);
  return n;
}

/** Human "5 tiers" / "128 values" style summary. */
export function valueCountLabel(a: HubAttribute): string {
  if (a.type === 'Text') return 'Free text';
  if (a.type === 'Ranked' || a.type === 'Ranked-hierarchical') {
    const tiers = a.values.filter((v) => v.tier != null).length;
    return `${tiers} ${tiers === 1 ? 'tier' : 'tiers'}`;
  }
  const n = valueCount(a);
  return `${n} ${n === 1 ? 'value' : 'values'}`;
}

export function policyLabel(n: number): string {
  return `Used by ${n} ${n === 1 ? 'policy' : 'policies'}`;
}

export function syncTone(state: SyncState): 'success' | 'warning' | 'danger' {
  switch (state) {
    case 'Synced':
      return 'success';
    case 'Stale':
      return 'warning';
    default:
      return 'danger';
  }
}

// ─── Seed data ────────────────────────────────────────────────────────────────

/** Shared ranked tier scale — Classification mirrors Clearance's scale. */
const TIER_SCALE: AttrValue[] = [
  {
    id: 'unclassified',
    label: 'Unclassified',
    tier: 1,
    children: [
      { id: 'ouo', label: 'Official use only' },
      {
        id: 'tlp',
        label: 'TLP',
        children: [
          { id: 'tlp-clear', label: 'TLP-CLEAR' },
          { id: 'tlp-green', label: 'TLP-GREEN' },
          { id: 'tlp-amber', label: 'TLP-AMBER' },
          { id: 'tlp-amber-strict', label: 'TLP-AMBER_STRICT' },
          { id: 'tlp-red', label: 'TLP-RED' },
        ],
      },
    ],
  },
  { id: 'protected-a', label: 'Protected A', tier: 2, inUseCount: 24 },
  { id: 'protected-b', label: 'Protected B', tier: 3, inUseCount: 11 },
];

/** Clearance owns the tier scale (read-only, synced from UAS). */
const CLEARANCE_SCALE: AttrValue[] = [
  { id: 'cl-1', label: 'Unclassified', tier: 1 },
  { id: 'cl-2', label: 'Protected A', tier: 2 },
  { id: 'cl-3', label: 'Protected B', tier: 3 },
];

const OWNER = (subject: string): AccessGrant => ({ subject, owner: true });

export function accessCap(
  roles: AccessGrant[] = [],
  users: AccessGrant[] = [],
  attributeRules: AttributeAccessRule[] = [],
): AccessCapability {
  return { roles, users, attributeRules };
}

export function whoCanSet(
  relationalDefault: WhoSets | null,
  grants: AccessCapability = accessCap(),
): WhoCanSet {
  return { relationalDefault, grants };
}

export function defaultAccessModel(owner: string): AccessModel {
  const ownerGrant = OWNER(owner);
  return {
    editDefinition: accessCap([ownerGrant]),
    manageValues: accessCap([ownerGrant]),
  };
}

/** Two capabilities are equal when they hold the same subjects/rules. */
export function capabilitiesEqual(
  a: AccessCapability,
  b: AccessCapability,
): boolean {
  const key = (cap: AccessCapability) =>
    JSON.stringify({
      roles: cap.roles.map((g) => g.subject).sort(),
      users: cap.users.map((g) => g.subject).sort(),
      rules: cap.attributeRules
        .map((r) => `${r.attributeId}${r.operator}${r.value}`)
        .sort(),
    });
  return key(a) === key(b);
}

export function capabilityGrantCount(cap: AccessCapability): number {
  return cap.roles.length + cap.users.length + cap.attributeRules.length;
}

export function userRuleAttributes(): UserRuleAttribute[] {
  // R4 — only trustworthy user attributes can gate access. R5 — hide unheld values.
  return HUB_ATTRIBUTES.filter(
    (a) => appliesToUsers(a) && eligibility(a).eligible,
  ).map((a) => {
    const base =
      a.type === 'Text'
        ? []
        : a.values.filter(
            (v) => v.tier == null || a.type !== 'Ranked-hierarchical',
          );
    return {
      id: a.id,
      label: a.name,
      type: a.type,
      values: visibleValues(a, base).map((v) => v.label),
    };
  });
}

export function operatorsForAttrType(
  type: AttrType,
): Array<{ id: string; label: string }> {
  if (type === 'Multiselect') {
    return [
      { id: 'has-any', label: 'has any of' },
      { id: 'has-all', label: 'has all of' },
    ];
  }
  return [{ id: 'is', label: 'is' }];
}

export function operatorLabel(operatorId: string): string {
  switch (operatorId) {
    case 'has-any':
      return 'has any of';
    case 'has-all':
      return 'has all of';
    default:
      return 'is';
  }
}

export const HUB_ATTRIBUTES: HubAttribute[] = [
  {
    id: 'classification',
    name: 'Classification',
    type: 'Ranked-hierarchical',
    description:
      'Sensitivity level applied to channels, posts, and teams. Ranked tiers form the spine compared against Clearance; display-only markings nest beneath each tier.',
    values: TIER_SCALE,
    source: { kind: 'manual' },
    appliesTo: [
      {
        resource: 'Channels',
        required: true,
        whoCanSet: whoCanSet(
          'Channel admin',
          accessCap(
            [{ subject: 'Security Administrators' }, { subject: 'Channel Admins' }],
            [{ subject: 'Idris Fanning' }],
            [
              {
                id: 'rule-clearance-pb',
                attributeId: 'clearance',
                attributeLabel: 'Clearance',
                operator: 'is',
                value: 'Protected B',
              },
            ],
          ),
        ),
        showWhere: ['Header', 'Sidebar', 'Banner'],
        disabledValueIds: [],
        valueEditability: 'locked',
      },
      {
        resource: 'Posts',
        required: false,
        whoCanSet: whoCanSet('Post author'),
        showWhere: ['Header', 'Composer'],
        inheritMode: 'inherit-lock',
        valueEditability: 'locked',
      },
      {
        resource: 'Teams',
        required: false,
        whoCanSet: whoCanSet('Team admin'),
        inheritMode: 'inherit-lock',
      },
    ],
    usedByPolicies: 3,
    policyNames: [
      'Clearance gate — channels',
      'Protected-B read-only',
      'Cross-team spillage guard',
    ],
    access: {
      editDefinition: accessCap([OWNER('Security Administrators')]),
      manageValues: accessCap(
        [OWNER('Security Administrators')],
        [{ subject: 'Marisol Vance' }],
      ),
    },
    readIntoFiltering: false,
    valuesLink: { attributeId: 'clearance', attributeName: 'Clearance' },
  },
  {
    id: 'clearance',
    name: 'Clearance',
    type: 'Ranked',
    description:
      'User clearance level, synced from UAS. Owns the tier scale that Classification mirrors.',
    values: CLEARANCE_SCALE,
    source: {
      kind: 'synced',
      system: 'UAS',
      state: 'Synced',
      status: 'Last synced 6 minutes ago · pull every 15m',
      fieldMap: 'local.clearance ← uas.profile.clearance_level',
      cadence: 'Pull every 15m',
      lastSuccess: '6 minutes ago',
    },
    appliesTo: [
      {
        resource: 'Users',
        required: true,
        whoCanSet: whoCanSet('UAS'),
        userProfileDisplay: 'hide-empty',
      },
    ],
    usedByPolicies: 4,
    policyNames: [
      'Clearance gate — channels',
      'Clearance gate — teams',
      'Protected-B read-only',
      'Cross-team spillage guard',
    ],
    access: {
      editDefinition: accessCap([OWNER('Security Administrators')]),
      manageValues: accessCap([OWNER('UAS sync (system)')]),
    },
    readIntoFiltering: true,
    mirroredBy: ['Classification'],
  },
  {
    id: 'program',
    name: 'Program',
    type: 'Multiselect',
    description:
      'Named program assignment. Values are restricted — you see only the programs you are read into.',
    values: [
      { id: 'pg-aurora', label: 'AURORA' },
      { id: 'pg-restricted-1', label: 'Restricted', disabled: false },
      { id: 'pg-restricted-2', label: 'Restricted' },
      { id: 'pg-restricted-3', label: 'Restricted' },
    ],
    source: {
      kind: 'synced',
      system: 'UAS',
      state: 'Stale',
      status:
        'Missed the last 2 scheduled pulls — last success 2 days ago. Values may be out of date.',
      fieldMap: 'local.program ← uas.profile.program_code',
      cadence: 'Pull every 15m',
      lastSuccess: '2 days ago',
      pastBudget: true,
    },
    appliesTo: [
      {
        resource: 'Users',
        required: false,
        whoCanSet: whoCanSet('UAS'),
        userProfileDisplay: 'hide-empty',
      },
      {
        resource: 'Channels',
        required: false,
        whoCanSet: whoCanSet(
          'Channel admin',
          accessCap([{ subject: 'Program Security Officers' }]),
        ),
        showWhere: ['Header', 'Sidebar'],
      },
    ],
    usedByPolicies: 2,
    policyNames: ['Program-AURORA access', 'Program read-into gate'],
    access: {
      editDefinition: accessCap([OWNER('Program Security Officers')]),
      manageValues: accessCap([OWNER('UAS sync (system)')]),
    },
    readIntoFiltering: true,
  },
  {
    id: 'caveat',
    name: 'Caveat / Releasability',
    type: 'Multiselect',
    description:
      'Dissemination handling and releasability markings applied to channels and posts. Enforced via Nationality, not Clearance.',
    values: [
      { id: 'cav-noforn', label: 'NOFORN', inUseCount: 8 },
      { id: 'cav-rel-gbr', label: 'REL TO GBR' },
      { id: 'cav-rel-can', label: 'REL TO CAN' },
    ],
    source: { kind: 'manual' },
    appliesTo: [
      {
        resource: 'Channels',
        required: false,
        whoCanSet: whoCanSet('Channel admin'),
        showWhere: ['Header', 'Sidebar'],
      },
      {
        resource: 'Posts',
        required: false,
        whoCanSet: whoCanSet('Post author'),
        showWhere: ['Header', 'Composer'],
        inheritMode: 'inherit',
      },
    ],
    usedByPolicies: 0,
    policyNames: [],
    access: defaultAccessModel('Security Administrators'),
    readIntoFiltering: false,
  },
  {
    id: 'department',
    name: 'Department',
    type: 'Select',
    description: 'User department, synced from the LDAP directory of record.',
    values: [
      { id: 'dep-eng', label: 'Engineering' },
      { id: 'dep-ops', label: 'Operations' },
      { id: 'dep-sec', label: 'Security' },
      { id: 'dep-int', label: 'Intelligence' },
    ],
    source: {
      kind: 'synced',
      system: 'LDAP',
      state: 'Synced',
      status: 'Last synced 41 minutes ago · pull every 6h',
      fieldMap: 'local.department ← ldap.ou',
      cadence: 'Pull every 6h',
      lastSuccess: '41 minutes ago',
    },
    appliesTo: [
      {
        resource: 'Users',
        required: false,
        whoCanSet: whoCanSet('LDAP'),
        userProfileDisplay: 'hide-empty',
      },
    ],
    usedByPolicies: 0,
    policyNames: [],
    access: {
      editDefinition: accessCap([OWNER('Directory Administrators')]),
      manageValues: accessCap([OWNER('LDAP sync (system)')]),
    },
    readIntoFiltering: false,
  },
  {
    id: 'duty-status',
    name: 'Duty status',
    type: 'Select',
    description: 'Current duty status, set by the member on their own profile.',
    values: [
      { id: 'duty-on', label: 'On duty' },
      { id: 'duty-off', label: 'Off duty' },
      { id: 'duty-leave', label: 'On leave' },
      { id: 'duty-tdy', label: 'TDY' },
    ],
    source: { kind: 'manual' },
    appliesTo: [
      {
        resource: 'Users',
        required: false,
        whoCanSet: whoCanSet('Members'),
        userProfileDisplay: 'always',
      },
    ],
    usedByPolicies: 0,
    policyNames: [],
    access: {
      editDefinition: accessCap([OWNER('People Operations')]),
      manageValues: accessCap([OWNER('People Operations')]),
    },
    readIntoFiltering: false,
  },
  {
    id: 'cost-center',
    name: 'Cost center',
    type: 'Text',
    description: 'Accounting cost center, entered as free text by an administrator.',
    values: [],
    source: { kind: 'manual' },
    appliesTo: [
      {
        resource: 'Users',
        required: false,
        whoCanSet: whoCanSet('System admin'),
        userProfileDisplay: 'hide-empty',
      },
    ],
    usedByPolicies: 0,
    policyNames: [],
    access: defaultAccessModel('Finance Administrators'),
    readIntoFiltering: false,
  },
];

export const ALL_RESOURCES: ResourceKind[] = [
  'Users',
  'Channels',
  'Posts',
  'Teams',
];

export const SOURCE_FILTERS: Array<'All sources' | 'Managed here' | SourceSystem> =
  ['All sources', 'Managed here', 'UAS', 'LDAP', 'SCIM'];

export function newAttributeId(): string {
  return `attr-${Date.now()}`;
}

export function defaultResourceConfig(resource: ResourceKind): ResourceConfig {
  switch (resource) {
    case 'Users':
      return {
        resource,
        required: false,
        whoCanSet: whoCanSet('System admin'),
        userProfileDisplay: 'hide-empty',
      };
    case 'Channels':
      return {
        resource,
        required: false,
        whoCanSet: whoCanSet('Channel admin'),
        showWhere: ['Header', 'Sidebar'],
        disabledValueIds: [],
        valueEditability: 'editable',
      };
    case 'Posts':
      return {
        resource,
        required: false,
        whoCanSet: whoCanSet('Post author'),
        showWhere: ['Composer'],
        inheritMode: 'off',
        valueEditability: 'editable',
      };
    case 'Teams':
      return {
        resource,
        required: false,
        whoCanSet: whoCanSet('Team admin'),
        inheritMode: 'off',
        disabledValueIds: [],
        valueEditability: 'editable',
      };
  }
}
