/**
 * Global Membership Policies — SHARED data model.
 *
 * Consumed READ-ONLY by both prototype scenes:
 *   - GlobalMembershipPolicyLongForm  (Direction A — literal single-page mockup)
 *   - GlobalMembershipPolicyGuided     (Direction B — guided steps + review-as-gate)
 *
 * A policy is authored once and compares a USER attribute against a CHANNEL
 * attribute (relative comparison) or a pre-approved literal. It targets channels
 * by scope, and enforcement is DERIVED by channel type (never chosen per policy):
 *   - private channels  → non-matching members are REMOVED
 *   - public channels   → channel is removed from the member's recommendations
 *
 * Terminology, decisions and behaviors are locked in
 * specs/attribute-system/global-membership-policies/00-brief.md (C1–C19).
 */

// ─── Attribute + operator model (mirrors the who-block requirement rows) ──────

export type AttrKind = 'ranked' | 'select' | 'multiselect';

/** Type-aware operator sets. */
export const OPERATORS: Record<AttrKind, { id: string; label: string }[]> = {
  ranked: [
    { id: 'at-least', label: 'is at least' },
    { id: 'at-most', label: 'is at most' },
    { id: 'equals', label: 'is equal to' },
  ],
  select: [
    { id: 'is', label: 'is' },
    { id: 'is-one-of', label: 'is one of' },
  ],
  multiselect: [
    { id: 'includes', label: 'includes' },
    { id: 'includes-any', label: 'includes any of' },
  ],
};

/** A user attribute — left side of a "who" requirement row. */
export interface UserAttrOption {
  id: string;
  label: string; // e.g. "User: Clearance"
  kind: AttrKind;
}

export const USER_ATTRS: UserAttrOption[] = [
  { id: 'clearance', label: 'User: Clearance', kind: 'ranked' },
  { id: 'program', label: 'User: Program', kind: 'select' },
  { id: 'department', label: 'User: department', kind: 'select' },
  { id: 'nationality', label: 'User: Nationality', kind: 'select' },
  { id: 'coi', label: 'User: Community of interest', kind: 'multiselect' },
];

/** A channel attribute usable as a VARIABLE on the right of a "who" row. */
export interface ChannelVarOption {
  id: string;
  label: string; // e.g. "Channel: Classification"
  kind: AttrKind;
}

export const CHANNEL_VARIABLES: ChannelVarOption[] = [
  { id: 'ch-classification', label: 'Channel: Classification', kind: 'ranked' },
  { id: 'ch-program', label: 'Channel: Program', kind: 'select' },
  { id: 'ch-department', label: 'Channel: department', kind: 'select' },
  { id: 'ch-releasability', label: 'Channel: Releasability', kind: 'select' },
];

/** Pre-approved literal values, per user attribute (no free text). */
export const LITERALS: Record<string, { id: string; label: string }[]> = {
  clearance: [
    { id: 'unclassified', label: 'Unclassified' },
    { id: 'confidential', label: 'Confidential' },
    { id: 'secret', label: 'Secret' },
    { id: 'top-secret', label: 'Top Secret' },
  ],
  program: [
    { id: 'dragon-spacecraft', label: 'Dragon Spacecraft' },
    { id: 'falcon-heavy', label: 'Falcon Heavy' },
    { id: 'starlink', label: 'Starlink' },
  ],
  department: [
    { id: 'engineering', label: 'Engineering' },
    { id: 'operations', label: 'Operations' },
    { id: 'intelligence', label: 'Intelligence' },
  ],
  nationality: [
    { id: 'usa', label: 'USA' },
    { id: 'gbr', label: 'GBR' },
    { id: 'can', label: 'CAN' },
    { id: 'aus', label: 'AUS' },
  ],
  coi: [
    { id: 'maritime-isr', label: 'Maritime ISR' },
    { id: 'cyber-defense', label: 'Cyber Defense' },
  ],
};

export type ReqValue =
  | { mode: 'variable'; variableId: string }
  | { mode: 'literal'; labels: string[] };

export interface Requirement {
  id: string;
  userAttrId: string;
  operatorId: string;
  value: ReqValue;
}

/** Seed matching the mockups: User:Clearance ≥ Channel:Classification + User:Program = Channel:Program. */
export const SEED_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-1',
    userAttrId: 'clearance',
    operatorId: 'at-least',
    value: { mode: 'variable', variableId: 'ch-classification' },
  },
  {
    id: 'req-2',
    userAttrId: 'program',
    operatorId: 'is',
    value: { mode: 'variable', variableId: 'ch-program' },
  },
];

/** DS Program — adaptive clearance + program read-in (customer story). */
export const DS_PROGRAM_REQUIREMENTS = SEED_REQUIREMENTS;

/** Dragon Spacecraft — clearance only; program targeting lives in scope conditions. */
export const DRAGON_SPACECRAFT_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-1',
    userAttrId: 'clearance',
    operatorId: 'at-least',
    value: { mode: 'variable', variableId: 'ch-classification' },
  },
  {
    id: 'req-2',
    userAttrId: 'nationality',
    operatorId: 'is-one-of',
    value: { mode: 'literal', labels: ['USA', 'GBR'] },
  },
];

/** Northern Command — coalition clearance + nationality gate. */
export const NORTHERN_COMMAND_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-1',
    userAttrId: 'clearance',
    operatorId: 'at-least',
    value: { mode: 'variable', variableId: 'ch-classification' },
  },
  {
    id: 'req-2',
    userAttrId: 'nationality',
    operatorId: 'is-one-of',
    value: { mode: 'literal', labels: ['USA', 'GBR', 'CAN', 'AUS'] },
  },
];

export const NOFORN_HANDLING_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-1',
    userAttrId: 'clearance',
    operatorId: 'at-least',
    value: { mode: 'variable', variableId: 'ch-classification' },
  },
  {
    id: 'req-2',
    userAttrId: 'nationality',
    operatorId: 'is',
    value: { mode: 'literal', labels: ['USA'] },
  },
];

/** Literal-only seed for the editor-tour literal-rules example. */
export const SEED_LITERAL_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-1',
    userAttrId: 'clearance',
    operatorId: 'at-least',
    value: { mode: 'literal', labels: ['Confidential'] },
  },
];

// ─── Scope model — "Where this policy applies" (three radios) ─────────────────

export type ScopeMode = 'all-where-set' | 'manual' | 'attribute-rules';

export const SCOPE_OPTIONS: { id: ScopeMode; title: string; body: string }[] = [
  {
    id: 'all-where-set',
    title: 'All channels where the referenced attributes are set',
    body: 'Channels that don’t have those attributes set are skipped.',
  },
  {
    id: 'manual',
    title: 'Select channels manually',
    body: 'Pick specific channels yourself.',
  },
  {
    id: 'attribute-rules',
    title: 'Select channels with attribute-based rules',
    body: 'Include channels that match the channel-attribute conditions you set below.',
  },
];

/**
 * Radio-1 ("all-where-set") copy adapts to the rules above:
 *  - if a rule references a channel attribute → use SCOPE_OPTIONS[all-where-set]
 *    ("All channels where the referenced attributes are set" + skip note)
 *  - if NO channel attribute is referenced (literals only) → "referenced
 *    attributes" is meaningless, so fall back to plain "All channels".
 */
export const ALL_CHANNELS_NO_REF = {
  title: 'All channels',
  body: 'This policy applies to every channel.',
};

/**
 * Channel-type filter — REFINED C7b (Phase 4 gate):
 * shown ONLY under the "all-where-set" radio. NOT shown for manual or
 * attribute-rules (those modes already define their channel set).
 */
export type ChannelTypeFilter = 'all' | 'public' | 'private';

export const CHANNEL_TYPE_OPTIONS: {
  id: ChannelTypeFilter;
  label: string;
}[] = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public only' },
  { id: 'private', label: 'Private only' },
];

export const TYPE_FILTER_APPLIES_TO: ScopeMode = 'all-where-set';

/**
 * Consequence-labeled channel-type copy (v2). Each option states its effect in
 * one line. `Private only` is intrinsically destructive. Copy sourced from
 * ENFORCEMENT_BY_TYPE; kept here so both scenes read the same strings.
 */
export const CHANNEL_TYPE_CONSEQUENCE: Record<
  ChannelTypeFilter,
  { label: string; consequence: string; destructive: boolean }
> = {
  all: {
    label: 'All channels',
    // UI shows public + private breakdown rows; kept for typing / future reuse.
    consequence: 'Applies to both public and private channels in scope.',
    destructive: true,
  },
  public: {
    label: 'Public channels only',
    consequence:
      'Members who don’t match keep their access. The channel is removed from their recommendations.',
    destructive: false,
  },
  private: {
    label: 'Private channels only',
    consequence: 'Members who don’t match are removed from these channels.',
    destructive: true,
  },
};

/** A channel-attribute condition row (attribute-rules mode). Reuses the row pattern. */
export interface ChannelCondition {
  id: string;
  channelAttrId: string; // references CHANNEL_VARIABLES
  operatorId: string;
  labels: string[];
}

export const SEED_CHANNEL_CONDITIONS: ChannelCondition[] = [
  {
    id: 'cc-1',
    channelAttrId: 'ch-program',
    operatorId: 'is',
    labels: ['Dragon Spacecraft'],
  },
];

export const NORTHERN_COMMAND_CONDITIONS: ChannelCondition[] = [
  {
    id: 'cc-1',
    channelAttrId: 'ch-department',
    operatorId: 'is',
    labels: ['Operations'],
  },
];

export const NOFORN_HANDLING_CONDITIONS: ChannelCondition[] = [
  {
    id: 'cc-1',
    channelAttrId: 'ch-releasability',
    operatorId: 'is',
    labels: ['NOFORN'],
  },
];

// ─── Manual channel selection (shipping "Applies to" table) ───────────────────

/**
 * Manually-selected channels — seeds the shipping channel table under the
 * "Select channels manually" mode. Mirrors Current-membership-policy.png.
 * `private: true` renders a lock glyph (all seeded channels are private).
 * `autoAdd` is a per-channel setting (stays out of policy scope, C3).
 */
export interface ManualChannel {
  id: string;
  name: string;
  team: string;
  private: boolean;
  autoAdd: boolean;
}

export const MANUAL_CHANNELS: ManualChannel[] = [
  { id: 'ch-mountain', name: 'Mountain Initiative', team: 'River City', private: true, autoAdd: false },
  { id: 'ch-agents', name: 'Agents Network', team: 'Capital District', private: true, autoAdd: false },
  { id: 'ch-clearance', name: 'Operation Clearance', team: 'Capital District', private: true, autoAdd: true },
  { id: 'ch-drill', name: 'Drill Discussion', team: 'River City', private: true, autoAdd: true },
  { id: 'ch-alpine', name: 'Alpine Project', team: 'Capital District', private: true, autoAdd: false },
];

/** Manually-selected teams — seeds the Teams tab (manual-only this iteration). */
export interface PolicyTeam {
  id: string;
  name: string;
  autoAdd: boolean;
}

export const TEAMS: PolicyTeam[] = [
  { id: 'team-river-city', name: 'River City', autoAdd: false },
  { id: 'team-capital-district', name: 'Capital District', autoAdd: true },
];

// ─── Enforcement (derived by channel type — not chosen per policy) ────────────

export const ENFORCEMENT_BY_TYPE = {
  private: {
    verb: 'Remove non-matching members',
    detail:
      'Members who don’t match this policy are removed from private channels in scope.',
    destructive: true,
  },
  public: {
    verb: 'Remove from recommendations',
    detail:
      'Non-matching members keep access; the channel is removed from their recommendations.',
    destructive: false,
  },
} as const;

/** Canonical tighten-only composition statement (VP-1 designed as engine guarantee). */
export const TIGHTEN_ONLY_STATEMENT =
  'Members must meet every policy that applies. Channel rules can make access stricter, but never looser than system policies.';

/** Re-evaluation cadence copy (VP-3 assumption: ~15 min, configurable). */
export const REEVAL_CADENCE_COPY =
  'Changes take effect the next time policies are evaluated (about every 15 minutes).';

// ─── Impact model (async-first three-state gate — VP-2) ───────────────────────

export type GateState = 'computing' | 'results' | 'error';

export interface PolicyImpact {
  channelsInScope: number;
  publicChannels: number;
  privateChannels: number;
  usersDeRecommended: number; // public side (non-destructive)
  usersRemoved: number; // private side (DESTRUCTIVE)
  skippedMissingAttr: number; // channels excluded — referenced attribute not set
  largeBlastRadius: boolean; // triggers heightened warning treatment
}

/** Mock impact for the populated/seeded policy (matches the wireframes). */
export const SEED_IMPACT: PolicyImpact = {
  channelsInScope: 42,
  publicChannels: 25,
  privateChannels: 17,
  usersDeRecommended: 63,
  usersRemoved: 17,
  skippedMissingAttr: 3,
  largeBlastRadius: false,
};

/** Mock "Test matching users" result (the one preview surface, C10). */
export interface MatchResult {
  channelsInScope: number;
  matched: number;
  totalMembers: number;
  excludedMissingAttr: number; // channels skipped because the attribute isn't set
  sample: { key: string; name: string }[];
}

export const SEED_MATCH_RESULT: MatchResult = {
  channelsInScope: 197,
  matched: 128,
  totalMembers: 340,
  excludedMissingAttr: 3,
  sample: [
    { key: 'aiko', name: 'Aiko Tan' },
    { key: 'marco', name: 'Marco Rinaldi' },
    { key: 'emma', name: 'Emma Novak' },
    { key: 'david', name: 'David Liang' },
  ],
};

export function matchResultSummary(result: MatchResult): string {
  return `Applies to ${result.channelsInScope} channels · ${result.matched} of ${result.totalMembers} members match requirements`;
}

// ─── Policies list + sync jobs (System Console list page) ─────────────────────

export interface MembershipPolicyListItem {
  id: string;
  name: string;
  appliesTo: string;
}

/** Seed rows — aligned to walkthrough customer stories */
export const MEMBERSHIP_POLICY_LIST: MembershipPolicyListItem[] = [
  {
    id: 'ds-program',
    name: 'DS Program',
    appliesTo: 'All channels',
  },
  {
    id: 'dragon-spacecraft',
    name: 'Dragon Spacecraft',
    appliesTo: '42 channels',
  },
  {
    id: 'northern-command',
    name: 'Northern Command',
    appliesTo: '18 channels',
  },
  {
    id: 'noforn-handling',
    name: 'NOFORN handling',
    appliesTo: '8 channels',
  },
];

export type SyncJobStatus = 'Pending' | 'Success' | 'Failure';

export interface MembershipSyncJob {
  id: string;
  status: SyncJobStatus;
  finishedAt: string;
  runTime: string;
}

export const MEMBERSHIP_SYNC_JOBS: MembershipSyncJob[] = [
  { id: 'sync-pending', status: 'Pending', finishedAt: '—', runTime: '—' },
  {
    id: 'sync-1',
    status: 'Success',
    finishedAt: '02:15 PM May 05, 2025',
    runTime: '10 seconds',
  },
  {
    id: 'sync-2',
    status: 'Success',
    finishedAt: '10:18 AM May 05, 2025',
    runTime: '34 seconds',
  },
  {
    id: 'sync-3',
    status: 'Failure',
    finishedAt: '02:45 PM April 15, 2025',
    runTime: '6 seconds',
  },
  {
    id: 'sync-4',
    status: 'Success',
    finishedAt: '12:11 PM April 14, 2025',
    runTime: '31 seconds',
  },
  {
    id: 'sync-5',
    status: 'Success',
    finishedAt: '04:16 AM April 14, 2025',
    runTime: '28 seconds',
  },
];

export const policyById = (id: string) =>
  MEMBERSHIP_POLICY_LIST.find((policy) => policy.id === id);

// ─── Per-policy editor presets (walkthrough + list deep-links) ───────────────

export interface PolicyEditorPreset {
  requirements: Requirement[];
  scope: ScopeMode;
  channelConditions: ChannelCondition[];
  manualChannels: ManualChannel[];
}

export const POLICY_EDITOR_PRESETS: Record<string, PolicyEditorPreset> = {
  'ds-program': {
    requirements: DS_PROGRAM_REQUIREMENTS,
    scope: 'all-where-set',
    channelConditions: [],
    manualChannels: MANUAL_CHANNELS,
  },
  'dragon-spacecraft': {
    requirements: DRAGON_SPACECRAFT_REQUIREMENTS,
    scope: 'attribute-rules',
    channelConditions: SEED_CHANNEL_CONDITIONS,
    manualChannels: MANUAL_CHANNELS,
  },
  'northern-command': {
    requirements: NORTHERN_COMMAND_REQUIREMENTS,
    scope: 'attribute-rules',
    channelConditions: NORTHERN_COMMAND_CONDITIONS,
    manualChannels: MANUAL_CHANNELS,
  },
  'noforn-handling': {
    requirements: NOFORN_HANDLING_REQUIREMENTS,
    scope: 'attribute-rules',
    channelConditions: NOFORN_HANDLING_CONDITIONS,
    manualChannels: MANUAL_CHANNELS,
  },
  'literal-demo': {
    requirements: SEED_LITERAL_REQUIREMENTS,
    scope: 'manual',
    channelConditions: [],
    manualChannels: MANUAL_CHANNELS,
  },
};

export function policyEditorPreset(policyId: string | null): PolicyEditorPreset {
  if (policyId != null && POLICY_EDITOR_PRESETS[policyId] != null) {
    return POLICY_EDITOR_PRESETS[policyId];
  }
  return POLICY_EDITOR_PRESETS['ds-program'];
}

// ─── Terminology (locked) ─────────────────────────────────────────────────────

export const TERMS = {
  editorTitle: 'Edit membership policy',
  newTitle: 'New membership policy',
  nameLabel: 'Membership policy name',
  nameHelp: 'Give your policy a name that will be used to identify it in the policies list.',
  whoTitle: 'Membership requirements',
  whoSubtitle: 'Set the attribute conditions a member must meet',
  requirementsLabel: 'Attribute requirements',
  whereTitle: 'Where this policy applies',
  whereSubtitle: 'Choose the channels and teams this policy applies to',
  teamsTabDisabledTitle: 'Team assignment isn’t available for this policy',
  teamsTabDisabledDescription:
    'Requirements that reference channel attributes are evaluated per channel. Team assignment gates team join — use literal requirements there, or scope this policy on the Channels tab.',
  testUsers: 'Test matching users',
  allRequired: 'All attributes required',
  anyMatch: 'Any attribute matches',
} as const;

// ─── Lookups ──────────────────────────────────────────────────────────────────

export const userAttr = (id: string) => USER_ATTRS.find((a) => a.id === id);
export const channelVar = (id: string) => CHANNEL_VARIABLES.find((v) => v.id === id);
export const compatibleVariables = (kind: AttrKind) =>
  CHANNEL_VARIABLES.filter((v) => v.kind === kind);
