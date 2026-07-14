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

// ─── Simulate model — "Simulate against a channel" (WORKSTREAM 3) ─────────────
//
// GMP simulate answers a MEMBERSHIP set-diff — Added · Kept · Removed — for a
// specific channel context, NOT an access verdict. Membership add/remove is the
// primitive. Two security guards are load-bearing:
//   1. The channel picker is filtered to channels the admin can fully see given
//      the admin's own attribute values (`adminCanFullySee`).
//   2. For a channel whose classification/program is ABOVE the admin's clearance
//      (`overClearance`), the result renders AGGREGATE BANDS only — bucketed
//      counts, never named users or the failing condition (Ideation Option 6).
//
// Bands + gate boundaries follow the ideation defaults Q1=A (bands) / Q5=A.

/** Classification level — ordered so we can compare admin clearance vs channel. */
export type Classification =
  | 'Unclassified'
  | 'Confidential'
  | 'Secret'
  | 'Top Secret';

export const CLASSIFICATION_ORDER: Classification[] = [
  'Unclassified',
  'Confidential',
  'Secret',
  'Top Secret',
];

export function classificationRank(level: Classification): number {
  return CLASSIFICATION_ORDER.indexOf(level);
}

/**
 * The acting admin's own attribute values. Simulate is filtered and gated by
 * these — the admin can fully see channels at or below `clearance`, and above
 * that they get metadata-visible-but-bands-only, or nothing at all.
 */
export interface SimulateAdmin {
  name: string;
  username: string;
  clearance: Classification;
}

export const SIMULATE_ADMIN: SimulateAdmin = {
  name: 'Leonard Riley',
  username: 'leonard.riley',
  // A Secret-cleared sysadmin — can fully see up to Secret; Top Secret channels
  // are metadata-visible but render bands-only (the over-clearance state).
  clearance: 'Secret',
};

/** One member's outcome under the policy for a given channel. */
export type MemberOutcome = 'added' | 'kept' | 'removed';

export interface SimMember {
  key: string; // maps to an avatar filename stem
  name: string;
  role: string; // e.g. "Program engineer" — realistic, never "User 1"
}

/** A channel the admin can name and simulate against. */
export interface SimChannel {
  id: string;
  name: string;
  team: string;
  private: boolean;
  classification: Classification;
  program?: string;
  /** Whether the admin can enumerate members (clearance ≥ classification). */
  members: {
    added: SimMember[];
    kept: SimMember[];
    removed: SimMember[];
  };
}

/** Member pool — realistic identities reused across channels so diffs are real. */
export const SIM_MEMBERS: Record<string, SimMember> = {
  aiko: { key: 'aiko', name: 'Aiko Tan', role: 'Flight software lead' },
  marco: { key: 'marco', name: 'Marco Rinaldi', role: 'Propulsion engineer' },
  emma: { key: 'emma', name: 'Emma Novak', role: 'Mission operations' },
  david: { key: 'david', name: 'David Liang', role: 'Avionics engineer' },
  arjun: { key: 'arjun', name: 'Arjun Patel', role: 'Ground systems' },
  danielle: { key: 'danielle', name: 'Danielle Okoro', role: 'Systems integration' },
  darius: { key: 'darius', name: 'Darius Cole', role: 'Guidance & control' },
  isabella: { key: 'isabella', name: 'Isabella Cruz', role: 'Payload engineer' },
  leila: { key: 'leila', name: 'Leila Haddad', role: 'Range safety officer' },
  lukas: { key: 'lukas', name: 'Lukas Meyer', role: 'Coalition liaison' },
  sofia: { key: 'sofia', name: 'Sofia Bauer', role: 'Contractor — cleared' },
  ethan: { key: 'ethan', name: 'Ethan Brooks', role: 'Test conductor' },
};

const M = SIM_MEMBERS;

/**
 * Seed channels for the DS Program / Dragon Spacecraft policy. Ordered so the
 * picker surfaces highest-blast-radius first (Q3=B auto-suggest heuristic).
 * The Top Secret channel (`sim-ts-enclave`) exercises the over-clearance state:
 * the Secret-cleared admin sees it in the picker (metadata-visible) but gets
 * bands-only results with no names.
 */
export const SIM_CHANNELS: SimChannel[] = [
  {
    id: 'sim-ds-eng',
    name: 'Dragon Spacecraft — Engineering',
    team: 'Dragon Spacecraft',
    private: true,
    classification: 'Secret',
    program: 'Dragon Spacecraft',
    members: {
      added: [M.arjun, M.danielle],
      kept: [M.aiko, M.marco, M.emma, M.david, M.darius, M.isabella],
      removed: [M.lukas, M.sofia, M.ethan],
    },
  },
  {
    id: 'sim-ds-ops',
    name: 'Dragon Spacecraft — Mission Ops',
    team: 'Dragon Spacecraft',
    private: true,
    classification: 'Secret',
    program: 'Dragon Spacecraft',
    members: {
      added: [M.darius],
      kept: [M.emma, M.aiko, M.arjun, M.leila],
      removed: [M.sofia],
    },
  },
  {
    id: 'sim-ds-coalition',
    name: 'Dragon Spacecraft — Coalition',
    team: 'Dragon Spacecraft',
    private: false,
    classification: 'Confidential',
    program: 'Dragon Spacecraft',
    members: {
      added: [M.lukas, M.isabella, M.ethan],
      kept: [M.aiko, M.marco, M.emma, M.david, M.arjun, M.danielle],
      removed: [], // public channel — non-matching members are de-recommended, not removed
    },
  },
  {
    id: 'sim-ds-announce',
    name: 'Dragon Spacecraft — Announcements',
    team: 'Dragon Spacecraft',
    private: false,
    classification: 'Unclassified',
    program: 'Dragon Spacecraft',
    members: {
      added: [M.ethan],
      kept: [M.aiko, M.marco, M.emma, M.david, M.arjun, M.danielle, M.darius, M.isabella],
      removed: [],
    },
  },
  {
    id: 'sim-ts-enclave',
    name: 'Dragon Spacecraft — TS Enclave',
    team: 'Dragon Spacecraft',
    private: true,
    classification: 'Top Secret',
    program: 'Dragon Spacecraft',
    // Above the admin's Secret clearance. Named members are NEVER rendered for
    // this channel — the UI shows bands only. Kept here so the mock can derive
    // band buckets, but the scene must not print these names.
    members: {
      added: [M.darius, M.isabella],
      kept: [M.aiko, M.marco, M.emma],
      removed: [M.sofia, M.lukas],
    },
  },
];

/** True when the admin cannot enumerate members of this channel (bands-only). */
export function isOverClearance(
  channel: SimChannel,
  admin: SimulateAdmin = SIMULATE_ADMIN,
): boolean {
  return classificationRank(channel.classification) > classificationRank(admin.clearance);
}

/**
 * Channels the picker may show. All seed channels are metadata-visible to this
 * admin (they can "know it exists"); over-clearance ones still appear but render
 * bands only. A channel the admin cannot see at all would be filtered out here.
 */
export function visibleSimChannels(
  admin: SimulateAdmin = SIMULATE_ADMIN,
): SimChannel[] {
  // In this seed every channel is metadata-visible; none are fully hidden.
  // (A fully-hidden channel would simply be absent from SIM_CHANNELS for this admin.)
  void admin;
  return SIM_CHANNELS;
}

/** Count of in-scope channels excluded from the picker for visibility reasons. */
export const SIM_HIDDEN_CHANNEL_COUNT = 6;

/** Aggregate bands (Ideation Q5=A): coarse enough to resist binary-search inference. */
export type BandLabel = '1–5' | '6–20' | '21–100' | '>100' | 'None';

export function toBand(count: number): BandLabel {
  if (count <= 0) return 'None';
  if (count <= 5) return '1–5';
  if (count <= 20) return '6–20';
  if (count <= 100) return '21–100';
  return '>100';
}

export interface ChannelDiff {
  added: number;
  kept: number;
  removed: number;
  total: number;
  destructive: boolean; // removals from a private channel are destructive
}

export function channelDiff(channel: SimChannel): ChannelDiff {
  const added = channel.members.added.length;
  const kept = channel.members.kept.length;
  const removed = channel.members.removed.length;
  return {
    added,
    kept,
    removed,
    total: added + kept + removed,
    destructive: channel.private && removed > 0,
  };
}

/**
 * The failing condition string, gated: only shown for below-clearance channels
 * to a system admin. Above-clearance channels must hide it entirely (S-4).
 */
export function failingConditionFor(channel: SimChannel): string {
  return `User: Clearance ≥ Channel: Classification (${channel.classification}) AND User: Program is Channel: Program (${channel.program ?? '—'})`;
}

// ─── Batch impact model — "Simulate policy impact" (Ideation Option 5) ─────────

export interface BatchChannelRow {
  channel: SimChannel;
  diff: ChannelDiff;
}

export interface BatchImpact {
  totalInScope: number;
  skippedMissingAttr: number;
  overClearanceChannels: number; // contribute to bucketed subtotals only
  membersTouched: number;
  totalAdded: number;
  totalKept: number;
  totalRemoved: number; // destructive (private) removals
  /** Bucketed subtotal contributed by over-clearance channels (S-3). */
  overClearanceRemovalBand: BandLabel;
  /** Ranked most-affected channels the admin can fully see (drill-in targets). */
  topAffected: BatchChannelRow[];
}

/**
 * Batch summary for the DS Program policy. Precise totals cover only channels
 * the admin can fully see; the 3 over-clearance channels contribute to a
 * bucketed removal band, never to the precise `totalRemoved` (S-3 mitigation).
 */
export const SIM_BATCH_IMPACT: BatchImpact = {
  totalInScope: 197,
  skippedMissingAttr: 3,
  overClearanceChannels: 3,
  membersTouched: 1847,
  totalAdded: 89,
  totalKept: 1720,
  totalRemoved: 38,
  overClearanceRemovalBand: '6–20',
  topAffected: SIM_CHANNELS.filter((c) => !isOverClearance(c) && channelDiff(c).removed > 0)
    .map((c) => ({ channel: c, diff: channelDiff(c) }))
    .sort((a, b) => b.diff.removed - a.diff.removed),
};

/** Copy for the picker note explaining why some channels aren't listed. */
export const SIM_PICKER_FILTER_NOTE =
  'Only channels you can fully see are listed. Channels outside your visibility are excluded from simulation.';

/** Copy for the over-clearance result banner (no names, no failing condition). */
export const SIM_OVER_CLEARANCE_NOTE =
  'This channel’s classification is above your clearance. You can see the size of the change as a range, but not the members or the matching rule.';

/** Batch-impact notice when some in-scope channels are inaccessible to the viewer. */
export const SIM_BATCH_OVER_CLEARANCE_TITLE =
  'Data from some channels may not be shown here';

export const SIM_BATCH_OVER_CLEARANCE_DESCRIPTION =
  'Those channels are omitted from the totals above. Based on your user attribute values, you may not have access to every channel in scope of this policy.';

// ─── Shared helpers for the ALTERNATIVE simulate scenes (additive) ────────────
//
// Option 1 (Chips-adapted) and Option 2 (Inline per-channel strip) reuse the
// SAME set-diff data, the SAME over-clearance guard, and the SAME band buckets
// as Simulate/Simulate.tsx so all three prototypes show identical numbers.
// These helpers are additive presentation utilities only — no data is changed.

/**
 * Chip tone for a channel context (Option 1). Unlike Simulate-Access, this is
 * NOT a pass/fail verdict — the tone encodes destructive weight so the load-
 * bearing "would be removed" signal survives at the chip's rest state:
 *   - danger  → destructive private removals present
 *   - warning → over-clearance (bands only, no names)
 *   - neutral → no destructive removals (public de-recommend or clean)
 */
export type SimChipTone = 'danger' | 'warning' | 'neutral';

export function simChannelChipTone(channel: SimChannel): SimChipTone {
  if (isOverClearance(channel)) return 'warning';
  return channelDiff(channel).destructive ? 'danger' : 'neutral';
}

/**
 * One-line, count-first summary for a channel's set-diff. For over-clearance
 * channels the counts are rendered as bands (no precise integers), matching the
 * Option 6 result-shape used in the committed scene.
 */
export function simChannelSummary(channel: SimChannel): string {
  const diff = channelDiff(channel);
  if (isOverClearance(channel)) {
    return `${toBand(diff.added)} added · ${toBand(diff.kept)} kept · ${toBand(diff.removed)} removed`;
  }
  return `${diff.added} added · ${diff.kept} kept · ${diff.removed} removed`;
}

/** Max channels an admin can pin side-by-side in the Option 2 inline strip. */
export const SIM_MAX_PINNED = 3;

/**
 * Default pinned channel for the Option 2 strip: the highest-blast-radius
 * fully-visible channel (Q3=B auto-suggest), mirroring the committed scene's
 * populated-state seed.
 */
export function simDefaultPinnedChannel(
  admin: SimulateAdmin = SIMULATE_ADMIN,
): SimChannel | null {
  return (
    visibleSimChannels(admin)
      .filter((c) => !isOverClearance(c, admin))
      .sort((a, b) => channelDiff(b).removed - channelDiff(a).removed)[0] ?? null
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONCEPT SCENES — additive helpers for the three conceptually-distinct Simulate
// prototypes (Ideation 05-ideation-concepts.md §6). Each reuses the SAME
// SIM_CHANNELS / SIM_MEMBERS / channelDiff / isOverClearance / toBand primitives
// as Simulate.tsx so all set-diff numbers are directly comparable. Nothing here
// mutates existing data — presentation + derivation utilities only.
// ════════════════════════════════════════════════════════════════════════════

// ─── Concept A — Person-First Pinpoint (subject = one USER) ───────────────────
//
// The subject flips from channel to person. For a picked user we resolve ONE
// outcome (Kept / Would be added / Would be removed) per channel — derived from
// which set that user's key falls into in the existing SIM_CHANNELS data. Over-
// clearance channels are REFUSED for a person query (an N=1 oracle can't be
// safely banded), never downgraded.

export type PersonChannelOutcome = MemberOutcome | 'not-a-member';

/** Which set a given user falls into for a channel, from the existing set-diff. */
export function personOutcomeForChannel(
  member: SimMember,
  channel: SimChannel,
): PersonChannelOutcome {
  if (channel.members.added.some((m) => m.key === member.key)) return 'added';
  if (channel.members.kept.some((m) => m.key === member.key)) return 'kept';
  if (channel.members.removed.some((m) => m.key === member.key)) return 'removed';
  return 'not-a-member';
}

export interface PersonChannelRow {
  channel: SimChannel;
  outcome: PersonChannelOutcome;
  /** True when the channel is above the admin's clearance → refuse, don't show. */
  refused: boolean;
  destructive: boolean; // removed from a private channel
}

/** Full per-channel verdict trace for one user across the policy's in-scope channels. */
export function personVerdict(
  member: SimMember,
  admin: SimulateAdmin = SIMULATE_ADMIN,
): PersonChannelRow[] {
  return visibleSimChannels(admin).map((channel) => {
    const refused = isOverClearance(channel, admin);
    const outcome = personOutcomeForChannel(member, channel);
    return {
      channel,
      outcome: refused ? 'not-a-member' : outcome,
      refused,
      destructive: !refused && channel.private && outcome === 'removed',
    };
  });
}

/** The requirement row that decides a below-clearance channel for this user. */
export function personDecidingReason(
  member: SimMember,
  channel: SimChannel,
): string {
  const outcome = personOutcomeForChannel(member, channel);
  const base = `User: Clearance ≥ Channel: Classification (${channel.classification})`;
  switch (outcome) {
    case 'kept':
      return `${base} — met. Kept.`;
    case 'added':
      return `${base} — met, and User: Program is Channel: Program (${channel.program ?? '—'}) — now matches. Would be added.`;
    case 'removed':
      return `${base} — not met for this member. Would be removed.`;
    default:
      return `${base} — this member is not in scope for this channel.`;
  }
}

/** Copy for the person-first over-clearance refusal (NOT bands — N=1 oracle). */
export const PERSON_OVER_CLEARANCE_REFUSAL =
  'Simulate isn’t available for this channel at your clearance level. A single-person result would reveal membership of a channel classified above your clearance, so no result — including a range — is shown.';

/** Realistic user pool for Concept A's typeahead — reuses the shared member pool. */
export interface SimPerson extends SimMember {
  /** The member's own clearance — drives the seeded Kept/Removed/Added story. */
  clearance: Classification;
}

export const SIM_PEOPLE: SimPerson[] = [
  { ...SIM_MEMBERS.aiko, clearance: 'Top Secret' }, // Kept across Secret channels
  { ...SIM_MEMBERS.marco, clearance: 'Secret' },
  { ...SIM_MEMBERS.emma, clearance: 'Secret' },
  { ...SIM_MEMBERS.arjun, clearance: 'Secret' }, // Would be added (newly matches)
  { ...SIM_MEMBERS.danielle, clearance: 'Secret' },
  { ...SIM_MEMBERS.sofia, clearance: 'Confidential' }, // Would be removed (under-cleared)
  { ...SIM_MEMBERS.lukas, clearance: 'Confidential' },
  { ...SIM_MEMBERS.ethan, clearance: 'Confidential' },
  { ...SIM_MEMBERS.darius, clearance: 'Secret' },
  { ...SIM_MEMBERS.isabella, clearance: 'Secret' },
];

export const personByKey = (key: string) =>
  SIM_PEOPLE.find((p) => p.key === key) ?? null;

/** Roll a person's per-channel outcomes into one headline verdict + counts. */
export interface PersonSummary {
  kept: number;
  added: number;
  removed: number;
  refusedCount: number;
  headline: 'kept' | 'added' | 'removed' | 'mixed' | 'none';
}

export function personSummary(rows: PersonChannelRow[]): PersonSummary {
  const visible = rows.filter((r) => !r.refused);
  const kept = visible.filter((r) => r.outcome === 'kept').length;
  const added = visible.filter((r) => r.outcome === 'added').length;
  const removed = visible.filter((r) => r.outcome === 'removed').length;
  const refusedCount = rows.filter((r) => r.refused).length;
  let headline: PersonSummary['headline'] = 'none';
  if (removed > 0 && added === 0 && kept === 0) headline = 'removed';
  else if (added > 0 && removed === 0 && kept === 0) headline = 'added';
  else if (kept > 0 && removed === 0 && added === 0) headline = 'kept';
  else if (kept + added + removed > 0) headline = 'mixed';
  return { kept, added, removed, refusedCount, headline };
}

// ─── Concept C — Delta / Changeset (subject = the EDIT itself) ────────────────
//
// The subject is the delta between the proposed policy and current live
// membership. Output = an approvable, scrollable per-channel DIFF document
// (grouped +added / −removed lines), NOT a totals summary. Over-clearance
// channels appear as a single banded row inline in the diff.

export interface ChangesetLine {
  member: SimMember;
  op: 'add' | 'remove';
  destructive: boolean; // remove from a private channel
}

export interface ChangesetChannel {
  channel: SimChannel;
  added: SimMember[];
  removed: SimMember[];
  net: number; // added - removed
  destructive: boolean;
  overClearance: boolean;
  /** Banded counts, only populated for over-clearance channels. */
  band?: { added: BandLabel; removed: BandLabel };
  /** True when nothing changes for this channel (collapsed by default). */
  noChange: boolean;
}

/** Build the per-channel changeset from the same set-diff data used everywhere. */
export function buildChangeset(
  admin: SimulateAdmin = SIMULATE_ADMIN,
): ChangesetChannel[] {
  return visibleSimChannels(admin).map((channel) => {
    const over = isOverClearance(channel, admin);
    const added = over ? [] : channel.members.added;
    const removed = over ? [] : channel.members.removed;
    const diff = channelDiff(channel);
    const noChange = diff.added === 0 && diff.removed === 0;
    return {
      channel,
      added,
      removed,
      net: diff.added - diff.removed,
      destructive: !over && channel.private && diff.removed > 0,
      overClearance: over,
      band: over
        ? { added: toBand(diff.added), removed: toBand(diff.removed) }
        : undefined,
      noChange,
    };
  });
}

/** Sticky summary-bar totals for the changeset (precise + banded overflow). */
export interface ChangesetTotals {
  channelsAdding: number;
  channelsRemoving: number;
  totalAdded: number;
  totalRemoved: number;
  skipped: number;
  overClearanceChannels: number;
  overClearanceRemovalBand: BandLabel;
}

export function changesetTotals(rows: ChangesetChannel[]): ChangesetTotals {
  const visible = rows.filter((r) => !r.overClearance);
  return {
    channelsAdding: visible.filter((r) => r.added.length > 0).length,
    channelsRemoving: visible.filter((r) => r.removed.length > 0).length,
    totalAdded: visible.reduce((n, r) => n + r.added.length, 0),
    totalRemoved: visible.reduce((n, r) => n + r.removed.length, 0),
    skipped: SIM_BATCH_IMPACT.skippedMissingAttr,
    overClearanceChannels: rows.filter((r) => r.overClearance).length,
    overClearanceRemovalBand: SIM_BATCH_IMPACT.overClearanceRemovalBand,
  };
}

export const CHANGESET_OVER_CLEARANCE_NOTE = SIM_BATCH_OVER_CLEARANCE_DESCRIPTION;

export const CHANGESET_ISSO_NOTE =
  'Routing sends this changeset to a second approver (ISSO) as a persistable approval record. Persistence model is pending PM/Security review.';

// ─── Concept B — Live Inline Cohort Preview (subject = the EXPRESSION) ────────
//
// The subject is the attribute expression itself. Output = a live, bucketed
// count shown inline in the requirement-authoring row as the admin edits — no
// modal, no picker, no explicit "Run". User-attribute side only; coarse buckets;
// entitlement-scoped. Every count keyed off the user pool, never exact.

export type CohortBadgeTone = 'neutral' | 'broad' | 'narrow' | 'suppressed';

export interface CohortPreview {
  /** Coarse bucket label, e.g. "~ 20–50 users". Empty when idle/suppressed. */
  label: string;
  tone: CohortBadgeTone;
  /** Hover / helper copy. */
  hint: string;
}

/**
 * Bucketed cohort size for a (userAttr, operator, value) expression. Coarse by
 * design — resists binary-search inference across edits. Keyed off the seeded
 * user pool clearances so the numbers track the rest of the fixtures.
 */
export function cohortPreview(
  userAttrId: string | null,
  operatorId: string | null,
  value: string | null,
  entitled = true,
): CohortPreview {
  if (userAttrId == null || operatorId == null || value == null || value === '') {
    return { label: '', tone: 'neutral', hint: '' };
  }
  if (!entitled) {
    return {
      label: 'count unavailable for this attribute',
      tone: 'suppressed',
      hint: 'You aren’t entitled to preview the matching population for this attribute.',
    };
  }
  const hint =
    'Approximate workspace-wide count · user-attribute side only · does not include channel context.';

  // Clearance is the seeded ranked attribute with the richest distribution.
  if (userAttrId === 'clearance') {
    if (operatorId === 'at-least') {
      switch (value) {
        case 'Unclassified':
          return { label: '~ >100 users — very broad', tone: 'broad', hint };
        case 'Confidential':
          return { label: '~ 50–100 users', tone: 'neutral', hint };
        case 'Secret':
          return { label: '~ 20–50 users match', tone: 'neutral', hint };
        case 'Top Secret':
          return { label: '~ 6–20 users', tone: 'neutral', hint };
        default:
          return { label: '~ 20–50 users match', tone: 'neutral', hint };
      }
    }
    if (operatorId === 'equals' && value === 'Top Secret') {
      return { label: '~ 6–20 users', tone: 'neutral', hint };
    }
  }

  if (userAttrId === 'nationality') {
    // A rare single-nationality literal narrows sharply.
    if (value === 'AUS' || value === 'CAN') {
      return { label: '~ 0 users — this may match no one', tone: 'narrow', hint };
    }
    return { label: '~ 20–50 users match', tone: 'neutral', hint };
  }

  if (userAttrId === 'program') {
    return { label: '~ 6–20 users', tone: 'neutral', hint };
  }

  // Sensible default for other attributes in the seed.
  return { label: '~ 20–50 users match', tone: 'neutral', hint };
}

export const COHORT_AUDIT_NOTE =
  'Cohort previews are approximate, bucketed, and recorded as attribute-index queries.';

export const COHORT_VARIABLE_ROW_NOTE =
  'This row compares to a channel attribute, so the match set varies per channel. Only the user-side population is previewed here.';

// ─── Test-matching MODAL — concept switcher (additive; presentation only) ─────
//
// The "Test matching users" button in the editor opens a single modal that hosts
// FOUR run-and-view concepts as switchable panels. This is additive metadata for
// that switcher; every panel reuses the SAME set-diff / personVerdict / band
// primitives above, so all four show identical numbers to the standalone scenes.
// (Concept B — live cohort preview — is intentionally excluded from the modal.)

export type TestMatchingPanelId = 'channel' | 'impact' | 'person' | 'changeset';

export const TEST_MATCHING_PANELS: {
  id: TestMatchingPanelId;
  label: string;
  blurb: string;
}[] = [
  {
    id: 'channel',
    label: 'Against a channel',
    blurb: 'Pick a channel; see who would be added, kept, or removed.',
  },
  {
    id: 'impact',
    label: 'Policy impact',
    blurb: 'Aggregate blast-radius across the whole scope.',
  },
  {
    id: 'person',
    label: 'Person',
    blurb: 'Pick one member; get a per-channel verdict trace.',
  },
  {
    id: 'changeset',
    label: 'Changeset',
    blurb: 'The approvable per-channel +/− diff document.',
  },
];

export const VALID_TEST_MATCHING_PANELS: TestMatchingPanelId[] = [
  'channel',
  'impact',
  'person',
  'changeset',
];

export function isTestMatchingPanel(
  value: string | null,
): value is TestMatchingPanelId {
  return value != null && (VALID_TEST_MATCHING_PANELS as string[]).includes(value);
}

// ─── Simplified-editor additive model (Simplified/ scene ONLY) ────────────────
// Additive-only exports consumed by the Simplified GMP editor variation. These
// do not modify or remove any existing export above and are ignored by every
// other scene. Kept here so the Simplified scene reads the same seed values.

/**
 * Schema-paired value filter (Simplification 2.1). On a requirement row, a user
 * attribute may reference AT MOST ONE channel variable — the one that shares its
 * schema/source (not every same-`kind` channel attribute, which is what
 * `compatibleVariables` returns). Keyed by user-attribute id → channel-variable
 * id. User attributes NOT present here offer literals only (no channel-attribute
 * group in the value picker).
 */
export const SCHEMA_PAIR: Record<string, string> = {
  clearance: 'ch-classification', // User: Clearance  → Channel: Classification
  program: 'ch-program', // User: Program    → Channel: Program
  department: 'ch-department', // User: department → Channel: department
  // nationality, coi → intentionally absent → literals only.
};

/** The single schema-paired channel variable for a user attribute, if any. */
export function pairedChannelVar(userAttrId: string): ChannelVarOption | undefined {
  const varId = SCHEMA_PAIR[userAttrId];
  return varId ? channelVar(varId) : undefined;
}

/**
 * Which channel attributes are marked "required for channels" (Simplification
 * 2.3). Seeded so the hard-error guardrail is demonstrable:
 *   - Channel: Classification → required     (policies referencing it are safe)
 *   - Channel: Program        → NOT required  (triggers the blocked-Save error)
 * Any channel variable absent from this map is treated as NOT required.
 */
export const CHANNEL_VAR_REQUIRED_FOR_CHANNELS: Record<string, boolean> = {
  'ch-classification': true,
  'ch-program': false,
  'ch-department': false,
  'ch-releasability': false,
};

/** True when a channel attribute is marked required-for-channels. */
export function channelVarRequiredForChannels(channelVarId: string): boolean {
  return CHANNEL_VAR_REQUIRED_FOR_CHANNELS[channelVarId] === true;
}

/** The distinct channel variables referenced (as `variable`) by requirements. */
export function referencedChannelVarIds(reqs: Requirement[]): string[] {
  const ids = reqs
    .filter((r) => r.value.mode === 'variable')
    .map((r) => (r.value.mode === 'variable' ? r.value.variableId : ''))
    .filter(Boolean);
  return Array.from(new Set(ids));
}

/**
 * Hard-error guardrail evaluation (Simplification 2.3). Under "All channels",
 * any referenced channel variable that is NOT required-for-channels disables
 * "All channels" scope, because channels missing that value would remove every
 * member (fail-secure). Returns the offending channel variables (empty ⇒ All
 * channels is selectable).
 */
export function allChannelsBlockingVars(
  reqs: Requirement[],
): ChannelVarOption[] {
  return referencedChannelVarIds(reqs)
    .filter((id) => !channelVarRequiredForChannels(id))
    .map((id) => channelVar(id))
    .filter((v): v is ChannelVarOption => v != null);
}

/** Simplified scope model — exactly TWO options (Simplification 2.2). */
export type SimplifiedScopeMode = 'all' | 'manual';

export const SIMPLIFIED_SCOPE_OPTIONS: {
  id: SimplifiedScopeMode;
  title: string;
  body: string;
}[] = [
  {
    id: 'all',
    title: 'All channels',
    body: 'Applies to every channel, whether or not a referenced attribute is set. Fail-secure: a channel missing a referenced attribute value removes everyone from that channel.',
  },
  {
    id: 'manual',
    title: 'Select channels manually',
    body: 'Pick specific channels yourself.',
  },
];

// ════════════════════════════════════════════════════════════════════════════
// SIMPLIFIED "Test matching users" MODAL — additive fixtures (Part B).
//
// Single-mode "Against a channel" modal for the Simplified GMP editor. This is
// SEPARATE from the 4-concept Simulate/TestMatchingModal — it reuses the same
// set-diff PRIMITIVES (SIM_MEMBERS pool, isOverClearance guard, the Secret-cleared
// SIMULATE_ADMIN, and the +added/−removed shape) so numbers stay believable and
// consistent, but owns its own channel roster + fuller member lists sized to
// paginate at 10/page. Nothing above is mutated.
// ════════════════════════════════════════════════════════════════════════════

/** One member row in the Simplified modal's Allowed / Removed sub-view lists. */
export interface SimplifiedMemberRow {
  key: string; // avatar filename stem where a photo exists; else fallback initials
  name: string;
  username: string;
}

/** A channel the Simplified modal can drill into: name + per-set member rosters. */
export interface SimplifiedTestChannel {
  id: string;
  name: string;
  team: string;
  private: boolean;
  classification: Classification;
  /** Members who would KEEP or GAIN access under the policy. */
  allowed: SimplifiedMemberRow[];
  /** Members who would be REMOVED under the policy. */
  removed: SimplifiedMemberRow[];
}

const SM = SIM_MEMBERS;
const row = (m: SimMember, username: string): SimplifiedMemberRow => ({
  key: m.key,
  name: m.name,
  username,
});

/**
 * Extra named identities used only to fill multiple pages in the demo channel.
 * These have no avatar photo (fallback initials render) — realistic names, never
 * "User 1". Roles are irrelevant to this modal so they carry name + username only.
 */
const EXTRA_NAMES: [string, string][] = [
  ['Priya Nair', 'priya.nair'],
  ['Tomás Silva', 'tomas.silva'],
  ['Hannah Weber', 'hannah.weber'],
  ['Omar Farouk', 'omar.farouk'],
  ['Grace Kimura', 'grace.kimura'],
  ['Viktor Petrov', 'viktor.petrov'],
  ['Nadia Rahman', 'nadia.rahman'],
  ['Elias Berg', 'elias.berg'],
  ['Camille Dubois', 'camille.dubois'],
  ['Rohan Mehta', 'rohan.mehta'],
  ['Yuki Sato', 'yuki.sato'],
  ['Fatima Al-Sayed', 'fatima.alsayed'],
  ['Diego Morales', 'diego.morales'],
  ['Ingrid Larsen', 'ingrid.larsen'],
  ['Samuel Okafor', 'samuel.okafor'],
  ['Mei Lin', 'mei.lin'],
  ['Jonas Vetter', 'jonas.vetter'],
  ['Aditi Kapoor', 'aditi.kapoor'],
  ['Lucas Ferreira', 'lucas.ferreira'],
  ['Zara Haddad', 'zara.haddad'],
  ['Noah Fischer', 'noah.fischer'],
  ['Sana Qureshi', 'sana.qureshi'],
  ['Matteo Conti', 'matteo.conti'],
  ['Freya Nilsson', 'freya.nilsson'],
  ['Kwame Mensah', 'kwame.mensah'],
  ['Lucia Romano', 'lucia.romano'],
  ['Bjorn Haugen', 'bjorn.haugen'],
  ['Amara Diallo', 'amara.diallo'],
  ['Theo Marchetti', 'theo.marchetti'],
  ['Ravi Chandra', 'ravi.chandra'],
  ['Sinead Byrne', 'sinead.byrne'],
  ['Hassan Karimi', 'hassan.karimi'],
  ['Marta Kowalska', 'marta.kowalska'],
  ['Kofi Asante', 'kofi.asante'],
];

const extraRows = (from: number, count: number): SimplifiedMemberRow[] =>
  EXTRA_NAMES.slice(from, from + count).map(([name, username], i) => ({
    key: `extra-${from + i}`,
    name,
    username,
  }));

/**
 * Photo-backed core members (from the shared pool) with plausible usernames,
 * so the top of each list shows real faces per the playground avatar convention.
 */
const CORE_ROWS: SimplifiedMemberRow[] = [
  row(SM.aiko, 'aiko.tan'),
  row(SM.marco, 'marco.rinaldi'),
  row(SM.emma, 'emma.novak'),
  row(SM.david, 'david.liang'),
  row(SM.arjun, 'arjun.patel'),
  row(SM.danielle, 'danielle.okoro'),
  row(SM.darius, 'darius.cole'),
  row(SM.isabella, 'isabella.cruz'),
  row(SM.leila, 'leila.haddad'),
  row(SM.lukas, 'lukas.meyer'),
  row(SM.sofia, 'sofia.bauer'),
  row(SM.ethan, 'ethan.brooks'),
];

/** The acting admin, as a member row (gets the "(you)" suffix in the UI). */
export const SIMPLIFIED_ADMIN_ROW: SimplifiedMemberRow = {
  key: 'leonard',
  name: 'Leonard Riley',
  username: 'leonard.riley',
};

/**
 * Channel roster for the Simplified modal. Only channels at/below the admin's
 * Secret clearance are FULLY enumerable; the Top Secret enclave is kept for the
 * over-clearance guard but is NOT surfaced in View 1's affected list.
 *
 * The demo channel "Innovation Initiatives" (`smt-innovation`) is sized to
 * paginate: ~16 allowed, ~30 removed. It is the target of the ?test=channel
 * deep-link and of any autocomplete/list row selection in the default demo.
 */
export const SIMPLIFIED_TEST_CHANNELS: SimplifiedTestChannel[] = [
  {
    id: 'smt-innovation',
    name: 'Innovation Initiatives',
    team: 'Dragon Spacecraft',
    private: true,
    classification: 'Secret',
    allowed: [
      SIMPLIFIED_ADMIN_ROW,
      ...CORE_ROWS.slice(0, 8),
      ...extraRows(0, 7),
    ], // 16
    removed: [...CORE_ROWS.slice(8, 12), ...extraRows(7, 26)], // 30
  },
  {
    id: 'smt-ds-eng',
    name: 'Dragon Spacecraft — Engineering',
    team: 'Dragon Spacecraft',
    private: true,
    classification: 'Secret',
    allowed: [...CORE_ROWS.slice(0, 8), ...extraRows(0, 4)], // 12
    removed: [...CORE_ROWS.slice(9, 12), ...extraRows(12, 3)], // 6
  },
  {
    id: 'smt-ds-ops',
    name: 'Dragon Spacecraft — Mission Ops',
    team: 'Dragon Spacecraft',
    private: true,
    classification: 'Secret',
    allowed: [...CORE_ROWS.slice(0, 5), ...extraRows(4, 3)], // 8
    removed: [row(SM.sofia, 'sofia.bauer'), row(SM.lukas, 'lukas.meyer')], // 2
  },
  {
    id: 'smt-ds-coalition',
    name: 'Dragon Spacecraft — Coalition',
    team: 'Dragon Spacecraft',
    private: false,
    classification: 'Confidential',
    allowed: [...CORE_ROWS.slice(0, 9), ...extraRows(0, 5)], // 14
    removed: [], // public — non-matching members are de-recommended, not removed
  },
  {
    id: 'smt-ds-announce',
    name: 'Dragon Spacecraft — Announcements',
    team: 'Dragon Spacecraft',
    private: false,
    classification: 'Unclassified',
    allowed: [...CORE_ROWS, ...extraRows(0, 9)], // 21
    removed: [],
  },
  {
    id: 'smt-northcom',
    name: 'Northern Command — Watch Floor',
    team: 'Northern Command',
    private: true,
    classification: 'Secret',
    allowed: [...CORE_ROWS.slice(0, 6), ...extraRows(2, 4)], // 10
    removed: [...extraRows(15, 4)], // 4
  },
  {
    id: 'smt-northcom-plans',
    name: 'Northern Command — Plans',
    team: 'Northern Command',
    private: true,
    classification: 'Confidential',
    allowed: [...CORE_ROWS.slice(0, 4), ...extraRows(6, 3)], // 7
    removed: [...extraRows(19, 3)], // 3
  },
  {
    id: 'smt-logistics',
    name: 'Sustainment & Logistics',
    team: 'Northern Command',
    private: false,
    classification: 'Unclassified',
    allowed: [...CORE_ROWS.slice(0, 7), ...extraRows(0, 6)], // 13
    removed: [],
  },
  {
    id: 'smt-noforn',
    name: 'NOFORN Handling — Working Group',
    team: 'Dragon Spacecraft',
    private: true,
    classification: 'Secret',
    allowed: [...CORE_ROWS.slice(1, 6), ...extraRows(10, 3)], // 8
    removed: [row(SM.lukas, 'lukas.meyer'), ...extraRows(21, 2)], // 3
  },
  {
    id: 'smt-integration',
    name: 'Systems Integration Lab',
    team: 'Dragon Spacecraft',
    private: true,
    classification: 'Secret',
    allowed: [...CORE_ROWS.slice(0, 5), ...extraRows(5, 4)], // 9
    removed: [...extraRows(22, 2)], // 2
  },
  {
    // Above the Secret admin's clearance — MUST NOT appear in View 1's list.
    // Present only so the over-clearance guard has a target if reached.
    id: 'smt-ts-enclave',
    name: 'Dragon Spacecraft — TS Enclave',
    team: 'Dragon Spacecraft',
    private: true,
    classification: 'Top Secret',
    allowed: [...CORE_ROWS.slice(0, 4)],
    removed: [...CORE_ROWS.slice(9, 12)],
  },
];

/** True when the admin cannot enumerate members (bands-only) — reuses the guard. */
export function simplifiedChannelOverClearance(
  channel: SimplifiedTestChannel,
  admin: SimulateAdmin = SIMULATE_ADMIN,
): boolean {
  return (
    classificationRank(channel.classification) >
    classificationRank(admin.clearance)
  );
}

/**
 * View 1's affected list: up to 10 channels the admin can FULLY see (over-
 * clearance channels are excluded — consistent with the leakage guardrail). This
 * is the rendered body list; it is NOT what the search box filters.
 */
export function simplifiedAffectedChannels(
  admin: SimulateAdmin = SIMULATE_ADMIN,
): SimplifiedTestChannel[] {
  return SIMPLIFIED_TEST_CHANNELS.filter(
    (c) => !simplifiedChannelOverClearance(c, admin),
  ).slice(0, 10);
}

/** Autocomplete source: same visibility rule, searched by name/team. */
export function simplifiedChannelSearch(
  query: string,
  admin: SimulateAdmin = SIMULATE_ADMIN,
): SimplifiedTestChannel[] {
  const q = query.trim().toLowerCase();
  const pool = SIMPLIFIED_TEST_CHANNELS.filter(
    (c) => !simplifiedChannelOverClearance(c, admin),
  );
  if (q === '') return pool.slice(0, 8);
  return pool
    .filter((c) => `${c.name} ${c.team}`.toLowerCase().includes(q))
    .slice(0, 8);
}

/** Look up a channel by id (used by the ?test=channel deep-link). */
export const simplifiedChannelById = (id: string) =>
  SIMPLIFIED_TEST_CHANNELS.find((c) => c.id === id) ?? null;

/** The default drill-in target for demos / the ?test=channel deep-link. */
export const SIMPLIFIED_DEFAULT_CHANNEL_ID = 'smt-innovation';

/** Short "+X / −Y" affected summary for a View 1 channel row. */
export function simplifiedAffectedSummary(channel: SimplifiedTestChannel): string {
  return `+${channel.allowed.length} allowed · −${channel.removed.length} removed`;
}

export const SIMPLIFIED_MEMBERS_PER_PAGE = 10;
