/**
 * Attribute System prototype — data model.
 *
 * Codifies the three-layer configuration model recommended against the
 * Property Permissions Proposal (Confluence D4CJFAE):
 *   1. Definition  — the field itself (permissions: owners + restrictions)
 *   2. Binding     — how the attribute attaches to each resource type
 *   3. Assignment  — the value on a specific resource
 *
 * Definition-layer fields map 1:1 onto the tech spec's `permissions` model.
 * Binding-layer fields are the net-new surface the spec defers to v12
 * ("generalize beyond the user-attributes group").
 */

export type ResourceType =
  | 'Users'
  | 'Teams'
  | 'Channels'
  | 'Playbooks'
  | 'Boards'
  | 'Posts'
  | 'Files';

export const ALL_RESOURCE_TYPES: ResourceType[] = [
  'Users',
  'Teams',
  'Channels',
  'Playbooks',
  'Boards',
  'Posts',
  'Files',
];

export type AttrType =
  | 'Text'
  | 'Select'
  | 'Multiselect'
  | 'Ranked'
  | 'Date'
  // Built-in CPA profile field display types (not user-selectable when configuring).
  | 'Image'
  | 'Email';

/** Configurable attribute types offered when creating/editing an attribute. */
export const CONFIGURABLE_TYPES: AttrType[] = [
  'Text',
  'Select',
  'Multiselect',
  'Ranked',
  'Date',
];

/** Read-access / value-masking — maps to restrictions.read.value + filters.value. */
export type ReadAccess = 'Public' | 'Restricted' | 'Plugin-managed';

/** Restriction ladder — maps to restrictions.write.{field,option,value}. */
export type WriteTier = 'owner' | 'sysadmin' | 'admin' | 'member' | 'none';

/** Net-new binding axis: whether a value may change after it is saved. */
export type Mutability = 'Editable' | 'Ratchet' | 'Locked' | 'Approval';

/** v2 definition-level mutability — split by audience (Users vs resource types). */
export interface DefinitionMutability {
  user?: Mutability;
  resource?: Mutability;
}

/** Mutability options surfaced in v2 (Approval dropped per simplification plan). */
export const V2_MUTABILITY_OPTIONS: Mutability[] = [
  'Editable',
  'Locked',
  'Ratchet',
];

export const V2_MUTABILITY_LABEL: Record<
  Extract<Mutability, 'Editable' | 'Locked' | 'Ratchet'>,
  string
> = {
  Editable: 'Editable — value can change freely',
  Locked: 'Locked after set',
  Ratchet: 'Raise only — no downgrade',
};

/** Net-new binding axis backed by write.option (closed = owner/sysadmin). */
export type Vocabulary = 'Closed' | 'Open';

export type RequiredMode = 'Optional' | 'Required';
export type EnforceAt = 'create' | 'before-use';

export type OwnerType = 'plugin' | 'service' | 'role' | 'user';

/**
 * Unified external-source discriminator (research/Integrator feedback): one bind
 * operation parameterized by source type rather than three divergent "Link to…" verbs.
 */
export type SourceType = 'ldap' | 'scim' | 'plugin';

/**
 * Sync state of an externally-owned attribute (Integrator + Admin feedback).
 * `synced` healthy; `stale` past freshness window; `failed` last sync errored;
 * `unreachable` source offline (cross-enclave IL5/6 fail-closed case).
 */
export type SyncState = 'synced' | 'stale' | 'failed' | 'unreachable';

export interface AttrOwner {
  type: OwnerType;
  /** Human-friendly source name, e.g. "SCIM", "AD/LDAP". */
  id: string;
  /** Optional per-provider scope, e.g. "entra", "okta". */
  scope?: string;
  /** Unified bind discriminator. */
  sourceType?: SourceType;
  /** Source-side field this attribute maps to (Okta-style directional mapping). */
  syncedField?: string;
  /** Last-sync display label, e.g. "30 mins ago", "6h ago". */
  lastSyncedLabel?: string;
  /** Health of the last sync. Defaults to 'synced' when absent. */
  syncState?: SyncState;
  /** True when this source is the authoritative system of record (provenance, AC-16(6)). */
  authoritative?: boolean;
}

export interface AttrValue {
  id: string;
  label: string;
  /** Higher = higher precedence (Ranked only). */
  rank?: number;
}

export type PostInheritanceMode =
  | 'none'
  | 'channel-default'
  | 'channel-locked';

/**
 * Where an assigned value is surfaced on the channel (Channel admin · Assign).
 * `banner` is only offered for the Classification attribute. Multi-select;
 * `'hidden'` is the mutually-exclusive "set but not shown" state.
 */
export type DisplayLocation = 'header' | 'sidebar' | 'banner';
export type DisplayLocations = DisplayLocation[] | 'hidden';

/** Per-resource-type behavior. One binding per applied resource type. */
export interface Binding {
  resource: ResourceType;
  required: RequiredMode;
  enforceAt: EnforceAt;
  /** Default value applied to a new resource. */
  defaultValueId: string | null;
  showInHeader: boolean;
  showWhenEmpty: boolean;
  vocabulary: Vocabulary;
  mutability: Mutability;
  /** Lowest human role that may set the value on a resource. */
  whoCanSet: WriteTier;
  /** Whether a resource admin may tune this binding (tighten-only). */
  delegable: boolean;
  /** Users binding: whether end users may edit their own value ("Editable by users"). */
  userEditable?: boolean;
  /**
   * Channels binding: where an assigned value is shown on the channel.
   * Defaults to `['header']` for header-bearing attributes; `'hidden'` otherwise.
   */
  displayLocations?: DisplayLocations;
  /**
   * Posts binding: whether new posts may inherit this attribute from their
   * channel at creation time.
   */
  inheritanceMode?: PostInheritanceMode;
  /**
   * Channels binding: when true, the channel's assigned value is copied to
   * new posts (if the post binding allows inheritance).
   */
  propagateToPosts?: boolean;
}

export interface AttrDef {
  id: string;
  name: string;
  type: AttrType;
  /**
   * Where the definition lives:
   *  - global   — a system-wide shared vocabulary; lives in Global Attributes.
   *               Its value identity is comparable across every resource type.
   *  - resource — not system-wide. Usually one resource type, but MAY span
   *               related types without being global — e.g. a channel attribute
   *               that also snapshots onto its own posts (local channel→post
   *               inheritance). Promotable to global to share one vocabulary
   *               across all resource types.
   *  - team     — team-scoped resource attribute (delegation = define_scoped).
   */
  scope: 'global' | 'resource' | 'team';
  /** For team-scoped attributes — the owning team. */
  ownerTeam?: string;
  /** When promoted from a single resource type, the type it originated on. */
  promotedFrom?: ResourceType;
  values: AttrValue[];
  /** External owner (LDAP/SAML/SCIM/plugin). Null = locally managed. */
  owner: AttrOwner | null;
  read: ReadAccess;
  write: { field: WriteTier; option: WriteTier; value: WriteTier };
  /** v2: definition-level editability split by audience. */
  mutability?: DefinitionMutability;
  /** Seeded, non-deletable system attribute (env-attrs Protected=true). */
  protected: boolean;
  /** Built-in CPA profile field (Profile image, First name, …) — read-only display row. */
  system?: boolean;
  /** Deactivated: no new assignments, existing policy references preserved (NIST 800-162 PAP). */
  deactivated?: boolean;
  appliesTo: ResourceType[];
  bindings: Binding[];
  /** Count of ABAC/membership policies referencing this attribute. */
  policyCount: number;
}

export const READ_ACCESS_LABEL: Record<ReadAccess, string> = {
  Public: 'Public — all members can see values',
  Restricted: 'Restricted — shared-only masking',
  'Plugin-managed': 'Plugin-managed — values hidden from humans',
};

export const WRITE_TIER_LABEL: Record<WriteTier, string> = {
  owner: 'Owners only',
  sysadmin: 'System admins',
  admin: 'Resource admins (team / channel)',
  member: 'Members',
  none: 'Anyone',
};

/** Privilege ladder — index 0 is most privileged. Floor tier grants this tier and all above. */
export const WRITE_PRIVILEGE_ORDER: WriteTier[] = [
  'owner',
  'sysadmin',
  'admin',
  'member',
  'none',
];

/** Tiers that may assign values when `write.value` is set to `floor`. */
export function assignTiersForFloor(floor: WriteTier): WriteTier[] {
  const floorIdx = WRITE_PRIVILEGE_ORDER.indexOf(floor);
  if (floorIdx === -1) return ['owner'];
  return WRITE_PRIVILEGE_ORDER.slice(0, floorIdx + 1);
}

/** Popover radio label — encodes inheritance in the option text. */
export const WRITE_FLOOR_LABEL: Record<WriteTier, string> = {
  owner: 'Owners only',
  sysadmin: 'System Admins and above',
  admin: 'Resource Admins and above',
  member: 'Members and above',
  none: 'Anyone',
};

export const WRITE_FLOOR_DESC: Record<WriteTier, string> = {
  owner: 'Integration owners (plugins, LDAP, SAML)',
  sysadmin: 'System Console administrators, plus Owners',
  admin: 'Team and channel administrators, plus roles above',
  member: 'All members of the resource, plus roles above',
  none: 'Anyone on the resource, including guests when allowed',
};

/** Compact table-cell summary for the assignment floor. */
export function writeAccessSummary(floor: WriteTier): string {
  return WRITE_FLOOR_LABEL[floor];
}

export const MUTABILITY_LABEL: Record<Mutability, string> = {
  Editable: 'Editable — value can change freely',
  Ratchet: 'Ratchet — raise only, no downgrade',
  Locked: 'Locked after set — change needs a system admin',
  Approval: 'Requires approval — second-person review',
};

export const VOCABULARY_LABEL: Record<Vocabulary, string> = {
  Closed: 'Closed — select from existing values only',
  Open: 'Open — resource admins may add new values',
};

export function ownerBadgeText(owner: AttrOwner): string {
  return owner.scope
    ? `Managed by ${owner.id} / ${owner.scope}`
    : `Managed by ${owner.id}`;
}

/** Fixed-length masked token per attribute-value-masking spec §2.3. */
export const MASKED_VALUE_TOKEN = '••••••••';

/**
 * Prototype viewer profile — Leonard Riley in the System Console.
 * Value IDs the caller holds per attribute; drives shared_only filtering.
 */
export const PROTOTYPE_CALLER_HELD_VALUES: Partial<Record<string, string[]>> = {
  classification: ['s', 'c', 'cui', 'u'],
  department: ['eng'],
  clearance: ['c', 'cui', 'u'],
};

/** LDAP / plugin (and similar) sources own the value catalog — no local add/remove. */
export function isExternallyManagedCatalog(def: AttrDef): boolean {
  if (!def.owner) return false;
  if (def.owner.type === 'plugin') return true;
  return def.owner.id === 'AD/LDAP';
}

/** Whether shared_only / source_only masking filters the values list for this caller. */
export function usesValueMasking(def: AttrDef): boolean {
  return def.read === 'Restricted' || def.read === 'Plugin-managed';
}

function callerHeldIds(def: AttrDef): Set<string> {
  return new Set(PROTOTYPE_CALLER_HELD_VALUES[def.id] ?? []);
}

/** Values visible to the prototype caller (intersection for Restricted; none for Plugin-managed). */
export function visibleValuesForCaller(def: AttrDef): AttrValue[] {
  if (def.read === 'Plugin-managed') return [];
  if (def.read === 'Restricted') {
    const held = callerHeldIds(def);
    return def.values.filter((v) => held.has(v.id));
  }
  return def.values;
}

/** True when the server would set has_masked_values on the API response. */
export function hasMaskedValuesForCaller(def: AttrDef): boolean {
  if (def.type === 'Text' || def.type === 'Date') return false;
  if (def.read === 'Plugin-managed' && def.values.length > 0) return true;
  if (def.read === 'Restricted') {
    return visibleValuesForCaller(def).length < def.values.length;
  }
  return false;
}

export const MASKING_NOTICE =
  'Some values are hidden because you do not hold them. The server only sends values in your assignment — additional options exist but are not shown here.';

/** Whether non-owner roles may add values to the option catalog (write.option ≠ owner). */
export function allowsAddingOptions(def: AttrDef): boolean {
  return def.write.option !== 'owner';
}

/** Maps the simplified "Allow adding new options" toggle onto write.option. */
export function writeWithAddOptions(
  write: AttrDef['write'],
  allow: boolean,
): AttrDef['write'] {
  if (!allow) {
    return { ...write, option: 'owner' };
  }
  const optionTier =
    write.value === 'member' || write.value === 'none' ? 'admin' : write.value;
  return { ...write, option: optionTier };
}

// ─── v2 simplification helpers ───────────────────────────────────────────────

/** Hardcoded who-can-set defaults per resource type (v2 — no UI picker). */
export const DEFAULT_WHO_CAN_SET: Record<ResourceType, WriteTier> = {
  Users: 'sysadmin',
  Teams: 'admin',
  Channels: 'admin',
  Posts: 'member',
  Playbooks: 'admin',
  Boards: 'admin',
  Files: 'admin',
};

/** Plugin-managed attributes lock value visibility until the plugin is removed. */
export function readAccessLocked(def: AttrDef): boolean {
  return def.owner?.type === 'plugin';
}

/** Selectable read-access options in v2 (Plugin-managed is derived, not selectable). */
export const V2_READ_OPTIONS: ReadAccess[] = ['Public', 'Restricted'];

export function readAccessDisplay(def: AttrDef): string {
  if (readAccessLocked(def)) return 'Plugin-managed';
  return def.read === 'Restricted' ? 'Restricted' : 'Public';
}

/** System-default display locations for channel bindings (v2). */
export function defaultDisplayLocations(def: AttrDef): DisplayLocations {
  const channel = channelBinding(def);
  if (channel?.displayLocations) {
    return normalizeDisplayLocations(channel.displayLocations);
  }
  if (def.id === 'classification') return ['header', 'banner'];
  if (channel?.showInHeader) return ['header'];
  return 'hidden';
}

const RESOURCE_TYPES_FOR_MUTABILITY: ResourceType[] = [
  'Channels',
  'Posts',
  'Teams',
  'Playbooks',
  'Boards',
  'Files',
];

/** Resolve definition-level mutability, falling back to binding seed data. */
export function ensureDefinitionMutability(def: AttrDef): DefinitionMutability {
  const userBinding = def.bindings.find((b) => b.resource === 'Users');
  const resourceBinding = def.bindings.find((b) =>
    RESOURCE_TYPES_FOR_MUTABILITY.includes(b.resource),
  );
  return {
    user: def.mutability?.user ?? userBinding?.mutability ?? 'Editable',
    resource:
      def.mutability?.resource ?? resourceBinding?.mutability ?? 'Editable',
  };
}

/** Effective mutability for a resource binding in v2. */
export function effectiveMutability(
  def: AttrDef,
  resource: ResourceType,
): Mutability {
  const { user, resource: resourceMut } = ensureDefinitionMutability(def);
  if (resource === 'Users') return user ?? 'Editable';
  return resourceMut ?? 'Editable';
}

/** Whether mutability is security-locked (Classification — not editable down). */
export function mutabilityLocked(def: AttrDef): boolean {
  return def.id === 'classification';
}

/** Derived who-can-set tier for v2 (no UI picker). */
export function derivedWhoCanSet(
  def: AttrDef,
  resource: ResourceType,
): WriteTier {
  if (def.owner) return 'owner';
  if (resource === 'Users') {
    const userBinding = def.bindings.find((b) => b.resource === 'Users');
    if (userBinding?.userEditable) return 'member';
    return DEFAULT_WHO_CAN_SET.Users;
  }
  return DEFAULT_WHO_CAN_SET[resource];
}

/** Persists a 3-state inheritance change as a single atomic patch covering
 * both Channels (`propagateToPosts`) and Posts (`inheritanceMode`). */
export function writeInheritance(
  defId: string,
  next: 'off' | 'inherit' | 'inherit-locked',
  onPatch: (defId: string, patch: Partial<AttrDef>) => void,
  def: AttrDef,
) {
  const propagateToPosts = next !== 'off';
  const postMode: PostInheritanceMode =
    next === 'off'
      ? 'none'
      : next === 'inherit-locked'
        ? 'channel-locked'
        : 'channel-default';

  const hasPostBinding = def.bindings.some((b) => b.resource === 'Posts');

  let bindings = def.bindings.map((b) => {
    if (b.resource === 'Channels') return { ...b, propagateToPosts };
    if (b.resource === 'Posts') return { ...b, inheritanceMode: postMode };
    return b;
  });

  let appliesTo = def.appliesTo;

  if (!hasPostBinding && next !== 'off') {
    bindings = [
      ...bindings,
      makeBinding('Posts', {
        inheritanceMode: postMode,
        whoCanSet: 'member',
      }),
    ];
    appliesTo = def.appliesTo.includes('Posts')
      ? def.appliesTo
      : [...def.appliesTo, 'Posts'];
  }

  onPatch(defId, { bindings, appliesTo });
}

/** Short label for inheritance read-out on Post Attributes v2. */
export function inheritanceReadout(
  def: AttrDef,
): 'off' | 'inherit' | 'inherit-locked' | 'post-only' {
  if (!appliesToPostsAndChannels(def)) return 'post-only';
  const channel = channelBinding(def);
  const post = postBinding(def);
  if (!channel?.propagateToPosts) return 'off';
  if (post?.inheritanceMode === 'channel-locked') return 'inherit-locked';
  if (post?.inheritanceMode === 'channel-default') return 'inherit';
  return 'off';
}

export const INHERITANCE_READOUT_LABEL: Record<
  ReturnType<typeof inheritanceReadout>,
  string
> = {
  off: 'Off',
  inherit: 'Inherit from channel',
  'inherit-locked': 'Inherit + lock',
  'post-only': 'Post-only — n/a',
};

// ─── Display location (Channel admin · Assign) ───────────────────────────────

export const DISPLAY_LOCATION_LABEL: Record<DisplayLocation, string> = {
  header: 'Channel header',
  sidebar: 'Channel info sidebar',
  banner: 'Channel banner',
};

/** Short label used on the table-cell chip trigger. */
const DISPLAY_LOCATION_SHORT: Record<DisplayLocation, string> = {
  header: 'Header',
  banner: 'Banner',
  sidebar: 'Sidebar',
};

/** Canonical render order: Header, Banner, Sidebar. */
const DISPLAY_LOCATION_ORDER: DisplayLocation[] = ['header', 'banner', 'sidebar'];

/** Banner is only offered for the Classification attribute. */
export function availableDisplayLocations(def: AttrDef): DisplayLocation[] {
  return DISPLAY_LOCATION_ORDER.filter(
    (loc) => loc !== 'banner' || def.id === 'classification',
  );
}

/** Empty array is invalid — coerce to 'hidden'. */
export function normalizeDisplayLocations(
  value: DisplayLocations | undefined,
): DisplayLocations {
  if (!value || value === 'hidden') return value ?? 'hidden';
  return value.length === 0 ? 'hidden' : value;
}

/** Trigger-chip label, e.g. "Header + Banner" or "Hidden". */
export function displayLocationsLabel(value: DisplayLocations | undefined): string {
  const v = normalizeDisplayLocations(value);
  if (v === 'hidden') return 'Hidden';
  return DISPLAY_LOCATION_ORDER.filter((loc) => v.includes(loc))
    .map((loc) => DISPLAY_LOCATION_SHORT[loc])
    .join(' + ');
}

// ─── External-source sync state ──────────────────────────────────────────────

export const SYNC_STATE_LABEL: Record<SyncState, string> = {
  synced: 'Synced',
  stale: 'Sync stale',
  failed: 'Sync failed',
  unreachable: 'Source unreachable',
};

/** Non-healthy sync states warrant an amber/red indicator + remediation affordance. */
export function syncNeedsAttention(owner: AttrOwner | null): boolean {
  if (!owner?.syncState) return false;
  return owner.syncState !== 'synced';
}

// ─── Delete vs deactivate (NIST 800-162 PAP) ─────────────────────────────────

export type DeleteDisposition = 'delete' | 'deactivate' | 'blocked';

/**
 * Hard delete allowed only for unreferenced, non-system attributes. Referenced
 * attributes (policyCount > 0) must be deactivated; system attributes are blocked.
 */
export function deleteDisposition(def: AttrDef): DeleteDisposition {
  if (def.protected || def.system) return 'blocked';
  if (def.policyCount > 0) return 'deactivate';
  return 'delete';
}

function binding(resource: ResourceType, over: Partial<Binding> = {}): Binding {
  return {
    resource,
    required: 'Optional',
    enforceAt: 'create',
    defaultValueId: null,
    showInHeader: false,
    showWhenEmpty: false,
    vocabulary: 'Closed',
    mutability: 'Editable',
    whoCanSet: 'admin',
    delegable: false,
    inheritanceMode: resource === 'Posts' ? 'none' : undefined,
    propagateToPosts: resource === 'Channels' ? false : undefined,
    ...over,
  };
}

export function appliesToPostsAndChannels(def: AttrDef): boolean {
  return def.appliesTo.includes('Channels') && def.appliesTo.includes('Posts');
}

export function postBinding(def: AttrDef): Binding | undefined {
  return def.bindings.find((b) => b.resource === 'Posts');
}

export function channelBinding(def: AttrDef): Binding | undefined {
  return def.bindings.find((b) => b.resource === 'Channels');
}

export function inheritanceIsActive(def: AttrDef): boolean {
  const post = postBinding(def);
  const channel = channelBinding(def);
  if (!post || post.inheritanceMode === 'none' || !post.inheritanceMode) {
    return false;
  }
  return Boolean(channel?.propagateToPosts);
}

/** Whether inheritance is configured but blocked by the other binding. */
export function inheritanceStatus(
  def: AttrDef,
): 'off' | 'active' | 'needs-channel' | 'needs-post' {
  const post = postBinding(def);
  const channel = channelBinding(def);
  const postInherits =
    post?.inheritanceMode && post.inheritanceMode !== 'none';
  const channelPropagates = Boolean(channel?.propagateToPosts);
  if (!appliesToPostsAndChannels(def)) return 'off';
  if (postInherits && channelPropagates) return 'active';
  if (postInherits && !channelPropagates) return 'needs-channel';
  if (!postInherits && channelPropagates) return 'needs-post';
  return 'off';
}

export const INHERITANCE_STATUS_LABEL: Record<
  ReturnType<typeof inheritanceStatus>,
  string
> = {
  off: 'No inheritance',
  active: 'Inheritance active',
  'needs-channel': 'Enable on Channel Attributes',
  'needs-post': 'Set mode on Post Attributes',
};

export const INHERITANCE_MODE_LABEL: Record<PostInheritanceMode, string> = {
  none: 'Post-only — no channel inheritance',
  'channel-default': 'Inherit from channel — author may override',
  'channel-locked': 'Inherit from channel — locked at compose',
};

export const INHERITANCE_MODE_DESC: Record<PostInheritanceMode, string> = {
  none: 'Posts use only values assigned directly on the post.',
  'channel-default':
    'New posts copy the channel value at creation. Authors may change it while composing if editability allows.',
  'channel-locked':
    'New posts copy the channel value at creation. Authors cannot change it in the composer.',
};

/**
 * Seed fixtures. Classification is the load-bearing example: global, ranked,
 * masked, closed vocabulary, locked-after-set, required-in-header for channels.
 */
export const INITIAL_ATTRIBUTES: AttrDef[] = [
  {
    id: 'classification',
    name: 'Classification',
    type: 'Ranked',
    scope: 'global',
    values: [
      { id: 'ts', label: 'TOP SECRET', rank: 5 },
      { id: 's', label: 'SECRET', rank: 4 },
      { id: 'c', label: 'CONFIDENTIAL', rank: 3 },
      { id: 'cui', label: 'CUI', rank: 2 },
      { id: 'u', label: 'UNCLASSIFIED', rank: 1 },
    ],
    owner: null,
    read: 'Restricted',
    write: { field: 'sysadmin', option: 'owner', value: 'admin' },
    mutability: { user: 'Locked', resource: 'Locked' },
    protected: true,
    appliesTo: ['Users', 'Teams', 'Channels', 'Posts'],
    bindings: [
      binding('Channels', {
        required: 'Required',
        defaultValueId: 'u',
        showInHeader: true,
        showWhenEmpty: true,
        vocabulary: 'Closed',
        mutability: 'Locked',
        whoCanSet: 'admin',
        delegable: true,
        propagateToPosts: true,
        displayLocations: ['header', 'banner'],
      }),
      binding('Teams', {
        required: 'Required',
        showInHeader: true,
        vocabulary: 'Closed',
        mutability: 'Locked',
        whoCanSet: 'sysadmin',
      }),
      binding('Users', {
        vocabulary: 'Closed',
        mutability: 'Locked',
        whoCanSet: 'sysadmin',
      }),
      binding('Posts', {
        required: 'Required',
        vocabulary: 'Closed',
        mutability: 'Locked',
        whoCanSet: 'member',
        inheritanceMode: 'channel-locked',
      }),
    ],
    policyCount: 6,
  },
  {
    id: 'program',
    name: 'Program',
    type: 'Multiselect',
    scope: 'global',
    values: [
      { id: 'shield', label: 'Operation Shield' },
      { id: 'sentinel', label: 'Project Sentinel' },
      { id: 'huntsville', label: 'Huntsville' },
    ],
    owner: null,
    read: 'Public',
    write: { field: 'sysadmin', option: 'sysadmin', value: 'admin' },
    protected: false,
    appliesTo: ['Teams', 'Channels', 'Playbooks', 'Posts'],
    bindings: [
      binding('Channels', {
        required: 'Optional',
        showInHeader: true,
        vocabulary: 'Closed',
        mutability: 'Editable',
        whoCanSet: 'admin',
        delegable: true,
        propagateToPosts: true,
        displayLocations: ['header'],
      }),
      binding('Teams', { vocabulary: 'Closed', whoCanSet: 'admin' }),
      binding('Playbooks', { vocabulary: 'Closed', whoCanSet: 'admin' }),
      // Inherited-but-overridable on posts — exercises the composer's editable chip.
      binding('Posts', {
        required: 'Optional',
        vocabulary: 'Closed',
        mutability: 'Editable',
        whoCanSet: 'member',
        inheritanceMode: 'channel-default',
      }),
    ],
    policyCount: 2,
  },
  {
    id: 'mission-tag',
    name: 'Mission tag',
    type: 'Select',
    scope: 'global',
    values: [
      { id: 'alpha', label: 'Alpha objective' },
      { id: 'bravo', label: 'Bravo objective' },
    ],
    owner: null,
    read: 'Public',
    write: { field: 'sysadmin', option: 'sysadmin', value: 'member' },
    protected: false,
    appliesTo: ['Posts'],
    bindings: [
      binding('Posts', {
        required: 'Optional',
        vocabulary: 'Closed',
        mutability: 'Editable',
        whoCanSet: 'member',
        inheritanceMode: 'none',
      }),
    ],
    policyCount: 0,
  },
  {
    id: 'department',
    name: 'Department',
    type: 'Select',
    scope: 'global',
    values: [
      { id: 'eng', label: 'Engineering' },
      { id: 'ops', label: 'Operations' },
      { id: 'intel', label: 'Intelligence' },
    ],
    owner: {
      type: 'service',
      id: 'AD/LDAP',
      sourceType: 'ldap',
      syncedField: 'department',
      lastSyncedLabel: '30 mins ago',
      syncState: 'synced',
      authoritative: true,
    },
    read: 'Public',
    write: { field: 'sysadmin', option: 'owner', value: 'owner' },
    protected: false,
    appliesTo: ['Users'],
    bindings: [
      binding('Users', {
        vocabulary: 'Closed',
        mutability: 'Locked',
        whoCanSet: 'owner',
      }),
    ],
    policyCount: 1,
  },
  {
    id: 'cost-center',
    name: 'Cost Center',
    type: 'Text',
    scope: 'global',
    values: [],
    owner: { type: 'plugin', id: 'SCIM', scope: 'okta' },
    read: 'Plugin-managed',
    write: { field: 'sysadmin', option: 'owner', value: 'owner' },
    mutability: { user: 'Locked' },
    protected: false,
    appliesTo: ['Users'],
    bindings: [
      binding('Users', {
        vocabulary: 'Closed',
        mutability: 'Locked',
        whoCanSet: 'owner',
      }),
    ],
    policyCount: 0,
  },
];

/**
 * Resource-scoped attributes — defined for a single resource type, not yet
 * global. `Clearance` is the promotion example: a user attribute whose values
 * arrive from an external UAS plugin. Promoting it to global lets a channel
 * carry the SAME value scale, so an access policy can compare
 * `user.attribute.clearance >= channel.attribute.classification`.
 */
export const INITIAL_RESOURCE_ATTRIBUTES: AttrDef[] = [
  {
    id: 'clearance',
    name: 'Clearance',
    type: 'Ranked',
    scope: 'resource',
    values: [
      { id: 'ts', label: 'TOP SECRET', rank: 5 },
      { id: 's', label: 'SECRET', rank: 4 },
      { id: 'c', label: 'CONFIDENTIAL', rank: 3 },
      { id: 'cui', label: 'CUI', rank: 2 },
      { id: 'u', label: 'UNCLASSIFIED', rank: 1 },
    ],
    owner: {
      type: 'plugin',
      id: 'UAS',
      scope: 'IdAM',
      sourceType: 'plugin',
      syncedField: 'clearance_level',
      lastSyncedLabel: '6h ago',
      syncState: 'stale',
      authoritative: true,
    },
    read: 'Restricted',
    write: { field: 'sysadmin', option: 'owner', value: 'owner' },
    protected: false,
    appliesTo: ['Users'],
    bindings: [
      binding('Users', {
        vocabulary: 'Closed',
        mutability: 'Locked',
        whoCanSet: 'owner',
      }),
    ],
    policyCount: 3,
  },
  {
    id: 'duty-status',
    name: 'Duty Status',
    type: 'Select',
    scope: 'resource',
    values: [
      { id: 'on', label: 'On duty' },
      { id: 'off', label: 'Off duty' },
      { id: 'leave', label: 'On leave' },
    ],
    owner: null,
    read: 'Public',
    write: { field: 'sysadmin', option: 'sysadmin', value: 'member' },
    protected: false,
    appliesTo: ['Users'],
    bindings: [
      binding('Users', {
        vocabulary: 'Closed',
        mutability: 'Editable',
        whoCanSet: 'member',
        showInHeader: true,
      }),
    ],
    policyCount: 0,
  },
  {
    id: 'timezone',
    name: 'Timezone',
    type: 'Select',
    scope: 'resource',
    values: [
      { id: 'et', label: 'Eastern (ET)' },
      { id: 'ct', label: 'Central (CT)' },
      { id: 'pt', label: 'Pacific (PT)' },
      { id: 'zulu', label: 'Zulu (UTC)' },
    ],
    owner: null,
    read: 'Public',
    write: { field: 'admin', option: 'admin', value: 'admin' },
    protected: false,
    appliesTo: ['Channels'],
    bindings: [
      binding('Channels', {
        required: 'Optional',
        vocabulary: 'Closed',
        mutability: 'Editable',
        whoCanSet: 'admin',
        displayLocations: ['sidebar'],
      }),
    ],
    policyCount: 0,
  },
];

/** Team-scoped attribute defined by a team admin (delegation = define_scoped). */
export const INITIAL_TEAM_ATTRIBUTES: AttrDef[] = [
  {
    id: 'project-phase',
    name: 'Project Phase',
    type: 'Select',
    scope: 'team',
    ownerTeam: 'Operation Shield',
    values: [
      { id: 'plan', label: 'Planning' },
      { id: 'exec', label: 'Execution' },
      { id: 'review', label: 'After-Action' },
    ],
    owner: null,
    read: 'Public',
    write: { field: 'admin', option: 'owner', value: 'admin' },
    protected: false,
    appliesTo: ['Channels'],
    bindings: [
      binding('Channels', {
        required: 'Optional',
        showInHeader: true,
        vocabulary: 'Closed',
        mutability: 'Editable',
        whoCanSet: 'admin',
        delegable: true,
        displayLocations: ['sidebar'],
      }),
    ],
    policyCount: 0,
  },
];

/**
 * Built-in CPA profile fields. Read-only system rows rendered above the
 * configurable user attributes on the User Attributes surface (fidelity to the
 * shipped System Console). Not deletable, not editable in this UI.
 */
function builtInUserField(id: string, name: string, type: AttrType): AttrDef {
  return {
    id,
    name,
    type,
    scope: 'resource',
    system: true,
    values: [],
    owner: null,
    read: 'Public',
    write: { field: 'owner', option: 'owner', value: 'owner' },
    protected: true,
    appliesTo: ['Users'],
    bindings: [binding('Users', { whoCanSet: 'owner', mutability: 'Locked' })],
    policyCount: 0,
  };
}

export const BUILT_IN_USER_FIELDS: AttrDef[] = [
  builtInUserField('builtin-profile-image', 'Profile image', 'Image'),
  builtInUserField('builtin-first-name', 'First name', 'Text'),
  builtInUserField('builtin-last-name', 'Last name', 'Text'),
  builtInUserField('builtin-username', 'Username', 'Text'),
  builtInUserField('builtin-email', 'Email', 'Email'),
  builtInUserField('builtin-title', 'Title', 'Text'),
];

export const SCOPE_LABEL: Record<AttrDef['scope'], string> = {
  global: 'Global',
  resource: 'Resource-scoped',
  team: 'Team-scoped',
};

/** A resource-scoped (non-global) attribute can be elevated to global. */
export function canPromote(def: AttrDef): boolean {
  return def.scope !== 'global';
}

/** Builds a fresh binding for a newly applied / created resource type. */
export function makeBinding(
  resource: ResourceType,
  over: Partial<Binding> = {},
): Binding {
  return binding(resource, over);
}

/** Global definitions not yet applied to a given resource type. */
export function globalsNotAppliedTo(
  defs: AttrDef[],
  resource: ResourceType,
): AttrDef[] {
  return defs.filter(
    (d) => d.scope === 'global' && !d.appliesTo.includes(resource),
  );
}
