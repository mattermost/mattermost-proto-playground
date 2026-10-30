import { useCallback, useMemo, useState } from 'react';
import {
  MAX_PARTICIPANTS,
  type CallContext,
  type CallNotice,
  type CallPane,
  type CallPhase,
  type CallSurface,
  type JoinMode,
  type MediaPrefs,
  type StageView,
  type VideoParticipant,
} from '@/types/videoCall';
import { ROSTER, SELF_ID } from './videoCallsData';
import {
  DEMO_SCENES,
  joinModeFor,
  phaseAvailable,
  surfaceAvailable,
  type DemoSceneId,
} from './videoCalls.scenes';

export interface VideoCallState {
  /** Where the conversation is: 1:1 DM, group DM, or channel. */
  callContext: CallContext;
  /** Where the user is in the call lifecycle. */
  phase: CallPhase;
  /** Widget (small card over the sidebar) or the expanded window. */
  surface: CallSurface;
  joinMode: JoinMode;
  media: MediaPrefs;
  /** Participants in the call (2 = the 1:1 baseline). Clamped to 2..MAX_PARTICIPANTS. */
  count: number;
  /** Per-participant overrides applied on top of ROSTER (talking, muted, hand, ...). */
  overrides: Record<string, Partial<VideoParticipant>>;
  view: StageView;
  pane: CallPane;
  handRaised: boolean;
  sharing: boolean;
  notices: CallNotice[];
  callStartedAt: number | null;
  /** Seconds of the last finished call; the chat shows a "Call ended" post. */
  endedDurationSec: number;
  /** Set when an incoming call rang out; the DM shows a missed-call post. */
  missedCall: boolean;
  soundOn: boolean;
}

/** A group/channel call defaults to a few people so layouts beyond 1:1 show up. */
const DEFAULT_GROUP_COUNT = 4;

const INITIAL_STATE: VideoCallState = {
  callContext: 'dm',
  phase: 'idle',
  surface: 'widget',
  joinMode: 'start',
  media: { micOn: true, cameraOn: true, useWebcam: false },
  count: 2,
  overrides: {},
  view: 'speaker',
  pane: null,
  handRaised: false,
  sharing: false,
  notices: [],
  callStartedAt: null,
  endedDurationSec: 0,
  missedCall: false,
  soundOn: false,
};

let noticeSeq = 0;

function clampCount(count: number) {
  return Math.min(MAX_PARTICIPANTS, Math.max(2, Math.round(count)));
}

/** Count that matches the context: DMs are always 1:1. */
function countFor(context: CallContext, current: number) {
  if (context === 'dm') return 2;
  return current >= 3 ? current : DEFAULT_GROUP_COUNT;
}

/** Fields that reset whenever a call ends or is abandoned. */
const CALL_RESET: Partial<VideoCallState> = {
  phase: 'idle',
  surface: 'widget',
  sharing: false,
  handRaised: false,
  pane: null,
  callStartedAt: null,
};

export function useVideoCallState() {
  const [state, setState] = useState<VideoCallState>(INITIAL_STATE);

  const patch = useCallback((next: Partial<VideoCallState>) => {
    setState((s) => ({ ...s, ...next }));
  }, []);

  /** Roster slice for the current count with overrides and self media applied. */
  const participants = useMemo<VideoParticipant[]>(() => {
    return ROSTER.slice(0, state.count).map((p) => {
      const merged = { ...p, ...state.overrides[p.id] };
      if (p.id === SELF_ID) {
        return {
          ...merged,
          muted: !state.media.micOn,
          cameraOn: state.media.cameraOn,
          handRaised: state.handRaised,
          sharing: state.sharing,
        };
      }
      return merged;
    });
  }, [
    state.count,
    state.overrides,
    state.media,
    state.handRaised,
    state.sharing,
  ]);

  const actions = useMemo(
    () => ({
      patch,

      // --- Prototype chrome (demo axes) ---------------------------------
      /** Switch the conversation. Ends any call that cannot exist there. */
      setContext: (context: CallContext) =>
        setState((s) => {
          const keepPhase = phaseAvailable(context, s.phase);
          return {
            ...s,
            callContext: context,
            count: countFor(context, s.count),
            joinMode: joinModeFor(context),
            ...(keepPhase ? {} : CALL_RESET),
          };
        }),
      /** Jump to a phase (chrome switcher). Sets the state a real flow would. */
      setPhase: (phase: CallPhase) =>
        setState((s) => {
          if (!phaseAvailable(s.callContext, phase)) return s;
          const surface = surfaceAvailable(phase, s.surface)
            ? s.surface
            : 'widget';
          return {
            ...s,
            phase,
            surface,
            joinMode: joinModeFor(s.callContext),
            callStartedAt: phase === 'active' ? Date.now() : null,
            sharing: phase === 'active' ? s.sharing : false,
            pane: phase === 'active' ? s.pane : null,
            missedCall: false,
          };
        }),
      setSurface: (surface: CallSurface) =>
        setState((s) =>
          surfaceAvailable(s.phase, surface) ? { ...s, surface } : s,
        ),
      /** Named combination (walkthrough, tests). */
      goToDemo: (id: DemoSceneId) =>
        setState((s) => {
          const demo = DEMO_SCENES.find((d) => d.id === id);
          if (!demo) return s;
          return {
            ...s,
            callContext: demo.context,
            count: countFor(demo.context, s.count),
            joinMode: joinModeFor(demo.context),
            phase: demo.phase,
            surface: demo.surface,
            sharing: Boolean(demo.sharing),
            pane: null,
            missedCall: false,
            callStartedAt: demo.phase === 'active' ? Date.now() : null,
          };
        }),
      /** Prototype-chrome control: set the number of people (2..MAX_PARTICIPANTS). */
      setCount: (count: number) =>
        setState((s) => ({ ...s, count: clampCount(count) })),

      // --- Real flow -------------------------------------------------------
      /** Header "Start call" / banner "Join": opens the widget at pre-join. */
      startCall: () =>
        setState((s) => ({
          ...s,
          phase: 'pre-join',
          surface: 'widget',
          joinMode: joinModeFor(s.callContext),
          missedCall: false,
          endedDurationSec: 0,
        })),
      /** Pre-join primary action: a 1:1 call rings; group/channel joins directly. */
      confirmPreJoin: () =>
        setState((s) =>
          s.callContext === 'dm'
            ? { ...s, phase: 'calling' }
            : { ...s, phase: 'active', callStartedAt: Date.now() },
        ),
      /** Calling answered (or a demo shortcut): the call is live. */
      connect: () =>
        setState((s) => ({ ...s, phase: 'active', callStartedAt: Date.now() })),
      /** Cancel pre-join or an outgoing ring: back to the chat. */
      cancelCall: () => setState((s) => ({ ...s, ...CALL_RESET })),
      /** Incoming card: Accept enters the live call in the same widget. */
      accept: (opts?: { audioOnly?: boolean }) =>
        setState((s) => ({
          ...s,
          phase: 'active',
          surface: 'widget',
          callStartedAt: Date.now(),
          media: opts?.audioOnly ? { ...s.media, cameraOn: false } : s.media,
        })),
      /** Incoming card: Decline returns to the chat with no missed-call post. */
      decline: () => setState((s) => ({ ...s, ...CALL_RESET })),
      /** Incoming call rang out: the chat gets a missed-call post. */
      missIncoming: () =>
        setState((s) => ({ ...s, ...CALL_RESET, missedCall: true })),
      expand: () => setState((s) => ({ ...s, surface: 'window' })),
      collapse: () =>
        setState((s) => ({ ...s, surface: 'widget', pane: null })),
      /** Hang up: back to the chat; the chat's call post is the only end UI. */
      leave: () =>
        setState((s) => ({
          ...s,
          ...CALL_RESET,
          endedDurationSec: s.callStartedAt
            ? Math.max(1, Math.round((Date.now() - s.callStartedAt) / 1000))
            : 0,
        })),

      // --- In-call ---------------------------------------------------------
      toggleMic: () =>
        setState((s) => ({
          ...s,
          media: { ...s.media, micOn: !s.media.micOn },
        })),
      toggleCamera: () =>
        setState((s) => ({
          ...s,
          media: { ...s.media, cameraOn: !s.media.cameraOn },
        })),
      setMedia: (next: Partial<MediaPrefs>) =>
        setState((s) => ({ ...s, media: { ...s.media, ...next } })),
      toggleHand: () => setState((s) => ({ ...s, handRaised: !s.handRaised })),
      toggleShare: () => setState((s) => ({ ...s, sharing: !s.sharing })),
      setView: (view: StageView) => setState((s) => ({ ...s, view })),
      togglePane: (pane: Exclude<CallPane, null>) =>
        setState((s) => ({ ...s, pane: s.pane === pane ? null : pane })),
      closePane: () => setState((s) => ({ ...s, pane: null })),
      patchParticipant: (id: string, next: Partial<VideoParticipant>) =>
        setState((s) => ({
          ...s,
          overrides: { ...s.overrides, [id]: { ...s.overrides[id], ...next } },
        })),
      pushNotice: (notice: Omit<CallNotice, 'id'>) =>
        setState((s) => ({
          ...s,
          notices: [...s.notices, { ...notice, id: `notice-${++noticeSeq}` }],
        })),
      dismissNotice: (id: string) =>
        setState((s) => ({
          ...s,
          notices: s.notices.filter((n) => n.id !== id),
        })),
      setSoundOn: (soundOn: boolean) => setState((s) => ({ ...s, soundOn })),
      reset: () => setState(INITIAL_STATE),
    }),
    [patch],
  );

  return { state, participants, actions };
}

export type VideoCallActions = ReturnType<typeof useVideoCallState>['actions'];
