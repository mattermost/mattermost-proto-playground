/**
 * DPC V2 A1 local state machine — revised Confirm-and-Commit + new surfaces.
 *
 * Forks the original useA1Store with V2 additions surfaced by the Phase 2-6
 * re-run. Wave 1 establishes the state shape and dispatch surface so the
 * Wave 2 implementations can wire each state file without further reducer
 * churn. Carry-forward behavior from V1 is preserved 1:1.
 *
 * V2 deltas (added in this store):
 *   • permalink unfurl: visible vs silent rendering toggle + audience persona
 *   • channel switcher: query string + result set (separate DPC section)
 *   • decline modal: open/close + two-step neutral-register reason flow
 *   • permission scheme entry: System Scheme + Team Override toggle states
 *   • in-channel admin system message visibility (per-channel)
 *   • LHS pending dot visibility (sidebar indicator)
 *   • channel header indicator (subtle lock-plus, visible to members)
 *   • indicator showcase scenario selection
 *
 * Every action that materially changes server state also appends an audit
 * event via makeAudit() so the AuditPanel can render the FR-13 set inline.
 */
import { useCallback, useMemo, useReducer } from 'react';
import {
  ABAC_POLICIES,
  CHANNELS,
  PERSONAS,
  SEED_AUDIT_EVENTS,
  SUPPORTING_USERS,
  makeAudit,
  type AbacPolicy,
  type AuditEvent,
  type ChannelFixture,
  type Persona,
} from '@/pages/dpc/shared';

// ── Domain types ──────────────────────────────────────────────────────────

export type AbacPolicyKey = 'empty' | 'typical' | 'slow';

/**
 * Six scenario templates surfaced by the V2 Confirm-and-Commit modal.
 * Wave 2 will render distinct headline/body/CTA copy per scenario. Wave 1
 * only carries the discriminator + selector so the state shape is locked.
 */
export type ConfirmScenario =
  | 'enable-typical'
  | 'enable-empty'
  | 'enable-slow'
  | 'enable-large-jump'
  | 'disable-with-pending'
  | 'policy-change-impact';

export type PermalinkUnfurlMode = 'visible' | 'silent';

export type PermalinkAudience =
  | 'eligible-member'
  | 'eligible-non-member'
  | 'ineligible';

export type DeclineModalStep = 'reason' | 'confirm';

export interface PendingRequest {
  id: string;
  channelId: string;
  requesterUsername: string;
  requesterDisplayName: string;
  requesterAvatarUrl: string;
  priorMembership: boolean;
  submittedAt: string;
}

export interface DmNotification {
  id: string;
  variant:
    | 'approved'
    | 'denied-no-reason'
    | 'denied-with-reason'
    | 'auto-withdraw-disabled'
    | 'auto-withdraw-channel-deleted';
  channelId: string;
  channelName: string;
  adminUsername: string;
  reasonText?: string;
  createdAt: string;
}

export interface SwitcherResult {
  id: string;
  channelId: string;
  displayName: string;
  isMember: boolean;
  isDiscoverable: boolean;
  memberCount: number;
}

export interface A1V2State {
  /** Current ABAC policy preset driving matched-user previews. */
  abacPolicy: AbacPolicyKey;
  /** Whether `ops-planning-q3` is currently Discoverable. Seed mirrors fixtures. */
  channelDiscoverable: boolean;
  /** True when admin clicked Save with the toggle flipped ON — modal open. */
  pendingToggle: boolean;
  /** Scenario template that the Confirm modal should render. */
  confirmScenario: ConfirmScenario;
  /** True during the slow-path simulation (NFR-5 boundary demo). */
  modalMatchedUsersLoading: boolean;
  /** Pending requests visible in the admin right-rail. */
  pendingRequests: PendingRequest[];
  /** The current persona's own pending request IDs (drives My Pending filter). */
  myPendingRequests: string[];
  /** Channels the current persona has joined. */
  joinedChannels: string[];
  /** Channels the current persona previously left — surfaces the L&R overlay. */
  rejoinableChannels: string[];
  /** FR-13 audit ledger (seed + dispatched events). */
  auditEvents: AuditEvent[];
  /** Last DM notification dispatched (for the preview pane). */
  dmNotifications: DmNotification[];
  /** True after SIMULATE_SESSION_EXPIRY — modal closes, toast shown. */
  modalSessionExpired: boolean;
  /** True briefly after a successful save — drives toast surface. */
  recentlySaved: boolean;

  // ── V2 additions ────────────────────────────────────────────────────────

  /** Permalink unfurl render mode (visible card vs silent suppression). */
  permalinkUnfurlMode: PermalinkUnfurlMode;
  /** Which audience persona is observing the permalink unfurl preview. */
  permalinkAudience: PermalinkAudience;

  /** Channel-switcher current query string. */
  switcherQuery: string;
  /** Result set rendered by the switcher (separate DPC section). */
  switcherResults: SwitcherResult[];
  /** True while the switcher debounce/request is in flight. */
  switcherLoading: boolean;

  /** Decline modal open state (admin-initiated). */
  declineModalOpen: boolean;
  /** Request ID targeted by the decline flow. */
  declineModalRequestId: string | null;
  /** Two-step neutral register progress (reason → confirm). */
  declineModalStep: DeclineModalStep;
  /** Draft reason text held while the modal is open. */
  declineModalReason: string;

  /** Permission scheme entry — System Scheme row toggle. */
  systemSchemeDpcEnabled: boolean;
  /** Permission scheme entry — Team Override row toggle. */
  teamOverrideDpcEnabled: boolean;
  /** Whether the Team Override row is unlocked (i.e. override is set). */
  teamOverrideActive: boolean;

  /** Per-channel visibility of the in-channel admin system message variant. */
  inChannelAdminSysMsgVisible: boolean;

  /** Sidebar pending-requests dot visibility for admin personas. */
  lhsPendingDotVisible: boolean;

  /** Channel header indicator (subtle lock-plus) visibility for members. */
  channelHeaderIndicatorVisible: boolean;

  /** Indicator showcase: which cross-surface scenario is highlighted. */
  indicatorShowcaseScenario:
    | 'header'
    | 'switcher'
    | 'browse'
    | 'permalink'
    | 'all';
}

// ── Actions ───────────────────────────────────────────────────────────────

export type A1V2Action =
  | { type: 'SELECT_ABAC_POLICY'; policy: AbacPolicyKey }
  | { type: 'OPEN_TOGGLE_CONFIRM'; actor: string; scenario?: ConfirmScenario }
  | { type: 'SET_CONFIRM_SCENARIO'; scenario: ConfirmScenario }
  | { type: 'MATCHED_USERS_RESOLVED' }
  | { type: 'CONFIRM_TOGGLE_ENABLE'; actor: string }
  | { type: 'CANCEL_TOGGLE'; actor: string }
  | { type: 'DISABLE_DISCOVERABLE'; actor: string }
  | {
      type: 'SUBMIT_REQUEST';
      actor: string;
      channelId: string;
      priorMembership: boolean;
    }
  | { type: 'WITHDRAW_REQUEST'; actor: string; requestId: string }
  | { type: 'APPROVE_REQUEST'; actor: string; requestId: string }
  | {
      type: 'DENY_REQUEST';
      actor: string;
      requestId: string;
      reason?: string;
    }
  | { type: 'LEAVE_CHANNEL'; actor: string; channelId: string }
  | { type: 'SIMULATE_SESSION_EXPIRY' }
  | { type: 'DISMISS_TOAST' }
  // V2 additions
  | { type: 'SET_PERMALINK_MODE'; mode: PermalinkUnfurlMode }
  | { type: 'SET_PERMALINK_AUDIENCE'; audience: PermalinkAudience }
  | { type: 'SET_SWITCHER_QUERY'; query: string }
  | { type: 'SET_SWITCHER_RESULTS'; results: SwitcherResult[] }
  | { type: 'SET_SWITCHER_LOADING'; loading: boolean }
  | { type: 'OPEN_DECLINE_MODAL'; requestId: string }
  | { type: 'CLOSE_DECLINE_MODAL' }
  | { type: 'SET_DECLINE_STEP'; step: DeclineModalStep }
  | { type: 'SET_DECLINE_REASON'; reason: string }
  | { type: 'SET_SYSTEM_SCHEME_DPC'; enabled: boolean }
  | { type: 'SET_TEAM_OVERRIDE_DPC'; enabled: boolean }
  | { type: 'SET_TEAM_OVERRIDE_ACTIVE'; active: boolean }
  | { type: 'SET_IN_CHANNEL_ADMIN_SYS_MSG'; visible: boolean }
  | { type: 'SET_LHS_PENDING_DOT'; visible: boolean }
  | { type: 'SET_CHANNEL_HEADER_INDICATOR'; visible: boolean }
  | {
      type: 'SET_INDICATOR_SHOWCASE';
      scenario: A1V2State['indicatorShowcaseScenario'];
    };

// ── Seed / initial state ──────────────────────────────────────────────────

const FOCUS_CHANNEL = CHANNELS.find((c) => c.id === 'ch-002')!;

const SEED_PENDING_REQUESTS: PendingRequest[] = [
  {
    id: 'req-seed-1',
    channelId: FOCUS_CHANNEL.id,
    requesterUsername: SUPPORTING_USERS[2].username,
    requesterDisplayName: SUPPORTING_USERS[2].displayName,
    requesterAvatarUrl: SUPPORTING_USERS[2].avatarUrl,
    priorMembership: false,
    submittedAt: '2026-05-13T08:42:18Z',
  },
];

const INITIAL_STATE: A1V2State = {
  abacPolicy: 'typical',
  channelDiscoverable: FOCUS_CHANNEL.discoverable,
  pendingToggle: false,
  confirmScenario: 'enable-typical',
  modalMatchedUsersLoading: false,
  pendingRequests: SEED_PENDING_REQUESTS,
  myPendingRequests: [],
  joinedChannels: [FOCUS_CHANNEL.id],
  rejoinableChannels: ['ch-003'],
  auditEvents: SEED_AUDIT_EVENTS,
  dmNotifications: [],
  modalSessionExpired: false,
  recentlySaved: false,

  // V2 defaults
  permalinkUnfurlMode: 'visible',
  permalinkAudience: 'eligible-non-member',
  switcherQuery: '',
  switcherResults: [],
  switcherLoading: false,
  declineModalOpen: false,
  declineModalRequestId: null,
  declineModalStep: 'reason',
  declineModalReason: '',
  systemSchemeDpcEnabled: true,
  teamOverrideDpcEnabled: false,
  teamOverrideActive: false,
  inChannelAdminSysMsgVisible: true,
  lhsPendingDotVisible: true,
  channelHeaderIndicatorVisible: true,
  indicatorShowcaseScenario: 'all',
};

// ── Helpers ───────────────────────────────────────────────────────────────

function makeRequestId(): string {
  return `req-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function makeDmId(): string {
  return `dm-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function buildAcknowledgmentMetadata(
  policy: AbacPolicy,
  ts: string,
): Record<string, unknown> {
  return {
    matched_user_count: policy.matchedCount,
    policy_key: policy.key,
    policy_hash: `pol-${policy.key}-v1`,
    guest_filter_active: true,
    auto_add_disabled: true,
    timestamp: ts,
  };
}

/**
 * Choose a default scenario discriminator from current state when an admin
 * opens the modal without explicitly passing one. Wave 2 may refine.
 */
function inferConfirmScenario(state: A1V2State): ConfirmScenario {
  if (state.channelDiscoverable && state.pendingRequests.length > 0) {
    return 'disable-with-pending';
  }
  switch (state.abacPolicy) {
    case 'empty':
      return 'enable-empty';
    case 'slow':
      return 'enable-slow';
    default:
      return 'enable-typical';
  }
}

// ── Reducer ───────────────────────────────────────────────────────────────

function reducer(state: A1V2State, action: A1V2Action): A1V2State {
  switch (action.type) {
    case 'SELECT_ABAC_POLICY': {
      return { ...state, abacPolicy: action.policy };
    }

    case 'OPEN_TOGGLE_CONFIRM': {
      const policy = ABAC_POLICIES[state.abacPolicy];
      const ts = new Date().toISOString();
      const isSlow = state.abacPolicy === 'slow';
      const scenario = action.scenario ?? inferConfirmScenario(state);
      const opened = makeAudit({
        ts,
        actor: action.actor,
        action: 'discoverable.toggle.opened',
        resource: FOCUS_CHANNEL.id,
        meta: {
          from: 'channel-settings',
          policy_key: policy.key,
          expected_matched_users: policy.matchedCount,
          scenario,
        },
      });
      return {
        ...state,
        pendingToggle: true,
        confirmScenario: scenario,
        modalMatchedUsersLoading: isSlow,
        modalSessionExpired: false,
        auditEvents: [...state.auditEvents, opened],
      };
    }

    case 'SET_CONFIRM_SCENARIO': {
      return { ...state, confirmScenario: action.scenario };
    }

    case 'MATCHED_USERS_RESOLVED': {
      return { ...state, modalMatchedUsersLoading: false };
    }

    case 'CONFIRM_TOGGLE_ENABLE': {
      const policy = ABAC_POLICIES[state.abacPolicy];
      const ts = new Date().toISOString();

      if (state.modalSessionExpired) {
        const rejected = makeAudit({
          ts,
          actor: action.actor,
          action: 'discoverable.toggle.attempt_rejected',
          resource: FOCUS_CHANNEL.id,
          outcome: 'denied',
          meta: { reason: 'stale_matched_user_cache' },
        });
        return {
          ...state,
          pendingToggle: false,
          modalMatchedUsersLoading: false,
          auditEvents: [...state.auditEvents, rejected],
          recentlySaved: false,
        };
      }

      const enabled = makeAudit({
        ts,
        actor: action.actor,
        action: 'discoverable.toggle.enabled',
        resource: FOCUS_CHANNEL.id,
        meta: {
          to: true,
          acknowledgment_metadata: buildAcknowledgmentMetadata(policy, ts),
        },
      });

      return {
        ...state,
        channelDiscoverable: true,
        pendingToggle: false,
        modalMatchedUsersLoading: false,
        auditEvents: [...state.auditEvents, enabled],
        recentlySaved: true,
      };
    }

    case 'CANCEL_TOGGLE': {
      const ts = new Date().toISOString();
      const cancelled = makeAudit({
        ts,
        actor: action.actor,
        action: 'discoverable.toggle.cancelled',
        resource: FOCUS_CHANNEL.id,
        meta: { policy_key: state.abacPolicy },
      });
      return {
        ...state,
        pendingToggle: false,
        modalMatchedUsersLoading: false,
        auditEvents: [...state.auditEvents, cancelled],
      };
    }

    case 'DISABLE_DISCOVERABLE': {
      const ts = new Date().toISOString();
      const autoWithdrawnDms: DmNotification[] = state.pendingRequests.map(
        (req) => ({
          id: makeDmId(),
          variant: 'auto-withdraw-disabled',
          channelId: req.channelId,
          channelName: FOCUS_CHANNEL.displayName,
          adminUsername: action.actor,
          createdAt: ts,
        }),
      );
      const disabledEvent = makeAudit({
        ts,
        actor: action.actor,
        action: 'discoverable.toggle.disabled',
        resource: FOCUS_CHANNEL.id,
        meta: { to: false, withdrawn_pending: state.pendingRequests.length },
      });
      const withdrawalEvents: AuditEvent[] = state.pendingRequests.map((req) =>
        makeAudit({
          ts,
          actor: 'system',
          action: 'request.withdrawn',
          resource: req.id,
          meta: { reason: 'auto_withdraw_disabled', requester: req.requesterUsername },
        }),
      );
      return {
        ...state,
        channelDiscoverable: false,
        pendingRequests: [],
        dmNotifications: [...state.dmNotifications, ...autoWithdrawnDms],
        auditEvents: [...state.auditEvents, disabledEvent, ...withdrawalEvents],
      };
    }

    case 'SUBMIT_REQUEST': {
      const ts = new Date().toISOString();
      const requesterPersona = Object.values(PERSONAS).find(
        (p) => p.username === action.actor,
      );
      if (!requesterPersona) return state;

      const newReq: PendingRequest = {
        id: makeRequestId(),
        channelId: action.channelId,
        requesterUsername: requesterPersona.username,
        requesterDisplayName: requesterPersona.displayName,
        requesterAvatarUrl: requesterPersona.avatarUrl,
        priorMembership: action.priorMembership,
        submittedAt: ts,
      };
      const submitted = makeAudit({
        ts,
        actor: action.actor,
        action: 'request.submitted',
        resource: action.channelId,
        meta: {
          request_id: newReq.id,
          prior_membership: action.priorMembership,
        },
      });
      return {
        ...state,
        pendingRequests: [...state.pendingRequests, newReq],
        myPendingRequests: [...state.myPendingRequests, newReq.id],
        auditEvents: [...state.auditEvents, submitted],
      };
    }

    case 'WITHDRAW_REQUEST': {
      const ts = new Date().toISOString();
      const target = state.pendingRequests.find(
        (r) => r.id === action.requestId,
      );
      if (!target) return state;
      const withdrawn = makeAudit({
        ts,
        actor: action.actor,
        action: 'request.withdrawn',
        resource: target.channelId,
        meta: { request_id: target.id, reason: 'manual_withdraw' },
      });
      return {
        ...state,
        pendingRequests: state.pendingRequests.filter(
          (r) => r.id !== action.requestId,
        ),
        myPendingRequests: state.myPendingRequests.filter(
          (id) => id !== action.requestId,
        ),
        auditEvents: [...state.auditEvents, withdrawn],
      };
    }

    case 'APPROVE_REQUEST': {
      const ts = new Date().toISOString();
      const target = state.pendingRequests.find(
        (r) => r.id === action.requestId,
      );
      if (!target) return state;

      const approved = makeAudit({
        ts,
        actor: action.actor,
        action: 'request.approved',
        resource: target.channelId,
        meta: {
          request_id: target.id,
          requester: target.requesterUsername,
        },
      });
      const dm: DmNotification = {
        id: makeDmId(),
        variant: 'approved',
        channelId: target.channelId,
        channelName: FOCUS_CHANNEL.displayName,
        adminUsername: action.actor,
        createdAt: ts,
      };
      return {
        ...state,
        pendingRequests: state.pendingRequests.filter(
          (r) => r.id !== action.requestId,
        ),
        myPendingRequests: state.myPendingRequests.filter(
          (id) => id !== action.requestId,
        ),
        dmNotifications: [...state.dmNotifications, dm],
        auditEvents: [...state.auditEvents, approved],
      };
    }

    case 'DENY_REQUEST': {
      const ts = new Date().toISOString();
      const target = state.pendingRequests.find(
        (r) => r.id === action.requestId,
      );
      if (!target) return state;

      const reasonText = action.reason?.trim()
        ? action.reason.slice(0, 500)
        : undefined;
      const denied = makeAudit({
        ts,
        actor: action.actor,
        action: 'request.denied',
        resource: target.channelId,
        outcome: 'denied',
        meta: {
          request_id: target.id,
          requester: target.requesterUsername,
          reason: reasonText ?? null,
        },
      });
      const dm: DmNotification = {
        id: makeDmId(),
        variant: reasonText ? 'denied-with-reason' : 'denied-no-reason',
        channelId: target.channelId,
        channelName: FOCUS_CHANNEL.displayName,
        adminUsername: action.actor,
        reasonText,
        createdAt: ts,
      };
      return {
        ...state,
        pendingRequests: state.pendingRequests.filter(
          (r) => r.id !== action.requestId,
        ),
        myPendingRequests: state.myPendingRequests.filter(
          (id) => id !== action.requestId,
        ),
        dmNotifications: [...state.dmNotifications, dm],
        auditEvents: [...state.auditEvents, denied],
        // Reset decline modal after a successful deny.
        declineModalOpen: false,
        declineModalRequestId: null,
        declineModalStep: 'reason',
        declineModalReason: '',
      };
    }

    case 'LEAVE_CHANNEL': {
      const ts = new Date().toISOString();
      const left = makeAudit({
        ts,
        actor: action.actor,
        action: 'channel.left',
        resource: action.channelId,
        meta: { adds_to_rejoinable: true },
      });
      return {
        ...state,
        joinedChannels: state.joinedChannels.filter(
          (id) => id !== action.channelId,
        ),
        rejoinableChannels: state.rejoinableChannels.includes(action.channelId)
          ? state.rejoinableChannels
          : [...state.rejoinableChannels, action.channelId],
        auditEvents: [...state.auditEvents, left],
      };
    }

    case 'SIMULATE_SESSION_EXPIRY': {
      return { ...state, modalSessionExpired: true };
    }

    case 'DISMISS_TOAST': {
      return { ...state, recentlySaved: false };
    }

    // ── V2 additions ──────────────────────────────────────────────────────

    case 'SET_PERMALINK_MODE': {
      return { ...state, permalinkUnfurlMode: action.mode };
    }
    case 'SET_PERMALINK_AUDIENCE': {
      return { ...state, permalinkAudience: action.audience };
    }
    case 'SET_SWITCHER_QUERY': {
      return { ...state, switcherQuery: action.query };
    }
    case 'SET_SWITCHER_RESULTS': {
      return { ...state, switcherResults: action.results };
    }
    case 'SET_SWITCHER_LOADING': {
      return { ...state, switcherLoading: action.loading };
    }
    case 'OPEN_DECLINE_MODAL': {
      return {
        ...state,
        declineModalOpen: true,
        declineModalRequestId: action.requestId,
        declineModalStep: 'reason',
        declineModalReason: '',
      };
    }
    case 'CLOSE_DECLINE_MODAL': {
      return {
        ...state,
        declineModalOpen: false,
        declineModalRequestId: null,
        declineModalStep: 'reason',
        declineModalReason: '',
      };
    }
    case 'SET_DECLINE_STEP': {
      return { ...state, declineModalStep: action.step };
    }
    case 'SET_DECLINE_REASON': {
      return { ...state, declineModalReason: action.reason.slice(0, 500) };
    }
    case 'SET_SYSTEM_SCHEME_DPC': {
      return { ...state, systemSchemeDpcEnabled: action.enabled };
    }
    case 'SET_TEAM_OVERRIDE_DPC': {
      return { ...state, teamOverrideDpcEnabled: action.enabled };
    }
    case 'SET_TEAM_OVERRIDE_ACTIVE': {
      return { ...state, teamOverrideActive: action.active };
    }
    case 'SET_IN_CHANNEL_ADMIN_SYS_MSG': {
      return { ...state, inChannelAdminSysMsgVisible: action.visible };
    }
    case 'SET_LHS_PENDING_DOT': {
      return { ...state, lhsPendingDotVisible: action.visible };
    }
    case 'SET_CHANNEL_HEADER_INDICATOR': {
      return { ...state, channelHeaderIndicatorVisible: action.visible };
    }
    case 'SET_INDICATOR_SHOWCASE': {
      return { ...state, indicatorShowcaseScenario: action.scenario };
    }

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────

export interface A1V2StoreApi {
  state: A1V2State;
  policy: AbacPolicy;
  focusChannel: ChannelFixture;
  dispatch: (action: A1V2Action) => void;
  // V1 carry-forward action creators.
  selectAbacPolicy: (policy: AbacPolicyKey) => void;
  openToggleConfirm: (actor: string, scenario?: ConfirmScenario) => void;
  setConfirmScenario: (scenario: ConfirmScenario) => void;
  resolveMatchedUsers: () => void;
  confirmToggleEnable: (actor: string) => void;
  cancelToggle: (actor: string) => void;
  disableDiscoverable: (actor: string) => void;
  submitRequest: (
    actor: string,
    channelId: string,
    priorMembership: boolean,
  ) => void;
  withdrawRequest: (actor: string, requestId: string) => void;
  approveRequest: (actor: string, requestId: string) => void;
  denyRequest: (actor: string, requestId: string, reason?: string) => void;
  leaveChannel: (actor: string, channelId: string) => void;
  simulateSessionExpiry: () => void;
  dismissToast: () => void;
  // Helpers for views.
  hasPendingForChannel: (channelId: string, persona: Persona) => boolean;
  myPendingRequestForChannel: (
    channelId: string,
    persona: Persona,
  ) => PendingRequest | undefined;
  // V2 action creators.
  setPermalinkMode: (mode: PermalinkUnfurlMode) => void;
  setPermalinkAudience: (audience: PermalinkAudience) => void;
  setSwitcherQuery: (query: string) => void;
  setSwitcherResults: (results: SwitcherResult[]) => void;
  setSwitcherLoading: (loading: boolean) => void;
  openDeclineModal: (requestId: string) => void;
  closeDeclineModal: () => void;
  setDeclineStep: (step: DeclineModalStep) => void;
  setDeclineReason: (reason: string) => void;
  setSystemSchemeDpc: (enabled: boolean) => void;
  setTeamOverrideDpc: (enabled: boolean) => void;
  setTeamOverrideActive: (active: boolean) => void;
  setInChannelAdminSysMsg: (visible: boolean) => void;
  setLhsPendingDot: (visible: boolean) => void;
  setChannelHeaderIndicator: (visible: boolean) => void;
  setIndicatorShowcase: (
    scenario: A1V2State['indicatorShowcaseScenario'],
  ) => void;
}

export function useA1V2Store(): A1V2StoreApi {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const policy = ABAC_POLICIES[state.abacPolicy];

  const selectAbacPolicy = useCallback((next: AbacPolicyKey) => {
    dispatch({ type: 'SELECT_ABAC_POLICY', policy: next });
  }, []);

  const openToggleConfirm = useCallback(
    (actor: string, scenario?: ConfirmScenario) => {
      dispatch({ type: 'OPEN_TOGGLE_CONFIRM', actor, scenario });
    },
    [],
  );

  const setConfirmScenario = useCallback((scenario: ConfirmScenario) => {
    dispatch({ type: 'SET_CONFIRM_SCENARIO', scenario });
  }, []);

  const resolveMatchedUsers = useCallback(() => {
    dispatch({ type: 'MATCHED_USERS_RESOLVED' });
  }, []);

  const confirmToggleEnable = useCallback((actor: string) => {
    dispatch({ type: 'CONFIRM_TOGGLE_ENABLE', actor });
  }, []);

  const cancelToggle = useCallback((actor: string) => {
    dispatch({ type: 'CANCEL_TOGGLE', actor });
  }, []);

  const disableDiscoverable = useCallback((actor: string) => {
    dispatch({ type: 'DISABLE_DISCOVERABLE', actor });
  }, []);

  const submitRequest = useCallback(
    (actor: string, channelId: string, priorMembership: boolean) => {
      dispatch({ type: 'SUBMIT_REQUEST', actor, channelId, priorMembership });
    },
    [],
  );

  const withdrawRequest = useCallback((actor: string, requestId: string) => {
    dispatch({ type: 'WITHDRAW_REQUEST', actor, requestId });
  }, []);

  const approveRequest = useCallback((actor: string, requestId: string) => {
    dispatch({ type: 'APPROVE_REQUEST', actor, requestId });
  }, []);

  const denyRequest = useCallback(
    (actor: string, requestId: string, reason?: string) => {
      dispatch({ type: 'DENY_REQUEST', actor, requestId, reason });
    },
    [],
  );

  const leaveChannel = useCallback((actor: string, channelId: string) => {
    dispatch({ type: 'LEAVE_CHANNEL', actor, channelId });
  }, []);

  const simulateSessionExpiry = useCallback(() => {
    dispatch({ type: 'SIMULATE_SESSION_EXPIRY' });
  }, []);

  const dismissToast = useCallback(() => {
    dispatch({ type: 'DISMISS_TOAST' });
  }, []);

  const hasPendingForChannel = useCallback(
    (channelId: string, persona: Persona): boolean => {
      const username = PERSONAS[persona].username;
      return state.pendingRequests.some(
        (req) =>
          req.channelId === channelId && req.requesterUsername === username,
      );
    },
    [state.pendingRequests],
  );

  const myPendingRequestForChannel = useCallback(
    (channelId: string, persona: Persona): PendingRequest | undefined => {
      const username = PERSONAS[persona].username;
      return state.pendingRequests.find(
        (req) =>
          req.channelId === channelId && req.requesterUsername === username,
      );
    },
    [state.pendingRequests],
  );

  // ── V2 action creators ──────────────────────────────────────────────────

  const setPermalinkMode = useCallback((mode: PermalinkUnfurlMode) => {
    dispatch({ type: 'SET_PERMALINK_MODE', mode });
  }, []);
  const setPermalinkAudience = useCallback((audience: PermalinkAudience) => {
    dispatch({ type: 'SET_PERMALINK_AUDIENCE', audience });
  }, []);
  const setSwitcherQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SWITCHER_QUERY', query });
  }, []);
  const setSwitcherResults = useCallback((results: SwitcherResult[]) => {
    dispatch({ type: 'SET_SWITCHER_RESULTS', results });
  }, []);
  const setSwitcherLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_SWITCHER_LOADING', loading });
  }, []);
  const openDeclineModal = useCallback((requestId: string) => {
    dispatch({ type: 'OPEN_DECLINE_MODAL', requestId });
  }, []);
  const closeDeclineModal = useCallback(() => {
    dispatch({ type: 'CLOSE_DECLINE_MODAL' });
  }, []);
  const setDeclineStep = useCallback((step: DeclineModalStep) => {
    dispatch({ type: 'SET_DECLINE_STEP', step });
  }, []);
  const setDeclineReason = useCallback((reason: string) => {
    dispatch({ type: 'SET_DECLINE_REASON', reason });
  }, []);
  const setSystemSchemeDpc = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_SYSTEM_SCHEME_DPC', enabled });
  }, []);
  const setTeamOverrideDpc = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_TEAM_OVERRIDE_DPC', enabled });
  }, []);
  const setTeamOverrideActive = useCallback((active: boolean) => {
    dispatch({ type: 'SET_TEAM_OVERRIDE_ACTIVE', active });
  }, []);
  const setInChannelAdminSysMsg = useCallback((visible: boolean) => {
    dispatch({ type: 'SET_IN_CHANNEL_ADMIN_SYS_MSG', visible });
  }, []);
  const setLhsPendingDot = useCallback((visible: boolean) => {
    dispatch({ type: 'SET_LHS_PENDING_DOT', visible });
  }, []);
  const setChannelHeaderIndicator = useCallback((visible: boolean) => {
    dispatch({ type: 'SET_CHANNEL_HEADER_INDICATOR', visible });
  }, []);
  const setIndicatorShowcase = useCallback(
    (scenario: A1V2State['indicatorShowcaseScenario']) => {
      dispatch({ type: 'SET_INDICATOR_SHOWCASE', scenario });
    },
    [],
  );

  return useMemo<A1V2StoreApi>(
    () => ({
      state,
      policy,
      focusChannel: FOCUS_CHANNEL,
      dispatch,
      selectAbacPolicy,
      openToggleConfirm,
      setConfirmScenario,
      resolveMatchedUsers,
      confirmToggleEnable,
      cancelToggle,
      disableDiscoverable,
      submitRequest,
      withdrawRequest,
      approveRequest,
      denyRequest,
      leaveChannel,
      simulateSessionExpiry,
      dismissToast,
      hasPendingForChannel,
      myPendingRequestForChannel,
      setPermalinkMode,
      setPermalinkAudience,
      setSwitcherQuery,
      setSwitcherResults,
      setSwitcherLoading,
      openDeclineModal,
      closeDeclineModal,
      setDeclineStep,
      setDeclineReason,
      setSystemSchemeDpc,
      setTeamOverrideDpc,
      setTeamOverrideActive,
      setInChannelAdminSysMsg,
      setLhsPendingDot,
      setChannelHeaderIndicator,
      setIndicatorShowcase,
    }),
    [
      state,
      policy,
      selectAbacPolicy,
      openToggleConfirm,
      setConfirmScenario,
      resolveMatchedUsers,
      confirmToggleEnable,
      cancelToggle,
      disableDiscoverable,
      submitRequest,
      withdrawRequest,
      approveRequest,
      denyRequest,
      leaveChannel,
      simulateSessionExpiry,
      dismissToast,
      hasPendingForChannel,
      myPendingRequestForChannel,
      setPermalinkMode,
      setPermalinkAudience,
      setSwitcherQuery,
      setSwitcherResults,
      setSwitcherLoading,
      openDeclineModal,
      closeDeclineModal,
      setDeclineStep,
      setDeclineReason,
      setSystemSchemeDpc,
      setTeamOverrideDpc,
      setTeamOverrideActive,
      setInChannelAdminSysMsg,
      setLhsPendingDot,
      setChannelHeaderIndicator,
      setIndicatorShowcase,
    ],
  );
}

export { FOCUS_CHANNEL };
