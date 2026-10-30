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
import { DM_PEER_ID, ROSTER, SELF_ID } from './videoCallsData';
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
  /** Participants a host removed from the call (cleared when the count is set). */
  removedIds: string[];
  view: StageView;
  pane: CallPane;
  handRaised: boolean;
  sharing: boolean;
  /** Mock call recording (shows the REC pill in the window, a dot in the widget). */
  recording: boolean;
  /** Call info: whether external participants may join (mock toggle). */
  externalEnabled: boolean;
  notices: CallNotice[];
  callStartedAt: number | null;
  /** Seconds of the last finished call; the chat shows a "Call ended" post. */
  endedDurationSec: number;
  /** When the last call ended (ms), for the "Ended at …" call card. */
  endedAt: number | null;
  /** Recordings started during the current / last call (the ended card lists them). */
  recordingsMade: number;
  /** Who started the current / last call (the call card's author). */
  callerId: string;
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
  media: { micOn: true, cameraOn: false, useWebcam: false },
  count: 2,
  overrides: {},
  removedIds: [],
  view: 'speaker',
  pane: null,
  handRaised: false,
  sharing: false,
  recording: false,
  externalEnabled: false,
  notices: [],
  callStartedAt: null,
  endedDurationSec: 0,
  endedAt: null,
  recordingsMade: 0,
  callerId: SELF_ID,
  missedCall: false,
  soundOn: true,
};

let noticeSeq = 0;
const MAX_NOTICES = 3;

function clampCount(count: number) {
  return Math.min(MAX_PARTICIPANTS, Math.max(2, Math.round(count)));
}

/** Count that matches the context: DMs are always 1:1. */
function countFor(context: CallContext, current: number) {
  if (context === 'dm') return 2;
  return current >= 3 ? current : DEFAULT_GROUP_COUNT;
}

/** Per-call state that never carries over into a new call. */
const PER_CALL_RESET: Partial<VideoCallState> = {
  recording: false,
  handRaised: false,
  removedIds: [],
  overrides: {},
  notices: [],
};

/** Fields that reset whenever a call ends or is abandoned. */
const CALL_RESET: Partial<VideoCallState> = {
  ...PER_CALL_RESET,
  phase: 'idle',
  surface: 'widget',
  sharing: false,
  pane: null,
  callStartedAt: null,
};

/** The webcam is released with the call; the next call starts camera-off. */
function releaseCamera(media: MediaPrefs): MediaPrefs {
  return { ...media, cameraOn: false, useWebcam: false };
}

/** A call ended or was abandoned: reset call fields and release the webcam. */
function endCall(s: VideoCallState): VideoCallState {
  return { ...s, ...CALL_RESET, media: releaseCamera(s.media) };
}

export function useVideoCallState() {
  const [state, setState] = useState<VideoCallState>(INITIAL_STATE);

  const patch = useCallback((next: Partial<VideoCallState>) => {
    setState((s) => ({ ...s, ...next }));
  }, []);

  /** Roster slice for the current count with overrides and self media applied. */
  const participants = useMemo<VideoParticipant[]>(() => {
    return ROSTER.slice(0, state.count)
      .filter((p) => !state.removedIds.includes(p.id))
      .map((p) => {
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
    state.removedIds,
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
            ...(keepPhase
              ? {}
              : { ...CALL_RESET, media: releaseCamera(s.media) }),
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
            ...PER_CALL_RESET,
            media: phase === 'idle' ? releaseCamera(s.media) : s.media,
            phase,
            surface,
            joinMode: joinModeFor(s.callContext),
            callStartedAt: phase === 'active' ? Date.now() : null,
            sharing: phase === 'active' ? s.sharing : false,
            pane: phase === 'active' ? s.pane : null,
            missedCall: false,
            endedAt: null,
            recordingsMade: 0,
            callerId: phase === 'incoming' ? DM_PEER_ID : s.callerId,
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
            ...PER_CALL_RESET,
            media: demo.phase === 'idle' ? releaseCamera(s.media) : s.media,
            callContext: demo.context,
            count: countFor(demo.context, s.count),
            joinMode: joinModeFor(demo.context),
            phase: demo.phase,
            surface: demo.surface,
            sharing: Boolean(demo.sharing),
            pane: null,
            missedCall: false,
            endedAt: null,
            recordingsMade: 0,
            callerId: demo.phase === 'incoming' ? DM_PEER_ID : SELF_ID,
            callStartedAt: demo.phase === 'active' ? Date.now() : null,
          };
        }),
      /** Prototype-chrome control: set the number of people (2..MAX_PARTICIPANTS). */
      setCount: (count: number) =>
        setState((s) => ({ ...s, count: clampCount(count), removedIds: [] })),

      // --- Real flow -------------------------------------------------------
      /** Header "Start call" / banner "Join": opens the widget at pre-join. */
      startCall: (opts?: { audioOnly?: boolean }) =>
        setState((s) => ({
          ...s,
          ...PER_CALL_RESET,
          phase: 'pre-join',
          surface: 'widget',
          joinMode: joinModeFor(s.callContext),
          missedCall: false,
          endedDurationSec: 0,
          endedAt: null,
          recordingsMade: 0,
          callerId: SELF_ID,
          // Audio-only starts with the camera off (and releases the webcam).
          media: opts?.audioOnly ? releaseCamera(s.media) : s.media,
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
      cancelCall: () => setState(endCall),
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
      decline: () => setState(endCall),
      /** Incoming call rang out: the chat gets a missed-call post. */
      missIncoming: () =>
        setState((s) => ({ ...endCall(s), missedCall: true })),
      expand: () => setState((s) => ({ ...s, surface: 'window' })),
      collapse: () =>
        setState((s) => ({ ...s, surface: 'widget', pane: null })),
      /** Hang up: back to the chat; the chat's call post is the only end UI. */
      leave: () =>
        setState((s) => ({
          ...endCall(s),
          endedDurationSec: s.callStartedAt
            ? Math.max(1, Math.round((Date.now() - s.callStartedAt) / 1000))
            : 0,
          endedAt: s.callStartedAt ? Date.now() : s.endedAt,
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
      /** Mock recording toggle; also posts a notice like the real product would. */
      toggleRecording: () =>
        setState((s) => {
          const recording = !s.recording;
          return {
            ...s,
            recording,
            recordingsMade: recording ? s.recordingsMade + 1 : s.recordingsMade,
            notices: [
              ...s.notices,
              {
                id: `notice-${++noticeSeq}`,
                kind: 'recording' as const,
                text: recording ? 'Recording started' : 'Recording stopped',
              },
            ].slice(-MAX_NOTICES),
          };
        }),
      setExternalEnabled: (externalEnabled: boolean) =>
        setState((s) => ({ ...s, externalEnabled })),
      setView: (view: StageView) => setState((s) => ({ ...s, view })),
      togglePane: (pane: Exclude<CallPane, null>) =>
        setState((s) => ({ ...s, pane: s.pane === pane ? null : pane })),
      closePane: () => setState((s) => ({ ...s, pane: null })),
      /** Host control: remove someone from the call (mock). */
      removeParticipant: (id: string) =>
        setState((s) => ({
          ...s,
          removedIds: s.removedIds.includes(id)
            ? s.removedIds
            : [...s.removedIds, id],
        })),
      /** Host control: hand the host role to someone else (mock). */
      makeHost: (id: string) =>
        setState((s) => ({
          ...s,
          overrides: {
            ...s.overrides,
            [SELF_ID]: { ...s.overrides[SELF_ID], host: false },
            [id]: { ...s.overrides[id], host: true },
          },
        })),
      patchParticipant: (id: string, next: Partial<VideoParticipant>) =>
        setState((s) => ({
          ...s,
          overrides: { ...s.overrides, [id]: { ...s.overrides[id], ...next } },
        })),
      pushNotice: (notice: Omit<CallNotice, 'id'>) =>
        setState((s) => ({
          ...s,
          // Keep the stack short: rapid changes (e.g. the People stepper) would
          // otherwise bury the tiles under join/leave toasts.
          notices: [
            ...s.notices,
            { ...notice, id: `notice-${++noticeSeq}` },
          ].slice(-MAX_NOTICES),
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
