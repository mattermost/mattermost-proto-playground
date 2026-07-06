/**
 * Attribute Management — shared data model (Variation A + B).
 *
 * Seed data only. Avatars and customer names are NOT used here — attributes
 * are platform-level definitions, not user content.
 *
 * The seeds carry the specific exemplar states from the states-and-interactions
 * spec so every interaction can be shown on a concrete attribute.
 */

export type AttributeType =
  | 'Ranked'
  | 'Select'
  | 'Multiselect'
  | 'Text'
  | 'Date'
  | 'Hierarchical';

export type Resource = 'Users' | 'Channels' | 'Posts' | 'Teams';

/** Source-health state. Non-color-only — each state has a distinct icon. */
export type SourceState = 'Synced' | 'Stale' | 'Failed';

/** Sub-class shown only in detail, never on the row. */
export type SourceErrorClass =
  | 'auth'
  | 'mapping'
  | 'schema-drift'
  | 'endpoint-down'
  | null;

export type ValueSource =
  | { kind: 'manual' }
  | {
      kind: 'synced';
      system: 'UAS' | 'LDAP' | 'SCIM';
      state: SourceState;
      errorClass: SourceErrorClass;
      lastSuccessISO: string; // ISO timestamp of last successful sync
      lastAttemptISO: string; // ISO timestamp of last attempt (may equal success)
      cadence: string; // e.g. "Pull every 15m"
      runId: string;
      fieldMap: string; // e.g. "local.program ← uas.profile.program_code"
      /**
       * Plain-language reason / last error for a non-Synced state. Empty for
       * Synced. Shown verbatim in the detail's Value source block (finding 2).
       */
      reason?: string;
      /** ISO timestamp of the next scheduled run (finding 2). */
      nextRunISO?: string;
    };

/** A value option for Select/Multiselect/Ranked types. */
export interface ValueOption {
  id: string;
  label: string;
  /** Rank index for Ranked types (lower = higher precedence). */
  rank?: number;
}

/** Channel display location options. Banner is Classification-type only. Multi-select. */
export type DisplayLocationOption = 'Header' | 'Sidebar' | 'Banner';
export type DisplayLocations = DisplayLocationOption[] | 'hidden';

export const DISPLAY_LOCATION_ORDER: DisplayLocationOption[] = [
  'Header',
  'Banner',
  'Sidebar',
];

/** Sidebar is always on unless the attribute is hidden. */
export function normalizeDisplayLocations(
  value: DisplayLocations | undefined,
): DisplayLocations {
  if (value === 'hidden') return 'hidden';
  if (!value || value.length === 0) return ['Sidebar'];
  if (value.includes('Sidebar')) return value;
  return [...value, 'Sidebar'];
}

export function isDisplayHidden(
  value: DisplayLocations | undefined,
): boolean {
  return value === 'hidden';
}

export function displayIncludes(
  value: DisplayLocations | undefined,
  loc: DisplayLocationOption,
): boolean {
  const normalized = normalizeDisplayLocations(value);
  return normalized !== 'hidden' && normalized.includes(loc);
}

export function toggleDisplayLocation(
  current: DisplayLocations | undefined,
  loc: DisplayLocationOption,
): DisplayLocations {
  if (loc === 'Sidebar') {
    return normalizeDisplayLocations(current);
  }
  const normalized =
    current === 'hidden' ? (['Sidebar'] as DisplayLocationOption[]) : normalizeDisplayLocations(current);
  if (normalized === 'hidden') return ['Sidebar'];
  const has = normalized.includes(loc);
  if (has) {
    const next = normalized.filter((l) => l !== loc);
    return normalizeDisplayLocations(next.length === 0 ? ['Sidebar'] : next);
  }
  return DISPLAY_LOCATION_ORDER.filter(
    (l) => l === loc || normalized.includes(l),
  );
}

export function setDisplayHidden(): DisplayLocations {
  return 'hidden';
}

export function clearDisplayHidden(
  current: DisplayLocations | undefined,
): DisplayLocations {
  if (current !== 'hidden') return normalizeDisplayLocations(current);
  return ['Sidebar'];
}

/** Channels → posts inheritance, three-state. */
export type InheritMode = 'off' | 'inherit' | 'inherit-lock';

/** Users profile display, two-state. */
export type UserDisplay = 'show' | 'hide-empty';

/** Per-resource configuration. Different resources expose different controls. */
export interface ResourceBinding {
  resource: Resource;
  /** Channels/Posts/Teams only — not applicable for Users. */
  required?: boolean;
  /** Who sets the value. Read-only role chip. */
  whoSets: string;
  /** Users profile display. Users only. */
  userDisplay?: UserDisplay;
  /** Channel display locations. Channels only. Sidebar is always on unless hidden. */
  displayLocations?: DisplayLocations;
  /** Channels → posts inheritance. Channels only. */
  inheritMode?: InheritMode;
}

export interface SharedValuesLink {
  /** Sibling attribute id this attribute shares values with. */
  siblingId: string;
  /** "mirrors" → this attribute inherits the sibling's schema (read-only). */
  /** "owns" → this attribute is the canonical source; siblings mirror it. */
  direction: 'mirrors' | 'owns';
}

export interface Attribute {
  id: string;
  name: string;
  type: AttributeType;
  description?: string;
  values: ValueOption[];
  source: ValueSource;
  /** Externally owned (UAS/LDAP/SCIM) → values are read-only here. */
  externallyOwned: boolean;
  /**
   * Restricted values: the viewing admin only sees the values assigned to
   * them; the rest are masked with no count leak.
   */
  restrictedValues: boolean;
  /** Value ids the viewing admin holds (only meaningful when restricted). */
  adminHeldValueIds?: string[];
  selfEdit: boolean; // Users-only; ignored if Users not in appliesTo
  valueVisibility: 'Visible' | 'Restricted';
  appliesTo: ResourceBinding[];
  /** In-use by N membership/access policies. 0 = not in use. */
  inUseByPolicies: number;
  sharedValuesLink?: SharedValuesLink;
  /** Names of attributes that mirror THIS attribute's schema (it owns them). */
  sharedWith?: string[];
}

/** Eligibility is DERIVED (not stored). Surface as filter + audit view. */
export function isEligibleForPolicies(a: Attribute): {
  eligible: boolean;
  reason: string;
} {
  const appliesToUsers = a.appliesTo.some((b) => b.resource === 'Users');
  if (appliesToUsers && a.selfEdit && !a.externallyOwned) {
    return {
      eligible: false,
      reason: 'Users can edit their own value, so it cannot be trusted for access.',
    };
  }
  if (a.appliesTo.some((b) => b.resource === 'Posts')) {
    const channels = a.appliesTo.find((b) => b.resource === 'Channels');
    if (channels) {
      return { eligible: true, reason: 'Set on the channel and inherited by posts.' };
    }
  }
  if (a.appliesTo.some((b) => b.resource === 'Teams')) {
    return { eligible: true, reason: 'Set by a team admin, not the end user.' };
  }
  return { eligible: true, reason: 'End users cannot edit their own value.' };
}

/**
 * Source-freshness caveat (finding 1). Eligibility-by-rule and freshness are
 * orthogonal: a synced attribute can be eligible-by-rule yet stale/failed NOW.
 * Returns a caveat string when the source is non-Synced; null otherwise.
 */
export function freshnessCaveat(a: Attribute): {
  state: SourceState;
  short: string; // row-level, e.g. "source stale 2d"
  long: string; // detail-level, e.g. "the source last synced 2d ago"
} | null {
  if (a.source.kind !== 'synced') return null;
  if (a.source.state === 'Synced') return null;
  const ago = relativeAgo(a.source.lastSuccessISO);
  switch (a.source.state) {
    case 'Stale':
      return {
        state: 'Stale',
        short: `source stale ${ago}`,
        long: `the source last synced ${ago}`,
      };
    case 'Failed':
      return {
        state: 'Failed',
        short: 'source sync failed',
        long: `the last sync failed (last success ${ago})`,
      };
    default: {
      const _exhaustive: never = a.source.state;
      return _exhaustive;
    }
  }
}

/**
 * Free-text eligibility caveat (finding 4). Text attributes have no validated
 * value set, so policy matches are exact-string and brittle. Returns a caveat
 * string for Text attributes; null otherwise.
 */
export function textTypeCaveat(a: Attribute): string | null {
  if (a.type !== 'Text') return null;
  return 'values are free text — policies match the exact string';
}

/** Compact relative-age string ("2d", "30m", "3h") for caveats. */
export function relativeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.max(1, Math.round((now - then) / 60000));
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffD = Math.round(diffHr / 24);
  return `${diffD}d`;
}

/** True when this attribute's values come from an external source. */
export function isReadOnlyValues(a: Attribute): boolean {
  return a.externallyOwned;
}

/** True when this attribute mirrors another attribute's schema. */
export function isMirroring(a: Attribute): boolean {
  return a.sharedValuesLink?.direction === 'mirrors';
}

// ─── Seeds ────────────────────────────────────────────────────────────────────

const CLASSIFICATION_VALUES: ValueOption[] = [
  { id: 'u', label: 'Unclassified', rank: 0 },
  { id: 'c', label: 'Confidential', rank: 1 },
  { id: 's', label: 'Secret', rank: 2 },
  { id: 'ts', label: 'Top Secret', rank: 3 },
];

export const ATTRIBUTES: Attribute[] = [
  // Classification — MIRRORS Clearance's value scheme (read-only, inherited).
  // Applied to resources only (Channels/Posts/Teams), never Users. Used by
  // active policies → values/order locked; Banner display; inherit + lock to
  // posts; ceiling rule. Values come from Clearance (the owner), sourced from UAS.
  {
    id: 'classification',
    name: 'Classification',
    type: 'Ranked',
    description:
      'Sensitivity level applied to channels, posts, and teams. Mirrors the Clearance value scale.',
    values: CLASSIFICATION_VALUES,
    source: { kind: 'manual' },
    // Mattermost admins set the channel/post/team value, so it is not
    // externally owned — but the value SCHEME is inherited (mirrored) from
    // Clearance and locked while in use by policies.
    externallyOwned: false,
    restrictedValues: false,
    selfEdit: false,
    valueVisibility: 'Visible',
    appliesTo: [
      {
        resource: 'Channels',
        required: true,
        whoSets: 'Channel admin',
        displayLocations: ['Sidebar', 'Banner'],
        inheritMode: 'inherit-lock',
      },
      {
        resource: 'Posts',
        required: false,
        whoSets: 'Post author',
      },
      {
        resource: 'Teams',
        required: false,
        whoSets: 'Team admin',
      },
    ],
    inUseByPolicies: 3,
    sharedValuesLink: { siblingId: 'clearance', direction: 'mirrors' },
  },
  // Clearance — the SOURCE of the value scheme. Externally owned; ranks are
  // synced from UAS (Unclassified → Top Secret). Applied to Users only. It does
  // NOT mirror anything — it owns the scheme; Classification mirrors it.
  // Self-edit Off → eligible.
  {
    id: 'clearance',
    name: 'Clearance',
    type: 'Ranked',
    description:
      'User clearance level, synced from UAS. Owns the value scale that Classification mirrors.',
    values: CLASSIFICATION_VALUES,
    source: {
      kind: 'synced',
      system: 'UAS',
      state: 'Synced',
      errorClass: null,
      lastSuccessISO: '2026-07-01T08:30:00Z',
      lastAttemptISO: '2026-07-01T08:30:00Z',
      cadence: 'Pull every 15m',
      runId: 'uas-run-3f8a2c',
      fieldMap: 'local.clearance ← uas.profile.clearance_level',
    },
    externallyOwned: true,
    restrictedValues: false,
    selfEdit: false,
    valueVisibility: 'Visible',
    appliesTo: [
      {
        resource: 'Users',
        whoSets: 'UAS',
        userDisplay: 'hide-empty',
      },
    ],
    inUseByPolicies: 4,
    sharedWith: ['Classification'],
  },
  // Program — restricted values (sysadmin sees only their own + masked notice,
  // no count leak); externally owned; in-use by a membership policy → lock.
  {
    id: 'program',
    name: 'Program',
    type: 'Multiselect',
    description: 'Named program assignment.',
    values: [
      { id: 'p1', label: 'Aurora' },
      { id: 'p2', label: 'Beacon' },
      { id: 'p3', label: 'Cipher' },
      { id: 'p4', label: 'Delta' },
    ],
    source: {
      kind: 'synced',
      system: 'UAS',
      state: 'Synced',
      errorClass: null,
      lastSuccessISO: '2026-07-01T08:45:00Z',
      lastAttemptISO: '2026-07-01T08:45:00Z',
      cadence: 'Pull every 15m',
      runId: 'uas-run-3f8a31',
      fieldMap: 'local.program ← uas.profile.program_code',
    },
    externallyOwned: true,
    restrictedValues: true,
    adminHeldValueIds: ['p1'], // viewing admin holds Aurora only
    selfEdit: false,
    valueVisibility: 'Restricted',
    appliesTo: [
      {
        resource: 'Users',
        whoSets: 'UAS',
        userDisplay: 'hide-empty',
      },
      {
        resource: 'Channels',
        required: true,
        whoSets: 'Channel admin',
        displayLocations: ['Sidebar'],
        inheritMode: 'off',
      },
    ],
    inUseByPolicies: 2,
  },
  // Department — the stale-source exemplar. Externally owned (LDAP) so values
  // are frozen and self-edit is disabled; eligibility "Yes" (the source, not
  // the user, sets the value). Stale source state (2d since last success).
  {
    id: 'department',
    name: 'Department',
    type: 'Select',
    description: 'User department, sourced from LDAP.',
    values: [
      { id: 'd1', label: 'Engineering' },
      { id: 'd2', label: 'Operations' },
      { id: 'd3', label: 'Security' },
      { id: 'd4', label: 'Compliance' },
    ],
    source: {
      kind: 'synced',
      system: 'LDAP',
      state: 'Stale',
      errorClass: 'schema-drift',
      lastSuccessISO: '2026-06-29T06:00:00Z',
      lastAttemptISO: '2026-07-01T06:00:00Z',
      cadence: 'Pull every 6h',
      runId: 'ldap-run-9b21e0',
      fieldMap: 'local.department ← ldap.ou',
      reason:
        'Missed last 2 scheduled syncs — last attempt returned 0 records (LDAP filter matched nothing).',
      nextRunISO: '2026-07-01T12:00:00Z',
    },
    // Externally owned: values are frozen and self-edit is disabled. This is
    // the realistic LDAP case — you can't self-edit an externally-synced value.
    // Eligibility resolves to "Yes" (end users can't edit their own value).
    externallyOwned: true,
    restrictedValues: false,
    selfEdit: false,
    valueVisibility: 'Visible',
    appliesTo: [
      {
        resource: 'Users',
        whoSets: 'LDAP',
        userDisplay: 'hide-empty',
      },
    ],
    inUseByPolicies: 0,
  },
  // Duty status — the eligibility-"No" exemplar. Manual + self-edit On for a
  // Users-bound, not-externally-owned attribute → "No, users can edit their
  // own value, so it can't be trusted for access decisions." Not in a policy
  // (the safe self-edit demo per §8).
  {
    id: 'duty-status',
    name: 'Duty status',
    type: 'Select',
    description: 'Current duty status, set by the user on their profile.',
    values: [
      { id: 'ds1', label: 'On duty' },
      { id: 'ds2', label: 'Off duty' },
      { id: 'ds3', label: 'On leave' },
      { id: 'ds4', label: 'TDY' },
    ],
    source: { kind: 'manual' },
    externallyOwned: false,
    restrictedValues: false,
    selfEdit: true,
    valueVisibility: 'Visible',
    appliesTo: [
      {
        resource: 'Users',
        whoSets: 'Members',
        userDisplay: 'hide-empty',
      },
    ],
    inUseByPolicies: 0,
  },
  // Caveat — dissemination handling markings. Multiselect, manual, closed
  // vocabulary; applies to channels + posts. Referenced by 1 policy so it
  // shows the in-use lock glyph. Not externally owned.
  {
    id: 'caveat',
    name: 'Caveat',
    type: 'Multiselect',
    description:
      'Dissemination handling markings applied to channels and posts.',
    values: [
      { id: 'cv1', label: 'FOUO' },
      { id: 'cv2', label: 'NOFORN' },
      { id: 'cv3', label: 'REL TO USA/FVEY' },
      { id: 'cv4', label: 'ORCON' },
    ],
    source: { kind: 'manual' },
    externallyOwned: false,
    restrictedValues: false,
    selfEdit: false,
    valueVisibility: 'Visible',
    appliesTo: [
      {
        resource: 'Channels',
        required: false,
        whoSets: 'Channel admin',
        displayLocations: ['Header', 'Sidebar'],
        inheritMode: 'inherit',
      },
      {
        resource: 'Posts',
        required: false,
        whoSets: 'Post author',
      },
    ],
    inUseByPolicies: 1,
  },
  // Rank — a second Ranked example, externally synced (LDAP/HR), applies to
  // users. Externally owned/frozen, eligible. Representative subset of the
  // enlisted/warrant/officer ladder.
  {
    id: 'rank',
    name: 'Rank',
    type: 'Ranked',
    description: 'Pay grade, synced from the HR system of record.',
    values: [
      { id: 'r-e1', label: 'E-1', rank: 0 },
      { id: 'r-e5', label: 'E-5', rank: 1 },
      { id: 'r-w2', label: 'W-2', rank: 2 },
      { id: 'r-o1', label: 'O-1', rank: 3 },
      { id: 'r-o6', label: 'O-6', rank: 4 },
      { id: 'r-o10', label: 'O-10', rank: 5 },
    ],
    source: {
      kind: 'synced',
      system: 'LDAP',
      state: 'Failed',
      errorClass: 'endpoint-down',
      // Last success ~22h ago; subsequent attempts failed to connect.
      lastSuccessISO: '2026-06-30T10:15:00Z',
      lastAttemptISO: '2026-07-01T08:15:00Z',
      cadence: 'Pull every 6h',
      runId: 'ldap-run-9b2240',
      fieldMap: 'local.rank ← ldap.payGrade',
      reason: 'LDAP bind timed out — directory host did not respond on port 636.',
      nextRunISO: '2026-07-01T14:15:00Z',
    },
    externallyOwned: true,
    restrictedValues: false,
    selfEdit: false,
    valueVisibility: 'Visible',
    appliesTo: [
      {
        resource: 'Users',
        whoSets: 'LDAP',
        userDisplay: 'hide-empty',
      },
    ],
    inUseByPolicies: 0,
  },
  // Cost center — Text type example + SCIM source. Externally owned/frozen,
  // value visibility Visible. Text has no value options/order (no values
  // editor in the detail).
  {
    id: 'cost-center',
    name: 'Cost center',
    type: 'Text',
    description: 'Accounting cost center, synced from SCIM.',
    values: [],
    source: {
      kind: 'synced',
      system: 'SCIM',
      state: 'Synced',
      errorClass: null,
      lastSuccessISO: '2026-07-01T08:20:00Z',
      lastAttemptISO: '2026-07-01T08:20:00Z',
      cadence: 'Pull every 1h',
      runId: 'scim-run-7c41a9',
      fieldMap: 'local.costCenter ← scim.enterprise.costCenter',
    },
    externallyOwned: true,
    restrictedValues: false,
    selfEdit: false,
    valueVisibility: 'Visible',
    appliesTo: [
      {
        resource: 'Users',
        whoSets: 'SCIM',
        userDisplay: 'hide-empty',
      },
    ],
    inUseByPolicies: 0,
  },
  // Community of interest (COI) — second cross-cutting + restricted example.
  // Multiselect, externally synced (UAS), applies to users + channels.
  // Restricted values: the viewing admin sees only their own + a masked notice
  // (like Program), no count leak.
  {
    id: 'coi',
    name: 'Community of interest (COI)',
    type: 'Multiselect',
    description: 'Community-of-interest membership, sourced from UAS.',
    values: [
      { id: 'coi1', label: 'Maritime ISR' },
      { id: 'coi2', label: 'Space Domain Awareness' },
      { id: 'coi3', label: 'Cyber Defense' },
      { id: 'coi4', label: 'Logistics Coordination' },
    ],
    source: {
      kind: 'synced',
      system: 'UAS',
      state: 'Failed',
      errorClass: 'auth',
      // Last success ~5h ago; subsequent attempts returned an auth error.
      lastSuccessISO: '2026-07-01T03:50:00Z',
      lastAttemptISO: '2026-07-01T08:50:00Z',
      cadence: 'Pull every 15m',
      runId: 'uas-run-3f8a44',
      fieldMap: 'local.coi ← uas.profile.coi_tags',
      reason:
        'UAS rejected the sync credential (HTTP 401 invalid_token) — the service account token has expired.',
      nextRunISO: '2026-07-01T09:05:00Z',
    },
    externallyOwned: true,
    restrictedValues: true,
    adminHeldValueIds: ['coi3'], // viewing admin holds Cyber Defense only
    selfEdit: false,
    valueVisibility: 'Restricted',
    appliesTo: [
      {
        resource: 'Users',
        whoSets: 'UAS',
        userDisplay: 'hide-empty',
      },
      {
        resource: 'Channels',
        required: false,
        whoSets: 'Channel admin',
        displayLocations: ['Sidebar'],
        inheritMode: 'off',
      },
    ],
    inUseByPolicies: 0,
  },
  // Mission tag — fully editable; not in any policy → order editable, deletable
  // (the everything-unlocked baseline / contrast case).
  {
    id: 'mission-tag',
    name: 'Mission tag',
    type: 'Select',
    description: 'Mission tag applied at post time.',
    values: [
      { id: 'm1', label: 'ISR' },
      { id: 'm2', label: 'Logistics' },
      { id: 'm3', label: 'Recon' },
      { id: 'm4', label: 'Training' },
    ],
    source: { kind: 'manual' },
    externallyOwned: false,
    restrictedValues: false,
    selfEdit: false,
    valueVisibility: 'Visible',
    appliesTo: [
      {
        resource: 'Posts',
        required: false,
        whoSets: 'Post author',
      },
    ],
    inUseByPolicies: 0,
  },
  // Project phase — team binding; manual; editable.
  {
    id: 'project-phase',
    name: 'Project phase',
    type: 'Select',
    description: 'Lifecycle phase of a team workstream.',
    values: [
      { id: 'ph1', label: 'Discovery' },
      { id: 'ph2', label: 'Build' },
      { id: 'ph3', label: 'Operate' },
      { id: 'ph4', label: 'Sunset' },
    ],
    source: { kind: 'manual' },
    externallyOwned: false,
    restrictedValues: false,
    selfEdit: false,
    valueVisibility: 'Visible',
    appliesTo: [
      {
        resource: 'Teams',
        required: false,
        whoSets: 'Team admin',
      },
    ],
    inUseByPolicies: 0,
  },
];

export const RESOURCE_PILLS: { key: 'All' | Resource; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Users', label: 'Users' },
  { key: 'Channels', label: 'Channels' },
  { key: 'Posts', label: 'Posts' },
  { key: 'Teams', label: 'Teams' },
];

/** All resource kinds, for the "+ Add resource" picker. */
export const ALL_RESOURCES: Resource[] = ['Users', 'Channels', 'Posts', 'Teams'];

/** Demo policy names — generic, no customer names. */
export const POLICY_NAMES = [
  'Restrict TS+ channels',
  'Program-Aurora access',
  'Compliance read-only',
  'Clearance gate',
];

/** Policies bound to a given attribute, by count. */
export function policiesFor(a: Attribute): string[] {
  return POLICY_NAMES.slice(0, a.inUseByPolicies);
}

// ─── Shared copy strings (single source — both variations consume) ──────────────
// Per re-review §3.3: one strings file prevents copy drift between A and B.

export const DISABLED_REASONS = {
  externalValues: (system: string) =>
    `Values are managed by ${system}. They can't be viewed or edited here.`,
  lockedByPolicy: (n: number) =>
    `Used by ${n} active ${n === 1 ? 'policy' : 'policies'}. Changing this re-evaluates access.`,
  bannerClassificationOnly:
    'Banner display is available for classification attributes only.',
  reuseChainBlocked:
    "This attribute already mirrors another, so it can't be mirrored again.",
  selfEditExternal:
    "Users can't self-edit values managed by an external source.",
  deactivateUntilCleared:
    'Remove this attribute from all resources before deactivating.',
  manageLinked: (name: string) =>
    `These values come from ${name}. Edit them on that attribute.`,
  // Finding 6: self-edit is eligibility-affecting; lock it on a policy-bound
  // attribute the same way value order is locked, with the same reason shape.
  selfEditLockedByPolicy: (n: number) =>
    `Used by ${n} active ${n === 1 ? 'policy' : 'policies'}. Turning self-edit on would flip this attribute to ineligible and break those policies.`,
} as const;

export const HELP_COPY = {
  rankedType:
    "Ranked values compare by order. A higher value dominates a lower one. This powers rules like “a user's Clearance must be at or above a channel's Classification.”",
  ceiling:
    'Posts inherit the channel’s value and can’t be set higher than it. A post in a Secret channel can be Secret or lower, never Top Secret. Channels are likewise capped by the system maximum.',
} as const;
