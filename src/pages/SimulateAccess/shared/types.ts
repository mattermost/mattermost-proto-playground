// Types for the Simulate access prototype.

export type AdminRole = 'system' | 'channel';

/** Where the simulator is opened from. */
export type EntryContext =
  | 'system-editor'    // System Console > Permission Policies > Edit policy
  | 'system-listing'   // System Console > Permission Policies (page header)
  | 'channel-editor'   // Channel Settings > Permissions > Edit policy
  | 'channel-listing'; // Channel Settings > Permissions (panel header)

/** Editor-only sub-mode: full graph or this-policy-only. */
export type EditorScope = 'full-graph' | 'this-policy-only';

/** Smart-default mode toggle. */
export type SimulationMode = 'simulator' | 'filter';

/** A specific permission action being evaluated. */
export type PermissionAction =
  | 'download_file_attachment'
  | 'upload_file_attachment'
  | 'view_channel'
  | 'add_member';

export const ACTION_LABELS: Record<PermissionAction, string> = {
  download_file_attachment: 'Download files',
  upload_file_attachment: 'Upload files',
  view_channel: 'View channel',
  add_member: 'Add members',
};

/** Verdict source attribution. */
export type VerdictAttribution =
  | 'allowed'
  | 'denied-this-policy'
  | 'denied-system-policy'   // channel context only
  | 'denied-another-policy'  // system context only
  | 'denied-both'            // either context: this + other
  | 'denied-not-a-member'    // channel context short-circuit
  | 'denied-no-recent-session'
  | 'mixed';                 // some cells allow, some deny — only at roll-up levels

export interface SessionAttributeValue {
  /** Token identifier, e.g. session.vpn_active */
  key: string;
  /** Human-readable label, e.g. "VPN active" */
  label: string;
  /** Resolved value at evaluation time. null = unknown / fail-secure source. */
  value: string | boolean | number | null;
  /** Type for rendering hints. */
  type: 'boolean' | 'string' | 'enum' | 'ip' | 'version';
}

/** Per-action cell verdict — the unit of truth in the cell model. */
export interface CellVerdict {
  action: PermissionAction;
  verdict: VerdictAttribution;
  /** Failing condition expression — present only when this cell denied by this policy. */
  failingCondition?: string;
}

export interface SessionDecision {
  sessionId: string;
  /** Friendly device label (e.g. "iPhone 14 · cellular"). */
  deviceLabel: string;
  /** Last active relative time string. */
  lastActive: string;
  /**
   * Aggregate verdict for this session, derived from cellVerdicts.
   * 'mixed' when actions disagree within a session.
   */
  verdict: VerdictAttribution;
  /** Per-action verdicts. Length matches the policy's action count. */
  cellVerdicts: CellVerdict[];
  /** Failing condition (legacy single-condition view). For multi-action, see cellVerdicts. */
  failingCondition?: string;
  /** Snapshot of session attribute values used in evaluation. */
  attributes: SessionAttributeValue[];
  /** Whether this session row was synthesized from no-recent-session fallback. */
  isPlaceholder?: boolean;
  /** True if any attribute value was overridden by the admin. Drives the amber dot indicator. */
  hasOverrides?: boolean;
}

export interface PerActionVerdict {
  action: PermissionAction;
  verdict: VerdictAttribution;
}

export interface UserSimulationRow {
  userId: string;
  name: string;
  handle: string;
  avatarSrc: string;
  /** Aggregate verdict — usually "denied" if any session is denied for any action; UI rolls per-session and per-action up. */
  aggregateVerdict: VerdictAttribution;
  /** True if this user is not a member of the channel (channel context only). Short-circuits evaluation. */
  isNonMember?: boolean;
  /** Per-session decisions. May be empty for non-members or placeholder for no-recent-session. */
  sessions: SessionDecision[];
  /** Per-action breakdown for the policy under test (collapsed at session level). */
  perActionVerdicts: PerActionVerdict[];
}

export interface PolicyContext {
  /** Display name shown in the modal subtitle. */
  policyName: string;
  /** Actions targeted by this policy. */
  actions: PermissionAction[];
  /** Whether the policy references session/env attributes (drives smart-default mode). */
  referencesSessionAttributes: boolean;
}
