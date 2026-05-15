/**
 * DPC A2 — local state machine for the Intent-Wizard mechanism.
 *
 * Implements the client-side state machine described in Phase 5 §3.2.4.5:
 *
 *   discoverable=OFF
 *     → admin flips toggle → wizardStep=step1 (scope=undecided)
 *     → admin chooses open-to-team → wizardStep=step2a
 *         → Save → discoverable=ON, scope=open-to-team (atomic)
 *     → admin chooses restrict-by-rules → wizardStep=step2b
 *         → admin edits rules (step2bRulesDirty=true)
 *         → Back → discard warning (V-A2-1 mitigation)
 *         → Save → discoverable=ON, scope=restrict, rules persisted (atomic)
 *     → modal X / abandon → wizard_abandoned audit, no commit
 *
 * Audit events per §3.2.7: Discoverable_wizard_started,
 * Discoverable_wizard_completed (with scope_choice), Discoverable_wizard_abandoned
 * (with last_step), plus the runtime requester / approval audit events shared
 * with A1.
 */
import { useMemo, useReducer } from 'react';
import {
  CHANNELS,
  SEED_AUDIT_EVENTS,
  SUPPORTING_USERS,
  makeAudit,
  type AbacRule,
  type AuditEvent,
  type ChannelFixture,
} from '@/pages/dpc/shared';

export type WizardStep = 'closed' | 'step1' | 'step2a' | 'step2b';
export type ScopeChoice = 'open-to-team' | 'restrict-by-rules';

export interface PendingRequest {
  id: string;
  userId: string;
  channelId: string;
  submittedAt: string;
  priorMembership: boolean;
}

export interface A2State {
  /** Server-side discoverable bit; PENDING is purely a client wizardStep concept. */
  channelDiscoverableCommitted: boolean;
  /** Server-side committed scope (only meaningful when committed=true). */
  committedScope: null | ScopeChoice;
  /** Committed access rules (server-side) — applies only to restrict scope. */
  committedRules: AbacRule[];
  /** Current wizard step. */
  wizardStep: WizardStep;
  /** Scope chosen in Step 1; null until Continue is clicked. */
  scopeChoice: null | ScopeChoice;
  /** Partial rules being authored in Step 2B (not yet persisted). */
  step2bAccessRules: AbacRule[];
  /** True once the admin has touched the rule editor in Step 2B. */
  step2bRulesDirty: boolean;
  /** Pending join requests in the channel-admin queue. */
  pendingRequests: PendingRequest[];
  /** IDs of channels the persona has an active request on. */
  myPendingRequests: string[];
  /** IDs of channels the persona is currently a member of. */
  joinedChannels: string[];
  /** IDs of channels the persona has previously left (rejoinable). */
  rejoinableChannels: string[];
  /** Running audit log (extends the seed). */
  auditEvents: AuditEvent[];
  /** Whether the V-A2-1 discard-warning toast is currently showing. */
  showBackButtonWarning: boolean;
  /** Tab currently active in Channel Settings (info | access-control). */
  activeSettingsTab: 'info' | 'access-control';
}

type A2Action =
  | { type: 'OPEN_WIZARD' }
  | { type: 'SELECT_SCOPE'; scope: ScopeChoice }
  | { type: 'CONTINUE_TO_STEP2' }
  | { type: 'BACK_FROM_STEP2A' }
  | { type: 'BACK_FROM_STEP2B' }
  | { type: 'CONFIRM_BACK_DISCARD' }
  | { type: 'DISMISS_BACK_WARNING' }
  | { type: 'EDIT_RULES_STEP2B'; rules: AbacRule[] }
  | { type: 'SAVE_STEP2A' }
  | { type: 'SAVE_STEP2B' }
  | { type: 'CANCEL_DISCOVERABLE_FROM_BANNER' }
  | { type: 'ABANDON_WIZARD'; via: 'cancel' | 'close-x' | 'tab-close' }
  | { type: 'DISABLE_DISCOVERABLE' }
  | { type: 'SET_SETTINGS_TAB'; tab: 'info' | 'access-control' }
  | { type: 'SUBMIT_REQUEST'; channelId: string; actor: string; priorMembership: boolean }
  | { type: 'WITHDRAW_REQUEST'; channelId: string; actor: string }
  | { type: 'APPROVE_REQUEST'; requestId: string; actor: string }
  | { type: 'DENY_REQUEST'; requestId: string; actor: string; reason: string }
  | { type: 'RESET' };

const TARGET_CHANNEL: ChannelFixture =
  CHANNELS.find((c) => c.id === 'ch-002') ?? CHANNELS[0]!;

const INITIAL_PENDING_REQUESTS: PendingRequest[] = [
  {
    id: 'pr-001',
    userId: SUPPORTING_USERS[2]?.username ?? 'cyber.analyst',
    channelId: TARGET_CHANNEL.id,
    submittedAt: '2026-05-13T09:32:14Z',
    priorMembership: false,
  },
  {
    id: 'pr-002',
    userId: SUPPORTING_USERS[5]?.username ?? 'site.eng',
    channelId: TARGET_CHANNEL.id,
    submittedAt: '2026-05-13T09:46:02Z',
    priorMembership: true,
  },
];

function makeInitialState(): A2State {
  // Start with the target channel NOT yet discoverable so the wizard is
  // the load-bearing surface the admin lands on first.
  return {
    channelDiscoverableCommitted: false,
    committedScope: null,
    committedRules: [],
    wizardStep: 'closed',
    scopeChoice: null,
    step2bAccessRules: [
      { attribute: 'program', operator: 'equals', value: '' },
    ],
    step2bRulesDirty: false,
    pendingRequests: INITIAL_PENDING_REQUESTS,
    myPendingRequests: [],
    joinedChannels: ['ch-001'],
    rejoinableChannels: ['ch-003'],
    auditEvents: [...SEED_AUDIT_EVENTS],
    showBackButtonWarning: false,
    activeSettingsTab: 'info',
  };
}

function lastStepLabel(step: WizardStep, dirty: boolean): string {
  if (step === 'step1') return 'step=1';
  if (step === 'step2a') return 'step=2A';
  if (step === 'step2b') return dirty ? 'step=2B_in_progress' : 'step=2B';
  return 'step=closed';
}

function appendAudit(state: A2State, event: AuditEvent): A2State {
  return { ...state, auditEvents: [event, ...state.auditEvents] };
}

function reducer(state: A2State, action: A2Action): A2State {
  switch (action.type) {
    case 'OPEN_WIZARD': {
      const event = makeAudit({
        actor: 'ops.coord',
        action: 'Discoverable_wizard_started',
        resource: TARGET_CHANNEL.id,
        meta: { from: 'channel-settings.info-tab' },
      });
      return appendAudit(
        {
          ...state,
          wizardStep: 'step1',
          scopeChoice: null,
          step2bRulesDirty: false,
          step2bAccessRules: [
            { attribute: 'program', operator: 'equals', value: '' },
          ],
        },
        event,
      );
    }

    case 'SELECT_SCOPE': {
      return { ...state, scopeChoice: action.scope };
    }

    case 'CONTINUE_TO_STEP2': {
      if (state.scopeChoice === 'open-to-team') {
        return { ...state, wizardStep: 'step2a' };
      }
      if (state.scopeChoice === 'restrict-by-rules') {
        return {
          ...state,
          wizardStep: 'step2b',
          activeSettingsTab: 'access-control',
        };
      }
      return state;
    }

    case 'BACK_FROM_STEP2A': {
      // No dirty state in 2A; jump straight back to Step 1.
      return {
        ...state,
        wizardStep: 'step1',
      };
    }

    case 'BACK_FROM_STEP2B': {
      // V-A2-1: if the rules have been touched, surface the discard warning.
      // Either way the scope choice is retained per §3.2.10.
      if (state.step2bRulesDirty) {
        return {
          ...state,
          showBackButtonWarning: true,
        };
      }
      return {
        ...state,
        wizardStep: 'step1',
        activeSettingsTab: 'info',
      };
    }

    case 'CONFIRM_BACK_DISCARD': {
      return {
        ...state,
        wizardStep: 'step1',
        activeSettingsTab: 'info',
        showBackButtonWarning: false,
        step2bRulesDirty: false,
        step2bAccessRules: [
          { attribute: 'program', operator: 'equals', value: '' },
        ],
      };
    }

    case 'DISMISS_BACK_WARNING': {
      return { ...state, showBackButtonWarning: false };
    }

    case 'EDIT_RULES_STEP2B': {
      return {
        ...state,
        step2bAccessRules: action.rules,
        step2bRulesDirty: true,
      };
    }

    case 'SAVE_STEP2A': {
      const completeEvent = makeAudit({
        actor: 'ops.coord',
        action: 'Discoverable_wizard_completed',
        resource: TARGET_CHANNEL.id,
        meta: { scope_choice: 'open_to_team' },
      });
      const enableEvent = makeAudit({
        actor: 'ops.coord',
        action: 'Discoverable_enabled',
        resource: TARGET_CHANNEL.id,
        meta: { scope: 'open_to_team' },
      });
      return appendAudit(
        appendAudit(
          {
            ...state,
            channelDiscoverableCommitted: true,
            committedScope: 'open-to-team',
            committedRules: [],
            wizardStep: 'closed',
            scopeChoice: null,
          },
          enableEvent,
        ),
        completeEvent,
      );
    }

    case 'SAVE_STEP2B': {
      const cleanRules = state.step2bAccessRules.filter(
        (r) => r.attribute && r.value,
      );
      const completeEvent = makeAudit({
        actor: 'ops.coord',
        action: 'Discoverable_wizard_completed',
        resource: TARGET_CHANNEL.id,
        meta: {
          scope_choice: 'restrict',
          rule_count: cleanRules.length,
          rule_fingerprint: 'sha256-prototype-stub',
        },
      });
      const enableEvent = makeAudit({
        actor: 'ops.coord',
        action: 'Discoverable_enabled',
        resource: TARGET_CHANNEL.id,
        meta: {
          scope: 'restrict',
          access_rules: cleanRules,
        },
      });
      return appendAudit(
        appendAudit(
          {
            ...state,
            channelDiscoverableCommitted: true,
            committedScope: 'restrict-by-rules',
            committedRules: cleanRules,
            wizardStep: 'closed',
            scopeChoice: null,
            step2bRulesDirty: false,
          },
          enableEvent,
        ),
        completeEvent,
      );
    }

    case 'CANCEL_DISCOVERABLE_FROM_BANNER': {
      // Banner cancel discards the pending transition entirely.
      const event = makeAudit({
        actor: 'ops.coord',
        action: 'Discoverable_wizard_abandoned',
        resource: TARGET_CHANNEL.id,
        outcome: 'denied',
        meta: {
          via: 'cancel-banner',
          last_step: lastStepLabel('step2b', state.step2bRulesDirty),
        },
      });
      return appendAudit(
        {
          ...state,
          wizardStep: 'closed',
          scopeChoice: null,
          step2bRulesDirty: false,
          step2bAccessRules: [
            { attribute: 'program', operator: 'equals', value: '' },
          ],
          activeSettingsTab: 'info',
        },
        event,
      );
    }

    case 'ABANDON_WIZARD': {
      const event = makeAudit({
        actor: 'ops.coord',
        action: 'Discoverable_wizard_abandoned',
        resource: TARGET_CHANNEL.id,
        outcome: 'denied',
        meta: {
          via: action.via,
          last_step: lastStepLabel(state.wizardStep, state.step2bRulesDirty),
        },
      });
      return appendAudit(
        {
          ...state,
          wizardStep: 'closed',
          scopeChoice: null,
          step2bRulesDirty: false,
          step2bAccessRules: [
            { attribute: 'program', operator: 'equals', value: '' },
          ],
          activeSettingsTab: 'info',
        },
        event,
      );
    }

    case 'DISABLE_DISCOVERABLE': {
      const event = makeAudit({
        actor: 'ops.coord',
        action: 'Discoverable_disabled',
        resource: TARGET_CHANNEL.id,
        meta: {
          previous_scope:
            state.committedScope === 'open-to-team'
              ? 'open_to_team'
              : 'restrict',
        },
      });
      return appendAudit(
        {
          ...state,
          channelDiscoverableCommitted: false,
          committedScope: null,
          committedRules: [],
          pendingRequests: [],
          activeSettingsTab: 'info',
        },
        event,
      );
    }

    case 'SET_SETTINGS_TAB': {
      // Block tab change away from access-control while wizard step 2b is open.
      if (state.wizardStep === 'step2b' && action.tab !== 'access-control') {
        return state;
      }
      return { ...state, activeSettingsTab: action.tab };
    }

    case 'SUBMIT_REQUEST': {
      const id = `pr-${Date.now()}`;
      const event = makeAudit({
        actor: action.actor,
        action: 'Request_submitted',
        resource: action.channelId,
        meta: { prior_membership: action.priorMembership },
      });
      return appendAudit(
        {
          ...state,
          pendingRequests: [
            ...state.pendingRequests,
            {
              id,
              userId: action.actor,
              channelId: action.channelId,
              submittedAt: new Date().toISOString(),
              priorMembership: action.priorMembership,
            },
          ],
          myPendingRequests: [...state.myPendingRequests, action.channelId],
        },
        event,
      );
    }

    case 'WITHDRAW_REQUEST': {
      const event = makeAudit({
        actor: action.actor,
        action: 'Request_withdrawn',
        resource: action.channelId,
        meta: { manual: true },
      });
      return appendAudit(
        {
          ...state,
          pendingRequests: state.pendingRequests.filter(
            (r) =>
              !(r.channelId === action.channelId && r.userId === action.actor),
          ),
          myPendingRequests: state.myPendingRequests.filter(
            (id) => id !== action.channelId,
          ),
        },
        event,
      );
    }

    case 'APPROVE_REQUEST': {
      const request = state.pendingRequests.find(
        (r) => r.id === action.requestId,
      );
      if (!request) return state;
      const event = makeAudit({
        actor: action.actor,
        action: 'Request_approved',
        resource: request.channelId,
        meta: { requester: request.userId },
      });
      return appendAudit(
        {
          ...state,
          pendingRequests: state.pendingRequests.filter(
            (r) => r.id !== action.requestId,
          ),
        },
        event,
      );
    }

    case 'DENY_REQUEST': {
      const request = state.pendingRequests.find(
        (r) => r.id === action.requestId,
      );
      if (!request) return state;
      const event = makeAudit({
        actor: action.actor,
        action: 'Request_denied',
        resource: request.channelId,
        meta: {
          requester: request.userId,
          reason: action.reason || undefined,
        },
      });
      return appendAudit(
        {
          ...state,
          pendingRequests: state.pendingRequests.filter(
            (r) => r.id !== action.requestId,
          ),
        },
        event,
      );
    }

    case 'RESET':
      return makeInitialState();

    default:
      return state;
  }
}

export interface A2StoreApi extends A2State {
  targetChannel: ChannelFixture;
  openWizard: () => void;
  selectScope: (scope: ScopeChoice) => void;
  continueToStep2: () => void;
  backFromStep2A: () => void;
  backFromStep2B: () => void;
  confirmBackDiscard: () => void;
  dismissBackWarning: () => void;
  editRulesStep2B: (rules: AbacRule[]) => void;
  saveStep2A: () => void;
  saveStep2B: () => void;
  cancelDiscoverableFromBanner: () => void;
  abandonWizard: (via: 'cancel' | 'close-x' | 'tab-close') => void;
  disableDiscoverable: () => void;
  setSettingsTab: (tab: 'info' | 'access-control') => void;
  submitRequest: (
    channelId: string,
    actor: string,
    priorMembership: boolean,
  ) => void;
  withdrawRequest: (channelId: string, actor: string) => void;
  approveRequest: (requestId: string, actor: string) => void;
  denyRequest: (requestId: string, actor: string, reason: string) => void;
  reset: () => void;
}

export function useA2Store(): A2StoreApi {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  const api = useMemo<Omit<A2StoreApi, keyof A2State | 'targetChannel'>>(
    () => ({
      openWizard: () => dispatch({ type: 'OPEN_WIZARD' }),
      selectScope: (scope) => dispatch({ type: 'SELECT_SCOPE', scope }),
      continueToStep2: () => dispatch({ type: 'CONTINUE_TO_STEP2' }),
      backFromStep2A: () => dispatch({ type: 'BACK_FROM_STEP2A' }),
      backFromStep2B: () => dispatch({ type: 'BACK_FROM_STEP2B' }),
      confirmBackDiscard: () => dispatch({ type: 'CONFIRM_BACK_DISCARD' }),
      dismissBackWarning: () => dispatch({ type: 'DISMISS_BACK_WARNING' }),
      editRulesStep2B: (rules) =>
        dispatch({ type: 'EDIT_RULES_STEP2B', rules }),
      saveStep2A: () => dispatch({ type: 'SAVE_STEP2A' }),
      saveStep2B: () => dispatch({ type: 'SAVE_STEP2B' }),
      cancelDiscoverableFromBanner: () =>
        dispatch({ type: 'CANCEL_DISCOVERABLE_FROM_BANNER' }),
      abandonWizard: (via) => dispatch({ type: 'ABANDON_WIZARD', via }),
      disableDiscoverable: () => dispatch({ type: 'DISABLE_DISCOVERABLE' }),
      setSettingsTab: (tab) => dispatch({ type: 'SET_SETTINGS_TAB', tab }),
      submitRequest: (channelId, actor, priorMembership) =>
        dispatch({
          type: 'SUBMIT_REQUEST',
          channelId,
          actor,
          priorMembership,
        }),
      withdrawRequest: (channelId, actor) =>
        dispatch({ type: 'WITHDRAW_REQUEST', channelId, actor }),
      approveRequest: (requestId, actor) =>
        dispatch({ type: 'APPROVE_REQUEST', requestId, actor }),
      denyRequest: (requestId, actor, reason) =>
        dispatch({ type: 'DENY_REQUEST', requestId, actor, reason }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [],
  );

  return useMemo(
    () => ({ ...state, targetChannel: TARGET_CHANNEL, ...api }),
    [state, api],
  );
}

export { TARGET_CHANNEL };

// Re-export AbacRule from shared so per-screen files can import only from
// the local store module if convenient.
export type { AbacRule };
