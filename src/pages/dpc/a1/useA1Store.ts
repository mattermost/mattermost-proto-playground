/**
 * DPC A1 local state machine — Confirm-and-Commit mechanism.
 *
 * Mirrors the flow contract in 05-flow-review.md §3.1 for Approach A1:
 *   • Channel admin toggles Discoverable → modal opens with matched-user set
 *   • Slow-path UX simulates server-side computation > 300ms (NFR-5 boundary)
 *   • Acknowledged commit emits FR-13 audit event with acknowledgment_metadata
 *   • Requesters can submit / withdraw join requests
 *   • Admins approve / deny pending requests
 *   • DM notification copy is derived from outcome + reason text
 *   • Leave-and-Rejoin overlay surfaces rejoinable channels
 *   • Modal session-expiry / stale-state demo via SIMULATE_SESSION_EXPIRY
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

export interface A1State {
  /** Current ABAC policy preset driving matched-user previews. */
  abacPolicy: AbacPolicyKey;
  /** Whether `ops-planning-q3` is currently Discoverable. Seed mirrors fixtures. */
  channelDiscoverable: boolean;
  /** True when admin clicked Save with the toggle flipped ON — modal open. */
  pendingToggle: boolean;
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
}

// ── Actions ───────────────────────────────────────────────────────────────

export type A1Action =
  | { type: 'SELECT_ABAC_POLICY'; policy: AbacPolicyKey }
  // Admin opens the Confirm-and-Commit modal by toggling Discoverable ON then Save.
  | { type: 'OPEN_TOGGLE_CONFIRM'; actor: string }
  // Slow-path: server returns matched-user count, modal primary button enables.
  | { type: 'MATCHED_USERS_RESOLVED' }
  // Admin clicks the consequence-bearing primary action.
  | { type: 'CONFIRM_TOGGLE_ENABLE'; actor: string }
  // Admin closes the modal without committing.
  | { type: 'CANCEL_TOGGLE'; actor: string }
  // Admin flips Discoverable OFF — bypasses the modal (no acknowledgment needed
  // to make a channel LESS discoverable). FR-10 auto-withdraw fires for pending.
  | { type: 'DISABLE_DISCOVERABLE'; actor: string }
  // End-user submits a Request-to-Join.
  | {
      type: 'SUBMIT_REQUEST';
      actor: string;
      channelId: string;
      priorMembership: boolean;
    }
  // End-user withdraws their own pending request.
  | { type: 'WITHDRAW_REQUEST'; actor: string; requestId: string }
  // Admin approves a pending request (DM dispatched).
  | { type: 'APPROVE_REQUEST'; actor: string; requestId: string }
  // Admin denies a pending request with optional reason text (FR-17).
  | {
      type: 'DENY_REQUEST';
      actor: string;
      requestId: string;
      reason?: string;
    }
  // Tenured end-user leaves a channel (drives L&R overlay surface).
  | { type: 'LEAVE_CHANNEL'; actor: string; channelId: string }
  // Demo: server returns stale-state rejection on next commit.
  | { type: 'SIMULATE_SESSION_EXPIRY' }
  // Dismiss the post-save / session-expiry toast.
  | { type: 'DISMISS_TOAST' };

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

const INITIAL_STATE: A1State = {
  abacPolicy: 'typical',
  channelDiscoverable: FOCUS_CHANNEL.discoverable,
  pendingToggle: false,
  modalMatchedUsersLoading: false,
  pendingRequests: SEED_PENDING_REQUESTS,
  myPendingRequests: [],
  joinedChannels: [FOCUS_CHANNEL.id],
  rejoinableChannels: ['ch-003'], // demo: persona previously left mission-coord-alpha
  auditEvents: SEED_AUDIT_EVENTS,
  dmNotifications: [],
  modalSessionExpired: false,
  recentlySaved: false,
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
    policy_hash: `pol-${policy.key}-v1`, // deterministic for prototype
    guest_filter_active: true, // NFR-2 always-on
    auto_add_disabled: true, // KD: routing through admin queue by default
    timestamp: ts,
  };
}

// ── Reducer ───────────────────────────────────────────────────────────────

function reducer(state: A1State, action: A1Action): A1State {
  switch (action.type) {
    case 'SELECT_ABAC_POLICY': {
      return { ...state, abacPolicy: action.policy };
    }

    case 'OPEN_TOGGLE_CONFIRM': {
      const policy = ABAC_POLICIES[state.abacPolicy];
      const ts = new Date().toISOString();
      const isSlow = state.abacPolicy === 'slow';
      const opened = makeAudit({
        ts,
        actor: action.actor,
        action: 'discoverable.toggle.opened',
        resource: FOCUS_CHANNEL.id,
        meta: {
          from: 'channel-settings',
          policy_key: policy.key,
          expected_matched_users: policy.matchedCount,
        },
      });
      return {
        ...state,
        pendingToggle: true,
        modalMatchedUsersLoading: isSlow,
        modalSessionExpired: false,
        auditEvents: [...state.auditEvents, opened],
      };
    }

    case 'MATCHED_USERS_RESOLVED': {
      // Annotated: slow-path UX → server returns matched-user computation result.
      return { ...state, modalMatchedUsersLoading: false };
    }

    case 'CONFIRM_TOGGLE_ENABLE': {
      const policy = ABAC_POLICIES[state.abacPolicy];
      const ts = new Date().toISOString();

      if (state.modalSessionExpired) {
        // Stale-state rejection per §3.1.10 modal session expiry copy.
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

      // FR-13 + acknowledgment_metadata claim block (Phase 4 §7.3 mitigation).
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
      // FR-10: auto-withdraw any pending requests on disable.
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
          prior_membership: action.priorMembership, // FR-13 + §3.1.6 payload
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

      // FR-17: optional reason, 500-char cap enforced at input boundary.
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

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────

export interface A1StoreApi {
  state: A1State;
  policy: AbacPolicy;
  focusChannel: ChannelFixture;
  dispatch: (action: A1Action) => void;
  // Convenience action creators.
  selectAbacPolicy: (policy: AbacPolicyKey) => void;
  openToggleConfirm: (actor: string) => void;
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
}

export function useA1Store(): A1StoreApi {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const policy = ABAC_POLICIES[state.abacPolicy];

  const selectAbacPolicy = useCallback((next: AbacPolicyKey) => {
    dispatch({ type: 'SELECT_ABAC_POLICY', policy: next });
  }, []);

  const openToggleConfirm = useCallback((actor: string) => {
    dispatch({ type: 'OPEN_TOGGLE_CONFIRM', actor });
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

  return useMemo<A1StoreApi>(
    () => ({
      state,
      policy,
      focusChannel: FOCUS_CHANNEL,
      dispatch,
      selectAbacPolicy,
      openToggleConfirm,
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
    }),
    [
      state,
      policy,
      selectAbacPolicy,
      openToggleConfirm,
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
    ],
  );
}

export { FOCUS_CHANNEL };
